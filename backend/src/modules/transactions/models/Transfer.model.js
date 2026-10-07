import mongoose from 'mongoose'

const transferSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceCardId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  sourcePan:        String,
  amount:           { type: Number, required: true },  // kobo
  currency:         { type: String, default: 'NGN' },
  narration:        String,
  category:         { type: String, default: 'transfer' },
  reference:        { type: String, unique: true },
  recipientName:    { type: String, required: true },
  recipientAccount: { type: String, required: true },  // 10-digit NUBAN
  recipientBank:    { type: String, required: true },  // bank code e.g. '058'
  recipientBankName: String,
  transactionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  status:           { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },

  // ── Multi-source funding pool (optional, additive) ────────────────────────
  // When a transfer is funded from more than one source account it is collected
  // through an internal TransferPool. Single-source transfers leave these empty.
  isPooled:         { type: Boolean, default: false },
  poolId:           { type: mongoose.Schema.Types.ObjectId, ref: 'TransferPool' },
  fundingSources:   [{
    _id: false,
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    label:  String,
    bank:   String,
    pan:    String,
    amount: { type: Number, default: 0 },  // kobo allocated from this source
  }],
}, { timestamps: true })

transferSchema.index({ userId: 1, createdAt: -1 })
transferSchema.index({ userId: 1, status: 1 })

export default mongoose.model('Transfer', transferSchema)
