import { randomUUID } from "crypto";
import OrchestraCard from "./models/OrchestraCard.model.js";
import Card from "../cards/models/Card.model.js";
import CardBalance from "../cards/models/CardBalance.model.js";
import Transaction from "../transactions/models/Transaction.model.js";
import { maskPan } from "../../shared/utils/formatters.js";
import { withTransaction } from "../../shared/database/transaction.js";
import { card360 } from "../cards/providers/card360.provider.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../shared/errors/httpErrors.js";

async function getOrCreateOrchestraCard(userId) {
  let card = await OrchestraCard.findOne({ userId })
    .populate("cardId selectedFundingSourceId")
    .lean();

  if (card) return card;

  const firstCard = await Card.findOne({ userId, cardStatus: "1" })
    .sort({ createdAt: 1 })
    .lean();
  if (!firstCard) {
    throw new NotFoundError(
      "Orchestra Card not found — add a bank card first to enable payment orchestration",
    );
  }

  try {
    await OrchestraCard.create({
      userId,
      cardId: firstCard._id,
      selectedFundingSourceId: firstCard._id,
      status: "ACTIVE",
    });
  } catch (createErr) {
    if (createErr?.code !== 11000) throw createErr;
  }

  return OrchestraCard.findOne({ userId })
    .populate("cardId selectedFundingSourceId")
    .lean();
}

async function getRawOrchestraCard(userId) {
  let card = await OrchestraCard.findOne({ userId }).lean();
  if (card) return card;

  const firstCard = await Card.findOne({ userId, cardStatus: "1" })
    .sort({ createdAt: 1 })
    .lean();
  if (!firstCard) {
    throw new NotFoundError(
      "Orchestra Card not found — add a bank card first to enable payment orchestration",
    );
  }

  try {
    await OrchestraCard.create({
      userId,
      cardId: firstCard._id,
      selectedFundingSourceId: firstCard._id,
      status: "ACTIVE",
    });
  } catch (createErr) {
    if (createErr?.code !== 11000) throw createErr;
  }

  return OrchestraCard.findOne({ userId }).lean();
}

/**
 * Get the user's Orchestra Card.
 */
export async function getOrchestraCard(userId) {
  const card = await getOrCreateOrchestraCard(userId);
  return {
    ...card,
    cardId: card.cardId
      ? { ...card.cardId, maskedPan: maskPan(card.cardId.pan) }
      : null,
    selectedFundingSourceId: card.selectedFundingSourceId
      ? {
          ...card.selectedFundingSourceId,
          maskedPan: maskPan(card.selectedFundingSourceId.pan),
        }
      : null,
  };
}

/**
 * Get funding sources for the user's Orchestra Card.
 */
export async function getFundingSources(userId) {
  const orchestraCard = await getRawOrchestraCard(userId);

  const cards = await Card.find({ userId, cardStatus: "1" }).lean();
  if (!cards.length) return [];

  const pans = cards.map((c) => c.pan);
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

  const cachedBalances = await CardBalance.find({
    pan: { $in: pans },
    fetchedAt: { $gte: fiveMinsAgo },
  })
    .sort({ fetchedAt: -1 })
    .lean();

  const cachedMap = new Map();
  for (const cb of cachedBalances) {
    if (!cachedMap.has(cb.pan)) cachedMap.set(cb.pan, cb);
  }

  const resolved = await Promise.all(
    cards.map(async (c) => {
      const cached = cachedMap.get(c.pan);

      const bal = cached
        ? {
            availableBalance: cached.availableBalance,
            ledgerBalance: cached.ledgerBalance,
            currency: cached.currency,
          }
        : await card360.getBalance(c.pan, c.cardType).then(async (res) => {
            if (res.availableBalance !== undefined) {
              await CardBalance.findOneAndUpdate(
                { pan: c.pan },
                {
                  cardId: c._id,
                  availableBalance: res.availableBalance,
                  ledgerBalance: res.ledgerBalance,
                  currency: res.currency || "NGN",
                  responseCode: res.code || "00",
                  responseDescription: res.description || "Successful",
                  fetchedAt: new Date(),
                },
                { upsert: true },
              );
            }
            return res;
          });

      return {
        _id: c._id,
        label: c.label || c.bank || "Account",
        bank: c.bank,
        cardProgram: c.cardProgram,
        color: c.color,
        pan: maskPan(c.pan),
        availableBalance: Math.max(0, bal.availableBalance ?? 0),
        isSelected:
          String(c._id) === String(orchestraCard.selectedFundingSourceId),
      };
    }),
  );

  return resolved;
}

