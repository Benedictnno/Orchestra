/**
 * Unit tests for the Orchestra Universal Card routing engine.
 */

import { jest } from "@jest/globals";

jest.unstable_mockModule("../../cards/models/Card.model.js", () => ({
  default: { findOne: jest.fn(), find: jest.fn() },
}));
jest.unstable_mockModule("../../cards/models/CardBalance.model.js", () => ({
  default: { findOne: jest.fn(), findOneAndUpdate: jest.fn() },
}));
jest.unstable_mockModule(
  "../../transactions/models/Transaction.model.js",
  () => ({
    default: { create: jest.fn() },
  }),
);
jest.unstable_mockModule("../models/OrchestraCard.model.js", () => ({
  default: {
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));
jest.unstable_mockModule(
  "../../shared/database/transaction.js",
  () => ({
    withTransaction: jest.fn((fn) => fn(null)),
  }),
  { virtual: true },
);

const Card = await import("../../cards/models/Card.model.js");
const CardBalance = await import("../../cards/models/CardBalance.model.js");
const Transaction =
  await import("../../transactions/models/Transaction.model.js");
const OrchestraCard = await import("../models/OrchestraCard.model.js");
const { withTransaction } =
  await import("../../shared/database/transaction.js");
const {
  getOrchestraCard,
  getFundingSources,
  selectFundingSource,
  routePayment,
} = await import("../orchestration.service.js");

const aliceId = "alice_id";
const bobId = "bob_id";
const orcId = "orc_1";
const sourceId = "source_1";
const amount = 500000; // ₦5,000 in kobo

const makeCard = (
  id,
  bank,
  balance,
  userId = aliceId,
  status = "1",
  color = "#4A90e2",
  pan = `PAN_${id}`,
) => ({
  _id: id,
  pan,
  bank,
  label: bank,
  color,
  cardStatus: status,
  userId,
  cardType: "debit",
  cardProgram: "VERVE",
  availableBalance: balance,
  toObject: function () {
    return { ...this };
  },
});

const makeBalance = (cardId, availableBalance) => ({
  _id: `bal_${cardId}`,
  cardId,
  pan: `PAN_${cardId}`,
  availableBalance,
  ledgerBalance: availableBalance,
  currency: "NGN",
  toObject: function () {
    return { ...this };
  },
});

const makeOrchestraCard = (
  id,
  userId,
  cardId,
  selectedFundingSourceId = null,
  status = "ACTIVE",
) => ({
  _id: id,
  userId,
  cardId,
  selectedFundingSourceId,
  status,
  toObject: function () {
    return { ...this };
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  withTransaction.mockImplementation((fn) => fn(null));
});

// Helper: chainable Mongoose query mock with .lean(), .sort(), .populate()
function chainable(resolvedValue) {
  return {
    lean: jest.fn().mockResolvedValue(resolvedValue),
    sort: jest
      .fn()
      .mockReturnValue({ lean: jest.fn().mockResolvedValue(resolvedValue) }),
    populate: jest
      .fn()
      .mockReturnValue({ lean: jest.fn().mockResolvedValue(resolvedValue) }),
  };
}

// Helper: chainable mock where .sort().lean() returns a different value than .lean()
function chainableWith(resolvedValue, sortedValue) {
  return {
    lean: jest.fn().mockResolvedValue(resolvedValue),
    sort: jest
      .fn()
      .mockReturnValue({ lean: jest.fn().mockResolvedValue(sortedValue) }),
    populate: jest
      .fn()
      .mockReturnValue({ lean: jest.fn().mockResolvedValue(resolvedValue) }),
  };
}

describe("getOrchestraCard", () => {
  test("returns the user Orchestra Card with masked PANs", async () => {
    const orchestraCard = makeOrchestraCard(
      "orc_1",
      aliceId,
      "card_1",
      "source_1",
    );
    const interfaceCard = makeCard(
      "card_1",
      "Orchestra",
      0,
      aliceId,
      "1",
      "#4A90e2",
      "4000123456789010",
    );
    const sourceCard = makeCard(
      "source_1",
      "Access Bank",
      8000000,
      aliceId,
      "1",
      "#4ECDC4",
      "4084729130487150",
    );

    OrchestraCard.default.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          ...orchestraCard,
          cardId: interfaceCard,
          selectedFundingSourceId: sourceCard,
        }),
      }),
    });

    const result = await getOrchestraCard(aliceId);

    expect(result._id).toBe("orc_1");
    expect(result.status).toBe("ACTIVE");
    expect(result.cardId).not.toBeNull();
    expect(result.cardId?.maskedPan).toBe("****-****-****-9010");
    expect(result.selectedFundingSourceId).not.toBeNull();
    expect(result.selectedFundingSourceId?.maskedPan).toBe(
      "****-****-****-7150",
    );
  });

  test("throws NotFoundError when no Orchestra Card exists", async () => {
    OrchestraCard.default.findOne.mockReturnValueOnce({
      populate: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    });
    OrchestraCard.default.findOne.mockReturnValueOnce({
      populate: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    });
    Card.default.findOne.mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    });

    await expect(getOrchestraCard(aliceId)).rejects.toThrow(/not found/i);
  });
});

