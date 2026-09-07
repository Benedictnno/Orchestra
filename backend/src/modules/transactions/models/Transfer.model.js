import mongoose from 'mongoose'

const transferSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceCardId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  sourcePan:        String,
  amount:           { type: Number, required: true },  // kobo
  currency:         { type: String, default: 'NGN' },
  narration:        String,
  reference:        { type: String, unique: true },
  recipientName:    { type: String, required: true },
  recipientAccount: { type: String, required: true },  // 10-digit NUBAN
  recipientBank:    { type: String, required: true },  // bank code e.g. '058'
  recipientBankName: String,
  transactionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  status:           { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
}, { timestamps: true })

transferSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('Transfer', transferSchema)