/**
 * Select a funding source for the Orchestra Card.
 */
export async function selectFundingSource(userId, fundingSourceId) {
  const orchestraCard = await getOrCreateOrchestraCard(userId);

  const sourceCard = await Card.findOne({
    _id: fundingSourceId,
    userId,
    cardStatus: "1",
  }).lean();
  if (!sourceCard) {
    throw new NotFoundError(
      "Funding source not found, inactive, or does not belong to you",
    );
  }

  await OrchestraCard.findByIdAndUpdate(orchestraCard._id, {
    selectedFundingSourceId: fundingSourceId,
  });

  return {
    ...orchestraCard,
    selectedFundingSourceId: {
      ...sourceCard,
      maskedPan: maskPan(sourceCard.pan),
    },
  };
}

/**
 * Route a payment through the Orchestra Card to the selected funding source.
 *
 * Steps:
 *   1. Identify the Orchestra Card.
 *   2. Resolve its active funding source.
 *   3. Verify the funding source belongs to the current user.
 *   4. Retrieve the current mock balance.
 *   5. Validate the amount.
 *   6. Check sufficient funds.
 *   7. Deduct the amount.
 *   8. Create a transaction record.
 *   9. Return the result.
 */
export async function routePayment(
  userId,
  { amount, merchant, category, narration },
) {
  const orchestraCard = await getRawOrchestraCard(userId);
  if (orchestraCard.status !== "ACTIVE")
    throw new BadRequestError("Orchestra Card is not active");

  if (!orchestraCard.selectedFundingSourceId) {
    throw new BadRequestError(
      "No funding source selected for this Orchestra Card",
    );
  }
  const fundingSourceId = orchestraCard.selectedFundingSourceId;

  const fundingSourceCard = await Card.findOne({
    _id: fundingSourceId,
    userId,
    cardStatus: "1",
  }).lean();
  if (!fundingSourceCard) {
    throw new NotFoundError(
      "Funding source not found, inactive, or does not belong to you",
    );
  }

  const balanceRecord = await CardBalance.findOne({ cardId: fundingSourceId })
    .sort({ fetchedAt: -1 })
    .lean();
  const availableBalance = Math.max(0, balanceRecord?.availableBalance ?? 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestError("Amount must be greater than zero");
  }

  if (availableBalance < amount) {
    return {
      success: false,
      reason: "Insufficient funds",
      fundingSourceName:
        fundingSourceCard.bank || fundingSourceCard.label || "Selected Account",
      availableBalance,
      requestedAmount: amount,
    };
  }

  return withTransaction(async (session) => {
    const sessionOpt = session ? { session } : {};

    await CardBalance.findOneAndUpdate(
      { cardId: fundingSourceId },
      {
        $inc: { availableBalance: -amount, ledgerBalance: -amount },
        $set: { fetchedAt: new Date() },
      },
      sessionOpt,
    );

    const updatedBalance = await CardBalance.findOne({
      cardId: fundingSourceId,
    })
      .sort({ fetchedAt: -1 })
      .lean();

    const transaction = await Transaction.create(
      [
        {
          userId,
          orchestraCardId: orchestraCard._id,
          fundingSourceId,
          fundingSourceName:
            fundingSourceCard.bank ||
            fundingSourceCard.label ||
            "Selected Account",
          cardId: fundingSourceId,
          pan: fundingSourceCard.pan,
          amount,
          currency: "NGN",
          merchant: merchant || "Unknown Merchant",
          type: "card_payment",
          category: category || "card_payment",
          narration:
            narration ||
            `Orchestra Card payment to ${merchant || "Unknown Merchant"}`,
          reference: randomUUID(),
          responseCode: "00",
          transactionDate: new Date(),
          simulatedSplit: [{ cardId: fundingSourceId, amount }],
        },
      ],
      sessionOpt ? { session } : {},
    );

    const tx = transaction[0].toObject
      ? transaction[0].toObject()
      : transaction[0];
    const postBalance = Math.max(0, updatedBalance?.availableBalance ?? 0);

    return {
      success: true,
      transactionId: tx._id,
      reference: tx.reference,
      amount,
      currency: "NGN",
      merchant: merchant || "Unknown Merchant",
      fundingSourceId,
      fundingSourceName:
        fundingSourceCard.bank || fundingSourceCard.label || "Selected Account",
      maskedFundingSourcePan: maskPan(fundingSourceCard.pan),
      orchestraCardId: orchestraCard._id,
      balanceBefore: availableBalance,
      balanceAfter: postBalance,
      status: "COMPLETED",
    };
  });
}
