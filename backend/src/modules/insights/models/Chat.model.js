import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [
    {
      role:    { type: String, enum: ['user', 'assistant', 'system'], required: true },
      content: { type: String, required: true },
      sentAt:  { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true })

export default mongoose.model('Chat', chatSchema)
