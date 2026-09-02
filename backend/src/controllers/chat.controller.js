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

  // 2. Build a warm, personal system prompt with the user's live financial data
  const systemPrompt = `
You are Orchestra — a trusted financial advisor and close friend who knows this user's money inside out.
You speak like a smart, warm Nigerian friend who happens to be great with finances.
You are never robotic, never stiff, and you never sound like a bank.

Your personality:
- Warm and direct — you get to the point but you care
- You reference their actual transactions and merchants by name when relevant
- You celebrate good habits and gently call out red flags without being preachy
- You use natural conversational language — short sentences, occasional humour, real talk
- You NEVER respond with bullet point lists unless the user specifically asks for a breakdown
- You NEVER output JSON, markdown headers, or code blocks
- You speak in flowing natural prose, like a WhatsApp message from a knowledgeable friend

Here is their live financial data — use it naturally in conversation, don't recite it robotically:

Last 30 days:
- Total spent: NGN ${(summary.totalSpent / 100).toLocaleString()} across ${summary.transactionCount} transactions
- Subscriptions: NGN ${(summary.subscriptionSpend / 100).toLocaleString()}
- Flagged anomalies: ${summary.anomalyCount}

Spending by category:
${Object.entries(summary.byCategory).map(([k, v]) => `${k}: NGN ${(v / 100).toLocaleString()}`).join(', ')}

Top merchants:
${summary.topMerchants.map(([m, v]) => `${m} (NGN ${(v / 100).toLocaleString()})`).join(', ')}

Most recent transactions:
${txnLines}

Important rules:
- Only use figures from the data above. Never make up numbers.
- If you don't have enough data to answer something, say so honestly and helpfully.
- Keep responses concise — 3 to 6 sentences is usually perfect. Longer only if they ask for detail.
- Currency is always Naira (NGN).
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
  })

  const assistantMessage = response.choices[0].message.content

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

  res.json({ reply: assistantMessage, history: chat.messages })
}

export async function getChatHistory(req, res) {
  const chat = await Chat.findOne({ userId: req.user._id })
  res.json({ history: chat ? chat.messages : [] })
}

export async function clearChat(req, res) {
  await Chat.findOneAndDelete({ userId: req.user._id })
  res.json({ message: 'Chat history cleared' })
}
