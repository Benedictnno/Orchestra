import { createChatCompletion, MODELS } from '../services/ai.js'
import Chat from '../db/models/Chat.js'
import Transaction from '../db/models/Transaction.js'
import { getSpendingSummary } from '../services/insights.js'

/**
 * Handle financial chat queries.
 * Before each query, we inject a fresh 30-day spending summary as context.
 */
export async function handleChat(req, res) {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })

  // 1. Get user spending summary + recent transactions for context
  const [summary, recentTxns] = await Promise.all([
    getSpendingSummary(req.user._id, 30),
    Transaction.find({ userId: req.user._id })
      .sort({ transactionDate: -1 })
      .limit(15)
      .lean(),
  ])

  // Format recent transactions as a readable list for the LLM
  const txnLines = recentTxns.length
    ? recentTxns.map((t, i) => {
        const date   = new Date(t.transactionDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
        const amount = `NGN ${(t.amount / 100).toLocaleString()}`
        const flag   = t.isAnomaly ? ' ⚠️ FLAGGED' : ''
        return `  ${i + 1}. [${date}] ${t.merchant || t.narration || 'Unknown'} | ${t.category || 'other'} | ${amount}${flag}`
      }).join('\n')
    : '  No transactions found.'

  // 2. Format a system prompt with full financial context
  const systemPrompt = `
You are Orchestra AI, a financial assistant for a Nigerian user. You have access to their live financial data below.

## 30-Day Spending Summary
- Total Spent: NGN ${(summary.totalSpent / 100).toLocaleString()}
- Transactions: ${summary.transactionCount}
- Flagged Anomalies: ${summary.anomalyCount}
- Subscriptions: NGN ${(summary.subscriptionSpend / 100).toLocaleString()}

## Spending by Category
${Object.entries(summary.byCategory).map(([k, v]) => `- ${k}: NGN ${(v / 100).toLocaleString()}`).join('\n')}

## Top 5 Merchants
${summary.topMerchants.map(([m, v]) => `- ${m}: NGN ${(v / 100).toLocaleString()}`).join('\n')}

## Recent Transaction History (last ${recentTxns.length})
${txnLines}

---

## Response Format
You MUST always reply with a valid JSON object. No prose, no markdown outside this object.

Choose the best "type" for the user's question:
- "fact"       — a direct factual lookup (e.g. "how much did I spend on food?")
- "advice"     — a recommendation or planning question (e.g. "can I afford X?")
- "summary"    — a broad overview request (e.g. "summarise my spending")
- "anomaly"    — a question about a flagged or suspicious transaction
- "general"    — anything else

JSON schema (all fields required):
{
  "type": "<fact | advice | summary | anomaly | general>",
  "answer": "<1–2 sentence direct response to the user's question>",
  "bullets": ["<supporting detail 1>", "<supporting detail 2>"],  // 0–4 items, omit array if empty
  "tip": "<one short, actionable financial tip relevant to this response, or null if not applicable>"
}

Rules:
- Always use NGN and real numbers from the data. Never invent figures.
- Keep "answer" under 60 words.
- Keep each bullet under 20 words.
- Keep "tip" under 25 words, or set it to null.
  `

  // 3. Retrieve or initialize chat history
  let chat = await Chat.findOne({ userId: req.user._id })
  if (!chat) {
    chat = await Chat.create({ userId: req.user._id, messages: [] })
  }

  // 4. Build message payload (System Context + History + New Message)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chat.messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ]

  // 5. Call AI Completion (with automatic fallback if primary model fails)
  const response = await createChatCompletion({
    model: MODELS.PREMIUM,
    messages,
    response_format: { type: 'json_object' },
  })

  // Parse structured response; fall back to raw text if JSON is malformed
  let structured
  const raw = response.choices[0].message.content
  try {
    structured = JSON.parse(raw)
  } catch {
    structured = { type: 'general', answer: raw, bullets: [], tip: null }
  }

  const assistantMessage = raw

  // 6. Persist User and Assistant messages (skip system prompt to save space)
  chat.messages.push({ role: 'user', content: message })
  chat.messages.push({ role: 'assistant', content: assistantMessage })
  
  // Keep history manageable
  if (chat.messages.length > 50) chat.messages = chat.messages.slice(-50)
  
  try {
    await chat.save()
  } catch (err) {
    console.error('CRITICAL: Chat history failed to save:', err)
  }

  res.json({ reply: structured, history: chat.messages })
}

export async function getChatHistory(req, res) {
  const chat = await Chat.findOne({ userId: req.user._id })
  res.json({ history: chat ? chat.messages : [] })
}

export async function clearChat(req, res) {
  await Chat.findOneAndDelete({ userId: req.user._id })
  res.json({ message: 'Chat history cleared' })
}
