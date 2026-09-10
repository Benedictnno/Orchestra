import Chat from '../models/Chat.model.js'
import { createChatCompletion, MODELS } from './ai.service.js'
import { transactionsService } from '../../transactions/index.js'
import { getUserCards } from '../../cards/cards.service.js'
import { BadRequestError } from '../../../shared/errors/httpErrors.js'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = ['blue', 'emerald', 'rose', 'indigo', 'teal', 'amber', 'purple']

// ─────────────────────────────────────────────────────────────────────────────
// Analytics helpers (all arithmetic done in Node — LLM never computes)
// ─────────────────────────────────────────────────────────────────────────────

function stdDev(values) {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length)
}

function velocityStatus(amount, mean, sd) {
  if (amount > mean + sd * 1.2) return 'spike'
  if (amount > mean + sd * 0.4) return 'elevated'
  if (amount < mean - sd * 0.4) return 'optimal'
  return 'normal'
}

/**
 * Build the complete pre-computed financial snapshot.
 * The LLM receives this as context — it never does arithmetic.
 */
async function buildFinancialSnapshot(userId) {
  const now = Date.now()

  const [summary30, summary60, recentTxns, cards] = await Promise.all([
    transactionsService.getSpendingSummary(userId, 30).catch(() => ({
      totalSpent: 0, transactionCount: 0, subscriptionSpend: 0,
      anomalyCount: 0, byCategory: {}, topMerchants: [], dailySpend: {}
    })),
    transactionsService.getSpendingSummary(userId, 60).catch(() => ({ totalSpent: 0 })),
    transactionsService.getRecentTransactions(userId, 50).catch(() => []),
    getUserCards(userId).catch(() => []),
  ])

  // Balances
  const totalBalanceKobo = cards.reduce((acc, c) => acc + (c.availableBalance || 0), 0)
  const totalBalanceNaira = totalBalanceKobo / 100
  const bankNames = [...new Set(cards.map(c => c.bank).filter(Boolean))].join(', ') || 'No banks connected'

  // Spend figures
  const totalSpentNaira = (summary30.totalSpent || 0) / 100
  const priorPeriodSpent = ((summary60.totalSpent || 0) - (summary30.totalSpent || 0)) / 100
  // Only compute meaningful delta when prior period has >10% of current spend
  const benchmarkDeltaPct = priorPeriodSpent > totalSpentNaira * 0.1
    ? Number((((totalSpentNaira - priorPeriodSpent) / priorPeriodSpent) * 100).toFixed(1))
    : 0  // Insufficient history for meaningful comparison

  const dailyBurnNaira = Math.round(totalSpentNaira / 30)

  // Category breakdown
  const sortedCategories = Object.entries(summary30.byCategory || {})
    .map(([cat, amount], i) => ({
      category: cat,
      amount: Number(amount) / 100,
      percentage: totalSpentNaira > 0
        ? Number(((Number(amount) / 100) / totalSpentNaira * 100).toFixed(1))
        : 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount)

  // Weekly velocity buckets (W1=oldest, W4=most recent)
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const weekBuckets = [0, 0, 0, 0]
  for (const [dateStr, kobo] of Object.entries(summary30.dailySpend || {})) {
    const ageMs = now - new Date(dateStr).getTime()
    const weekIdx = Math.min(3, Math.floor(ageMs / weekMs))
    weekBuckets[3 - weekIdx] += Number(kobo) / 100
  }

  const bucketMean = weekBuckets.reduce((a, b) => a + b, 0) / 4
  const bucketSd = stdDev(weekBuckets)

  const velocitySpikes = weekBuckets.map((amount, i) => {
    const prevAmount = i > 0 ? weekBuckets[i - 1] : amount
    const deltaPct = prevAmount > 0
      ? Number((((amount - prevAmount) / prevAmount) * 100).toFixed(0))
      : 0
    const status = velocityStatus(amount, bucketMean, bucketSd)
    return {
      period: `W${i + 1}`,
      amount: Math.round(amount),
      delta_pct: deltaPct,
      status,
      ...(status === 'spike' ? { flag: 'Spike detected' } : {}),
    }
  })

  // Health score
  const spikeCount = velocitySpikes.filter(v => v.status === 'spike').length
  const healthScore = Math.min(98, Math.max(45, Math.round(
    60 + (cards.length * 5) + (sortedCategories.length * 3)
      - (summary30.anomalyCount * 8) - (spikeCount * 5)
  )))
  const healthStatus = healthScore >= 85 ? 'Tier 1 Buffer Active'
    : healthScore >= 70 ? 'Moderate — Optimizable'
    : 'High Burn — Action Needed'

  // Flagged merchants
  const flaggedMerchants = recentTxns
    .filter(t => t.merchant || t.narration)
    .sort((a, b) => (b.isAnomaly ? 1 : 0) - (a.isAnomaly ? 1 : 0) || b.amount - a.amount)
    .slice(0, 3)
    .map(t => ({
      id: t._id?.toString() || `tx_${Math.random().toString(36).slice(2, 7)}`,
      name: t.merchant || t.narration || 'Transaction',
      amount: -(t.amount / 100),
      date: new Date(t.transactionDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }),
      category: t.category || 'other',
    }))

  // Scope label
  const scopeStart = new Date(now - 30 * 24 * 60 * 60 * 1000)
  const scopeEnd = new Date(now)
  const scopeLabel = `${scopeStart.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} – ${scopeEnd.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`

  // Top merchants text for LLM context
  const topMerchantsText = (summary30.topMerchants || []).slice(0, 5)
    .map(([m, v]) => `${m} (NGN ${Math.round(Number(v) / 100).toLocaleString()})`)
    .join(', ') || 'None'

  const txnLines = recentTxns.length
    ? recentTxns.map((t, i) => {
        const d = new Date(t.transactionDate)
        const dateStr = d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
        const flag = t.isAnomaly ? ' ⚠️ ANOMALY' : ''
        const desc = t.merchant ? `${t.merchant}${t.narration ? ` (${t.narration})` : ''}` : (t.narration || 'Unknown')
        return `  ${i + 1}. [${dateStr}] ${desc} | Category: ${t.category || 'other'} | Amount: NGN ${Math.round(t.amount / 100).toLocaleString()}${flag}`
      }).join('\n')
    : '  No recent transactions recorded.'

  return {
    summary: summary30, recentTxns, cards,
    totalBalanceNaira, totalSpentNaira, dailyBurnNaira,
    bankNames, sortedCategories, healthScore, healthStatus,
    benchmarkDeltaPct, velocitySpikes, flaggedMerchants,
    scopeLabel, txnLines, topMerchantsText,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic artifact builder
// Constructs the full FinancialArtifact from pre-computed data + LLM narrative.
// The LLM only writes the observation titles, detail text, and action labels.
// ─────────────────────────────────────────────────────────────────────────────

function buildArtifactFromSnapshot(snap, llmNarrative) {
  const {
    sortedCategories, healthScore, healthStatus, benchmarkDeltaPct,
    velocitySpikes, flaggedMerchants, scopeLabel, totalSpentNaira, dailyBurnNaira,
  } = snap

  // Use LLM observations if parseable from its response, else use defaults
  let observations = null
  let actionWorkflows = null

  try {
    // Try to extract JSON from LLM output (Layer 1: clean JSON)
    const parsed = JSON.parse(llmNarrative.trim())
    if (parsed.observations?.length >= 3) observations = parsed.observations
    if (parsed.action_workflows?.length) actionWorkflows = parsed.action_workflows
  } catch { /* try extraction */ }

  if (!observations) {
    try {
      // Layer 2: extract JSON block from mixed content
      const jsonMatch = llmNarrative.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0])
        if (extracted.observations?.length >= 3) observations = extracted.observations
        if (extracted.action_workflows?.length) actionWorkflows = extracted.action_workflows
      }
    } catch { /* use defaults */ }
  }

  // Layer 3: Default observations derived from pre-computed data
  if (!observations) {
    const top = sortedCategories[0]
    const sub = sortedCategories.find(c => c.category === 'subscriptions' || c.category === 'utilities')
    const spikes = velocitySpikes.filter(v => v.status === 'spike')
    const hasSavings = sortedCategories.find(c => c.category === 'savings')

    observations = [
      {
        type: 'behavioral',
        icon: '📊',
        title: top ? `${top.category.charAt(0).toUpperCase() + top.category.slice(1)} Dominates Spend` : 'Spending Pattern',
        detail: top
          ? `${top.category.charAt(0).toUpperCase() + top.category.slice(1)} accounts for ${top.percentage}% of your total outflow (NGN ${top.amount.toLocaleString()}).${spikes.length ? ` A velocity spike was detected in ${spikes.map(s => s.period).join(', ')}.` : ''}`
          : 'No dominant spend category detected this period.',
      },
      {
        type: 'efficiency',
        icon: '⚡',
        title: sub ? 'Consolidate Recurring Bills' : 'Subscription Efficiency',
        detail: sub
          ? `NGN ${sub.amount.toLocaleString()} in ${sub.category} — routing these through a dedicated virtual card can unlock 1.5%+ cashback.`
          : `Your daily burn velocity is NGN ${dailyBurnNaira.toLocaleString()}/day. Using a virtual card for recurring bills could reduce leakage.`,
      },
      {
        type: 'opportunity',
        icon: '💡',
        title: hasSavings ? 'Boost Your Savings Rate' : 'Yield Opportunity',
        detail: hasSavings
          ? `You're already saving NGN ${hasSavings.amount.toLocaleString()} (${hasSavings.percentage}%). Redirecting an extra NGN ${Math.round(dailyBurnNaira * 5).toLocaleString()}/week to a 4.8% APY Treasury Vault could compound meaningfully.`
          : `Capping ${top ? top.category : 'top'} spend by 15% frees up ~NGN ${top ? Math.round(top.amount * 0.15).toLocaleString() : '0'}/mo toward your emergency fund.`,
      },
    ]
  }

  // Default action workflows
  if (!actionWorkflows) {
    const topCategory = sortedCategories[0]?.category
    actionWorkflows = [
      {
        action_id: 'set_guardrail',
        label: topCategory
          ? `Activate ${topCategory.charAt(0).toUpperCase() + topCategory.slice(1)} Spend Guardrail`
          : 'Activate Spend Guardrail',
        style: 'primary',
        payload: topCategory ? { category: topCategory } : {},
      },
      {
        action_id: 'filter_transactions',
        label: 'Review Flagged Ledger',
        style: 'secondary',
      },
      {
        action_id: 'run_forecast',
        label: 'Run 90-Day Forecast',
        style: 'secondary',
      },
    ]
  }

  return {
    summary: {
      headline: `${healthStatus} · NGN ${Math.round(totalSpentNaira).toLocaleString()} 30-Day Outflow`,
      scope: scopeLabel,
      health_score: healthScore,
      health_status: healthStatus,
      benchmark_variance_pct: benchmarkDeltaPct,
    },
    spending_spectrum: sortedCategories,
    velocity_spikes: velocitySpikes,
    observations,
    flagged_merchants: flaggedMerchants,
    action_workflows: actionWorkflows,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Narrative system prompt (LLM writes text or observations, not raw numbers)
// ─────────────────────────────────────────────────────────────────────────────

function buildNarrativeSystemPrompt(snap) {
  const { cards, totalBalanceNaira, totalSpentNaira, dailyBurnNaira, bankNames,
    sortedCategories, healthScore, healthStatus, benchmarkDeltaPct,
    velocitySpikes, scopeLabel, txnLines, topMerchantsText, summary } = snap

  const categoryText = sortedCategories.length
    ? sortedCategories.map(c => `  - ${c.category}: NGN ${c.amount.toLocaleString()} (${c.percentage}%)`).join('\n')
    : '  - No category data'

  const velocityText = velocitySpikes.map(v =>
    `  ${v.period}: NGN ${v.amount.toLocaleString()} [${v.status}${v.delta_pct !== 0 ? `, ${v.delta_pct > 0 ? '+' : ''}${v.delta_pct}%` : ''}]`
  ).join('\n')

  return `You are Orchestra — an intelligent financial copilot for Nigerian multi-bank users.
You speak with sharp intelligence, warmth, clarity, and precision. Currency is always NGN (Nigerian Naira / ₦).

## LIVE FINANCIAL SNAPSHOT (Exact live figures — do not invent or recalculate):
- Period: ${scopeLabel}
- Connected Cards: ${cards.length} (${bankNames})
- Liquid Balance: NGN ${Math.round(totalBalanceNaira).toLocaleString()}
- 30-Day Outflow: NGN ${Math.round(totalSpentNaira).toLocaleString()} (${summary.transactionCount} transactions)
- Daily Burn Velocity: NGN ${dailyBurnNaira.toLocaleString()}/day
- Subscription Spend: NGN ${Math.round((summary.subscriptionSpend || 0) / 100).toLocaleString()}
- Anomalies Flagged: ${summary.anomalyCount}
- Financial Health Score: ${healthScore}/100 (${healthStatus})
- Benchmark Delta: ${benchmarkDeltaPct > 0 ? '+' : ''}${benchmarkDeltaPct}% vs prior 30 days
- Top Merchants: ${topMerchantsText}

## CATEGORY BREAKDOWN:
${categoryText}

## WEEKLY VELOCITY PATTERN:
${velocityText}

## RECENT TRANSACTION LEDGER (with dates, weekdays, descriptions, categories & amounts):
${txnLines}

## HOW TO RESPOND:
You MUST determine the user's intent and choose between TWO response modes:

### MODE 1: SIMPLE / CONVERSATIONAL / DIRECT QUERY (mode: "text")
Use this whenever the user asks:
- Specific transaction or recipient lookups (e.g., "how much did I send to Benedict this month", "what did I spend on Uber?", "did I send money to...")
- Balance inquiries, card inquiries, salary or subscription questions
- Quick calculations, single-category questions, greetings, or conversational questions
Respond with a direct, warm, concise, and helpful answer. Mention exact amounts (e.g. ₦500,000), days of the week, and dates based on the ledger above.
Format output as JSON:
{
  "mode": "text",
  "reply": "<Your direct, conversational answer with clear numbers and dates>"
}

### MODE 2: COMPREHENSIVE SPENDING ANALYSIS / AUDIT (mode: "artifact")
Use this ONLY when the user asks for a comprehensive spending analysis, financial overview, full breakdown, audit, or report (e.g. "Analyze this month's spending", "Give me a full financial report", "Audit my finances", "Spending breakdown").
Format output as JSON:
{
  "mode": "artifact",
  "intro_text": "<1-2 sentence executive overview summary>",
  "observations": [
    {
      "type": "behavioral",
      "icon": "<emoji>",
      "title": "<Specific title with merchant/category>",
      "detail": "<2-3 sentences citing specific merchants, amounts, and trends from the ledger>"
    },
    {
      "type": "efficiency",
      "icon": "<emoji>",
      "title": "<Specific efficiency opportunity>",
      "detail": "<2-3 sentences with concrete Naira savings and card routing opportunities>"
    },
    {
      "type": "opportunity",
      "icon": "<emoji>",
      "title": "<Specific yield / savings opportunity>",
      "detail": "<2-3 sentences on yield, vault, or budget optimization>"
    }
  ],
  "action_workflows": [
    { "action_id": "set_guardrail", "label": "<Specific label>", "style": "primary", "payload": { "category": "<category>", "limit": <number> } },
    { "action_id": "filter_transactions", "label": "<label>", "style": "secondary" },
    { "action_id": "run_forecast", "label": "Run 90-Day Forecast", "style": "secondary" }
  ]
}

ALWAYS respond ONLY with the JSON object.`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main chat handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Process a chat message with intent detection.
 * Supports multi-session conversations.
 * Returns either a direct conversational text reply or a structured financial artifact.
 */
export async function processChatMessage(userId, message, sessionId = null) {
  if (!message) throw new BadRequestError('Message is required')

  const snap = await buildFinancialSnapshot(userId)
  const systemPrompt = buildNarrativeSystemPrompt(snap)

  // Retrieve or initialize chat session
  let chat = null
  if (sessionId) {
    chat = await Chat.findOne({ _id: sessionId, userId })
  }
  if (!chat) {
    chat = await Chat.create({ userId, title: 'New Chat', messages: [] })
  }

  // Auto-generate title if this is the first message or default title
  if (!chat.title || chat.title === 'New Chat' || chat.messages.length === 0) {
    const cleanTitle = message.replace(/[^\w\s₦$]/gi, ' ').trim().replace(/\s+/g, ' ')
    if (cleanTitle) {
      chat.title = cleanTitle.length > 32 ? cleanTitle.slice(0, 32).trim() + '…' : cleanTitle
      chat.title = chat.title.charAt(0).toUpperCase() + chat.title.slice(1)
    }
  }

  // Determine intent heuristically as a fallback
  const msgLower = message.toLowerCase().trim()
  const isExplicitAnalysisRequest = /^(analyze|analyse|audit|break down|breakdown|spending report|overview|financial overview|full report)/i.test(msgLower)
    || msgLower.includes("analyze this month's spending")
    || msgLower.includes("analyse this month's spending")
    || msgLower.includes("analyze spending")
    || msgLower.includes("full analysis")

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chat.messages.slice(-10).map(m => {
      if (m.role === 'assistant') {
        try {
          const parsed = JSON.parse(m.content)
          if (parsed.reply) return { role: 'assistant', content: parsed.reply }
          if (parsed.summary?.headline) return { role: 'assistant', content: `[Financial Artifact: ${parsed.summary.headline} - Score ${parsed.summary.health_score}/100]` }
        } catch { /* normal text */ }
      }
      return { role: m.role, content: m.content }
    }),
    { role: 'user', content: message },
  ]

  // Call AI
  let llmContent = ''
  try {
    const response = await createChatCompletion({
      model: MODELS.PREMIUM,
      messages,
      temperature: 0.3,
      max_tokens: 1500,
    })
    llmContent = response.choices[0]?.message?.content || ''
  } catch (err) {
    console.warn('[Chat] LLM call failed:', err?.message)
  }

  // Parse LLM response
  let parsed = null
  try {
    parsed = JSON.parse(llmContent.trim())
  } catch {
    try {
      const match = llmContent.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    } catch { /* not JSON */ }
  }

  const isArtifactMode = (parsed?.mode === 'artifact' || (parsed?.observations && parsed.observations.length >= 2) || isExplicitAnalysisRequest) && parsed?.mode !== 'text'

  if (isArtifactMode) {
    // Build deterministic artifact (uses LLM narrative if parseable, pre-computed defaults otherwise)
    const artifact = buildArtifactFromSnapshot(snap, llmContent)
    const introText = parsed?.intro_text || null

    if (introText) {
      artifact.introText = introText
    }

    // Persist full assembled artifact JSON
    chat.messages.push({ role: 'user', content: message })
    chat.messages.push({ role: 'assistant', content: JSON.stringify(artifact) })
    if (chat.messages.length > 50) chat.messages = chat.messages.slice(-50)
    await chat.save()

    return {
      artifact,
      reply: introText,
      response: introText,
      history: chat.messages,
      sessionId: chat._id,
      title: chat.title,
      snapshot: {
        totalSpent: snap.totalSpentNaira,
        totalBalance: snap.totalBalanceNaira,
        cardCount: snap.cards.length,
        transactionCount: snap.summary.transactionCount,
        dailyBurn: snap.dailyBurnNaira,
        healthScore: snap.healthScore,
        categories: snap.sortedCategories,
      },
    }
  }

  // Mode: Text (conversational & direct answer)
  let textReply = parsed?.reply || parsed?.message || (typeof parsed === 'string' ? parsed : '')
  if (!textReply && llmContent) {
    textReply = llmContent.replace(/```json[\s\S]*?```/g, '').replace(/[\{\}]/g, '').trim() || llmContent.trim()
  }
  if (!textReply) {
    textReply = `I've reviewed your records. You currently have ${snap.cards.length} connected cards with a total balance of ₦${Math.round(snap.totalBalanceNaira).toLocaleString()} and ₦${Math.round(snap.totalSpentNaira).toLocaleString()} in total outflow over the past 30 days.`
  }

  chat.messages.push({ role: 'user', content: message })
  chat.messages.push({ role: 'assistant', content: textReply })
  if (chat.messages.length > 50) chat.messages = chat.messages.slice(-50)
  await chat.save()

  return {
    artifact: null,
    reply: textReply,
    response: textReply,
    history: chat.messages,
    sessionId: chat._id,
    title: chat.title,
    snapshot: {
      totalSpent: snap.totalSpentNaira,
      totalBalance: snap.totalBalanceNaira,
      cardCount: snap.cards.length,
      transactionCount: snap.summary.transactionCount,
      dailyBurn: snap.dailyBurnNaira,
      healthScore: snap.healthScore,
      categories: snap.sortedCategories,
    },
  }
}

/**
 * List all chat sessions for a user.
 */
export async function getChatSessions(userId) {
  const sessions = await Chat.find({ userId })
    .sort({ updatedAt: -1 })
    .select('_id title messages updatedAt createdAt')
    .lean()

  return {
    sessions: sessions.map(s => ({
      _id: s._id,
      title: s.title || 'New Chat',
      messageCount: s.messages?.length || 0,
      lastMessage: s.messages?.slice(-1)[0]?.content?.slice(0, 60) || '',
      updatedAt: s.updatedAt,
      createdAt: s.createdAt,
    }))
  }
}

/**
 * Retrieve a specific chat session or the most recent one.
 */
export async function getChatSession(userId, sessionId = null) {
  let chat = null
  if (sessionId) {
    chat = await Chat.findOne({ _id: sessionId, userId }).lean()
  } else {
    chat = await Chat.findOne({ userId }).sort({ updatedAt: -1 }).lean()
  }

  if (!chat) {
    return { session: null, history: [] }
  }

  return {
    session: {
      _id: chat._id,
      title: chat.title || 'New Chat',
      messages: chat.messages || [],
      updatedAt: chat.updatedAt,
      createdAt: chat.createdAt,
    },
    history: chat.messages || [],
  }
}

/**
 * Create a new blank chat session.
 */
export async function createChatSession(userId, initialTitle = 'New Chat') {
  const chat = await Chat.create({
    userId,
    title: initialTitle,
    messages: [],
  })

  return {
    _id: chat._id,
    title: chat.title,
    messages: [],
    updatedAt: chat.updatedAt,
    createdAt: chat.createdAt,
  }
}

/**
 * Delete a specific chat session.
 */
export async function deleteChatSession(userId, sessionId) {
  if (!sessionId) throw new BadRequestError('Session ID is required')
  await Chat.findOneAndDelete({ _id: sessionId, userId })
  return { message: 'Chat session deleted', sessionId }
}

/**
 * Retrieve chat history for a user (backward-compatible).
 */
export async function getChatHistory(userId, sessionId = null) {
  return getChatSession(userId, sessionId)
}

/**
 * Clear chat history for a user or session.
 */
export async function clearChatHistory(userId, sessionId = null) {
  if (sessionId) {
    await Chat.findOneAndDelete({ _id: sessionId, userId })
    return { message: 'Chat session deleted', sessionId }
  }
  await Chat.deleteMany({ userId })
  return { message: 'All chat history cleared' }
}