describe("getFundingSources", () => {
  test("returns user cards with balances and marks selected source", async () => {
    const orchestraCard = makeOrchestraCard(
      "orc_1",
      aliceId,
      "card_1",
      "source_2",
    );
    const cards = [
      makeCard("source_1", "Access Bank", 8000000, aliceId),
      makeCard("source_2", "GTBank", 5000000, aliceId),
      makeCard("source_3", "UBA", 1000000, aliceId),
    ];

    OrchestraCard.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(orchestraCard),
    });
    Card.default.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(cards),
    });

    const sources = await getFundingSources(aliceId);

    expect(sources).toHaveLength(3);
    expect(sources[0].bank).toBe("Access Bank");
    expect(sources[0].availableBalance).toBe(8000000);
    expect(sources[0].isSelected).toBe(false);
    expect(sources[1].isSelected).toBe(true);
    expect(sources[1].bank).toBe("GTBank");
  });

  test("throws NotFoundError when no Orchestra Card exists", async () => {
    OrchestraCard.default.findOne.mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue(null),
    });
    Card.default.findOne.mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    });

    await expect(getFundingSources(aliceId)).rejects.toThrow(/not found/i);
  });
});

describe("selectFundingSource", () => {
  test("selects a funding source that belongs to the user", async () => {
    const orchestraCard = makeOrchestraCard(
      "orc_1",
      aliceId,
      "card_1",
      "source_1",
    );
    const sourceCard = makeCard("source_2", "GTBank", 5000000, aliceId);

    OrchestraCard.default.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          ...orchestraCard,
          selectedFundingSourceId: sourceCard,
        }),
      }),
    });
    Card.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(sourceCard),
    });
    OrchestraCard.default.findByIdAndUpdate.mockResolvedValue({});

    const result = await selectFundingSource(aliceId, "source_2");

    expect(OrchestraCard.default.findByIdAndUpdate).toHaveBeenCalledWith(
      "orc_1",
      { selectedFundingSourceId: "source_2" },
    );
    expect(result.selectedFundingSourceId._id).toBe("source_2");
  });

  test("throws NotFoundError when funding source does not belong to user", async () => {
    const orchestraCard = makeOrchestraCard(
      "orc_1",
      aliceId,
      "card_1",
      "source_1",
    );
    const otherUserCard = makeCard("other_source", "Wema Bank", 3500000, bobId);

    OrchestraCard.default.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          ...orchestraCard,
          selectedFundingSourceId: otherUserCard,
        }),
      }),
    });
    Card.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(selectFundingSource(aliceId, "other_source")).rejects.toThrow(
      /not belong/i,
    );
  });
});

