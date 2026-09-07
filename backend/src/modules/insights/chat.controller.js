import * as chatService from './services/chat.service.js'

export async function handleChat(req, res) {
  const result = await chatService.processChatMessage(req.user._id, req.body.message)
  res.json(result)
}

export async function getChatHistory(req, res) {
  const result = await chatService.getChatHistory(req.user._id)
  res.json(result)
}

export async function clearChat(req, res) {
  const result = await chatService.clearChatHistory(req.user._id)
  res.json(result)
}
