import mongoose from 'mongoose'

const txSchema = new mongoose.Schema({
  pan:              String,
  cardId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:           { type: Number, required: true },   // kobo
  currency:         { type: String, default: 'NGN' },
  merchant:         String,
  merchantCategory: String,
  type:             {
    type: String,
    enum: ['debit', 'top_up', 'transfer', 'bill_payment'],
    default: 'debit',
  },
  category:         {
    type: String,
    enum: ['food', 'transport', 'subscriptions', 'utilities',
           'entertainment', 'shopping', 'transfer', 'bills', 'other'],
  },
  narration:        String,
  transactionDate:  { type: Date, default: Date.now },
  responseCode:     { type: String, default: '00' },
  reference:        String,
  isAnomaly:        { type: Boolean, default: false },
  anomalyReason:    String,
  simulatedSplit:   [{ cardId: mongoose.Schema.Types.ObjectId, amount: Number }],
}, { timestamps: true })

txSchema.index({ userId: 1, transactionDate: -1 })
txSchema.index({ userId: 1, category: 1 })
txSchema.index({ userId: 1, merchant: 1, transactionDate: -1 })
txSchema.index({ isAnomaly: 1, createdAt: -1 })
txSchema.index({ reference: 1 }, { unique: true, sparse: true })

export default mongoose.model('Transaction', txSchema)
