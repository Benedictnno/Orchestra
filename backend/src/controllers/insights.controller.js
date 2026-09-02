import { createChatCompletion, MODELS } from '../services/ai.js'
import Insight from '../db/models/Insight.js'
import { getSpendingSummary } from '../services/insights.js'

export async function getInsights(req, res) {
  // Return cached insights if less than 24 hours old
  const cached = await Insight.findOne({ userId: req.user._id }).sort({ generatedAt: -1 })
  if (cached && Date.now() - cached.generatedAt < 24 * 60 * 60 * 1000) {
    return res.json({ insights: cached, fromCache: true })
  }

  // Fetch current 30-day window AND prior 30-day window in parallel for MoM comparison
  const [summary, prevSummary] = await Promise.all([
    getSpendingSummary(req.user._id, 30),
    getSpendingSummary(req.user._id, 60),
  ])

  // Compute month-over-month deltas per category
  // prevSummary covers 60 days — subtract current 30d to isolate the prior period
  const momDeltas = Object.entries(summary.byCategory).map(([cat, curr]) => {
    const combined = prevSummary.byCategory[cat] || 0
    const prev     = combined - curr
    if (prev <= 0) return null
    const pct = (((curr - prev) / prev) * 100).toFixed(0)
    const dir = curr > prev ? '▲ up' : '▼ down'
    return `- ${cat}: ${dir} ${Math.abs(pct)}% vs last month (NGN ${(curr/100).toLocaleString()} vs NGN ${(prev/100).toLocaleString()})`
  }).filter(Boolean).join('\n') || '  No prior-period data available.'

  const prompt = `
You are Orchestra — a trusted financial advisor and close friend who knows this user's money inside out.
You speak like a smart, warm Nigerian friend who happens to be great with finances.
You are never robotic, never stiff, and you never sound like a bank.

Your personality for ALL text fields:
- Warm and direct — you get to the point but you care
- Reference actual merchants and categories by name naturally
- Celebrate good habits and gently call out red flags without being preachy
- Use natural conversational language — short punchy sentences, occasional humour, real talk
- No bullet points, no markdown headers inside text strings
- Speak like a WhatsApp message from a knowledgeable friend, not a bank statement

Here is their live financial data:

Current 30-Day Spending:
- Total: NGN ${(summary.totalSpent / 100).toLocaleString()} across ${summary.transactionCount} transactions
- Anomalies flagged: ${summary.anomalyCount}
- Subscriptions: NGN ${(summary.subscriptionSpend / 100).toLocaleString()}

By Category:
${Object.entries(summary.byCategory).map(([k,v]) => `- ${k}: NGN ${(v/100).toLocaleString()}`).join('\n')}

Top Merchants:
${summary.topMerchants.map(([m,v]) => `- ${m} (NGN ${(v/100).toLocaleString()})`).join('\n')}

Month-over-Month Trends:
${momDeltas}

Return a JSON object with EXACTLY this schema. No extra keys. No markdown wrapper. All monetary values are NGN integers.

{
  "summary": "<2-sentence overview written in warm, conversational prose — like a friend giving you a quick read on your month. Reference real figures naturally.>",

  "insights": [
    { "title": "<short punchy label, max 5 words>", "detail": "<one observation in natural conversational tone, max 25 words, referencing actual data>" },
    { "title": "...", "detail": "..." },
    { "title": "...", "detail": "..." }
  ],

  "recommendations": [
    { "title": "<short action label, max 5 words>", "detail": "<one friendly, actionable tip in conversational tone, max 25 words>" },
    { "title": "...", "detail": "..." },
    { "title": "...", "detail": "..." }
  ],

  "anomalies": ["<plain conversational description of any unusual pattern, like you'd text a friend a heads-up>"],

  "savingsOpportunity": <integer: realistic monthly savings in NGN>,

  "financialScore": {
    "score": <integer 0-100>,
    "label": "<Excellent | Good | Fair | Needs Attention | Critical>"
  }
}

Rules:
- Use only real figures from the data. Never invent numbers.
- Every text field must sound like a real person talking, not a financial report.
- Prefer MoM trend data in insights where it is available.
- Currency is always Naira (NGN).
  `

  const response = await createChatCompletion({
    model:           MODELS.PREMIUM,
    messages:        [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  // Log token usage for cost monitoring
  if (response.usage) {
    console.log(`[Insights] Tokens — prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens}, total: ${response.usage.total_tokens}`)
  }

  const result = JSON.parse(response.choices[0].message.content)
  const insight = await Insight.create({
    userId:     req.user._id,
    ...result,
    byCategory: summary.byCategory,
    totalSpent: summary.totalSpent,
  })

  res.json({ insights: insight, fromCache: false })
}

export async function getSavings(req, res) {
  const { adjustments } = req.body

  const summary        = await getSpendingSummary(req.user._id, 30)
  const currentMonthly = summary.totalSpent
  let projectedMonthly = currentMonthly

  for (const [category, multiplier] of Object.entries(adjustments || {})) {
    const current    = summary.byCategory[category] || 0
    projectedMonthly = projectedMonthly - current + (current * multiplier)
  }

  const monthlySavings = currentMonthly - projectedMonthly

  res.json({
    currentMonthly,
    projectedMonthly,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    breakdown: Object.fromEntries(
      Object.entries(adjustments || {}).map(([cat, mult]) => [cat, {
        current:   summary.byCategory[cat] || 0,
        projected: (summary.byCategory[cat] || 0) * mult,
        saving:    (summary.byCategory[cat] || 0) * (1 - mult),
      }])
    )
  })
}
