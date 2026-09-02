import { createChatCompletion, MODELS } from '../services/ai.js'
import Chat from '../db/models/Chat.js'
import { getSpendingSummary } from '../services/insights.js'

/**
 * Handle financial chat queries.
 * Before each query, we inject a fresh 30-day spending summary as context.
 */
export async function handleChat(req, res) {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })

  // 1. Get user spending summary for context
  const summary = await getSpendingSummary(req.user._id, 30)
  
  // 2. Format a system prompt with full financial context
  const systemPrompt = `
    You are Orchestra AI, a helpful financial assistant for a Nigerian user.
    You have access to their up-to-date financial data:
    - 30-Day Spend: NGN ${(summary.totalSpent / 100).toLocaleString()}
    - Category Breakdown: ${JSON.stringify(
      Object.fromEntries(
        Object.entries(summary.byCategory).map(([k,v]) => [k, 'NGN ' + (v/100).toLocaleString()])
      )
    )}
    - Top Merchants: ${summary.topMerchants.map(([m,v]) => m).join(', ')}
    - Subscriptions: NGN ${(summary.subscriptionSpend / 100).toLocaleString()}
    - Flagged Anomalies: ${summary.anomalyCount}

    Use this data to answer questions accurately. If they ask "How much did I spend on food?", 
    look at the category breakdown. If they ask "Can I afford X?", give a common-sense 
    recommendation based on their total spend and health. Be concise, friendly, and helpful.
    Currency is Naira (NGN).
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
