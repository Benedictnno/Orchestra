import * as chatService from './services/chat.service.js'

export async function handleChat(req, res) {
  const result = await chatService.processChatMessage(
    req.user._id,
    req.body.message,
    req.body.sessionId || req.query.sessionId
  )
  res.json(result)
}

export async function listSessions(req, res) {
  const result = await chatService.getChatSessions(req.user._id)
  res.json(result)
}

export async function getSession(req, res) {
  const result = await chatService.getChatSession(req.user._id, req.params.sessionId)
  res.json(result)
}

export async function createSession(req, res) {
  const result = await chatService.createChatSession(req.user._id, req.body.title)
  res.status(201).json(result)
}

export async function deleteSession(req, res) {
  const result = await chatService.deleteChatSession(req.user._id, req.params.sessionId)
  res.json(result)
}

export async function getChatHistory(req, res) {
  const result = await chatService.getChatHistory(
    req.user._id,
    req.query.sessionId || req.params.sessionId
  )
  res.json(result)
}

export async function clearChat(req, res) {
  const result = await chatService.clearChatHistory(
    req.user._id,
    req.query.sessionId || req.params.sessionId
  )
  res.json(result)
}

