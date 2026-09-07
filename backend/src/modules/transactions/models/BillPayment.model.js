import mongoose from 'mongoose'

const billPaymentSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  sourcePan:    String,
  amount:       { type: Number, required: true },  // kobo
  currency:     { type: String, default: 'NGN' },
  reference:    { type: String, unique: true },
  billerCode:   { type: String, required: true },  // e.g. 'DSTV', 'EKEDC'
  billerName:   String,
  customerId:   { type: String, required: true },
  narration:    String,
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  status:       { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
}, { timestamps: true })

billPaymentSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('BillPayment', billPaymentSchema)