describe("routePayment", () => {
  test("successful payment deducts balance and records transaction", async () => {
    const orchestraCard = makeOrchestraCard(
      orcId,
      aliceId,
      "card_1",
      sourceId,
      "ACTIVE",
    );
    const sourceCard = makeCard(
      sourceId,
      "Access Bank",
      8000000,
      aliceId,
      "1",
      "#4ECDC4",
      "4084729130487150",
    );
    const balanceBefore = makeBalance(sourceId, 8000000);
    const balanceAfter = makeBalance(sourceId, 7500000);

    OrchestraCard.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(orchestraCard),
    });
    Card.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(sourceCard),
    });
    const cbFindOneMock = chainableWith(balanceBefore, balanceAfter);
    CardBalance.default.findOne.mockImplementation(() => cbFindOneMock);
    CardBalance.default.findOneAndUpdate.mockResolvedValue({});
    Transaction.default.create.mockResolvedValue([
      {
        _id: "tx_1",
        reference: "REF123",
        toObject: () => ({ _id: "tx_1", reference: "REF123" }),
      },
    ]);

    const result = await routePayment(aliceId, {
      amount,
      merchant: "Demo Store",
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("COMPLETED");
    expect(result.amount).toBe(amount);
    expect(result.merchant).toBe("Demo Store");
    expect(result.fundingSourceName).toBe("Access Bank");
    expect(result.balanceBefore).toBe(8000000);
    expect(result.balanceAfter).toBe(7500000);
    expect(result.fundingSourceId).toBe(sourceId);
    expect(result.orchestraCardId).toBe(orcId);

    // Verify balance was deducted
    expect(CardBalance.default.findOneAndUpdate).toHaveBeenCalledWith(
      { cardId: sourceId },
      expect.objectContaining({
        $inc: { availableBalance: -amount, ledgerBalance: -amount },
      }),
      expect.any(Object),
    );

    const createdTxCall = Transaction.default.create.mock.calls[0][0];
    expect(createdTxCall).toBeInstanceOf(Array);
    expect(createdTxCall[0]).toMatchObject({
      type: "card_payment",
      userId: aliceId,
      orchestraCardId: orcId,
      fundingSourceId: sourceId,
      fundingSourceName: "Access Bank",
      amount,
      merchant: "Demo Store",
    });
  });

  test("fails with insufficient funds without deducting balance", async () => {
    const orchestraCard = makeOrchestraCard(
      orcId,
      aliceId,
      "card_1",
      sourceId,
      "ACTIVE",
    );
    const sourceCard = makeCard(
      sourceId,
      "GTBank",
      200000,
      aliceId,
      "1",
      "#FF6B35",
      "5061984021984419",
    );
    const balance = makeBalance(sourceId, 200000);

    OrchestraCard.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(orchestraCard),
    });
    Card.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(sourceCard),
    });
    CardBalance.default.findOne.mockImplementation(() => chainable(balance));

    const result = await routePayment(aliceId, {
      amount: 500000,
      merchant: "Demo Store",
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe("Insufficient funds");
    expect(result.fundingSourceName).toBe("GTBank");
    expect(result.availableBalance).toBe(200000);
    expect(result.requestedAmount).toBe(500000);

    expect(CardBalance.default.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Transaction.default.create).not.toHaveBeenCalled();
  });

  test("throws NotFoundError when Orchestra Card is inactive", async () => {
    const orchestraCard = makeOrchestraCard(
      orcId,
      aliceId,
      "card_1",
      sourceId,
      "INACTIVE",
    );

    OrchestraCard.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(orchestraCard),
    });

    await expect(
      routePayment(aliceId, { amount, merchant: "Demo Store" }),
    ).rejects.toThrow(/not active/i);
  });

  test("throws BadRequestError when no funding source is selected", async () => {
    const orchestraCard = makeOrchestraCard(
      orcId,
      aliceId,
      "card_1",
      null,
      "ACTIVE",
    );

    OrchestraCard.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(orchestraCard),
    });

    await expect(
      routePayment(aliceId, { amount, merchant: "Demo Store" }),
    ).rejects.toThrow(/no funding source selected/i);
  });

  test("throws NotFoundError when funding source does not belong to user", async () => {
    const orchestraCard = makeOrchestraCard(
      orcId,
      aliceId,
      "card_1",
      sourceId,
      "ACTIVE",
    );

    OrchestraCard.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(orchestraCard),
    });
    Card.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(
      routePayment(aliceId, { amount, merchant: "Demo Store" }),
    ).rejects.toThrow(/does not belong/i);
  });

  test("throws BadRequestError for zero or negative amount", async () => {
    const orchestraCard = makeOrchestraCard(
      orcId,
      aliceId,
      "card_1",
      sourceId,
      "ACTIVE",
    );
    const sourceCard = makeCard(sourceId, "Access Bank", 8000000, aliceId);

    OrchestraCard.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(orchestraCard),
    });
    Card.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(sourceCard),
    });
    CardBalance.default.findOne.mockImplementation(() =>
      chainable(makeBalance(sourceId, 8000000)),
    );

    await expect(
      routePayment(aliceId, { amount: 0, merchant: "Demo Store" }),
    ).rejects.toThrow(/greater than zero/i);

    await expect(
      routePayment(aliceId, { amount: -100, merchant: "Demo Store" }),
    ).rejects.toThrow(/greater than zero/i);
  });
});

describe("User isolation", () => {
  test("a user cannot select another user funding source", async () => {
    const orchestraCard = makeOrchestraCard(
      "orc_1",
      aliceId,
      "card_1",
      "alice_source",
    );
    const aliceSource = makeCard(
      "alice_source",
      "Access Bank",
      8000000,
      aliceId,
    );

    OrchestraCard.default.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          ...orchestraCard,
          selectedFundingSourceId: aliceSource,
        }),
      }),
    });
    Card.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    OrchestraCard.default.findByIdAndUpdate.mockResolvedValue({});

    await expect(selectFundingSource(aliceId, "bob_source")).rejects.toThrow(
      /not belong/i,
    );
  });

  test("a user cannot route payment through another user funding source", async () => {
    const orchestraCard = makeOrchestraCard(
      "orc_1",
      aliceId,
      "card_1",
      "alice_source",
    );

    OrchestraCard.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(orchestraCard),
    });
    Card.default.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(
      routePayment(aliceId, { amount: 1000, merchant: "Attacker" }),
    ).rejects.toThrow(/does not belong/i);
  });
});
