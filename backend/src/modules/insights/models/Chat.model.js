import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:  { type: String, default: 'New Chat', trim: true },
  messages: [
    {
      role:    { type: String, enum: ['user', 'assistant', 'system'], required: true },
      content: { type: String, required: true },
      sentAt:  { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true })

chatSchema.index({ userId: 1, updatedAt: -1 })

const Chat = mongoose.model('Chat', chatSchema)

// Sync indexes on startup to clean up legacy unique constraints from single-session architecture
Chat.syncIndexes().catch(() => {})

export default Chat
