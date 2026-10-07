import mongoose from 'mongoose'

/**
 * TransferPool — an internal, temporary orchestration entity.
 *
 * It holds the funds collected from multiple source accounts for the duration of
 * a single outgoing transfer. It is NEVER exposed as a card/account to the user
 * and is not a permanent financial instrument; it exists only within the transfer
 * lifecycle (see transfers.service.js).
 */

const fundingSourceSchema = new mongoose.Schema({
  accountId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  label:           String,
  bank:            String,
  pan:             String,
  amountRequested: { type: Number, default: 0 },  // kobo
  amountAllocated: { type: Number, default: 0 },  // kobo
  balanceBefore:   { type: Number, default: 0 },  // kobo
  balanceAfter:    { type: Number, default: 0 },  // kobo
}, { _id: false })

const destinationSchema = new mongoose.Schema({
  accountName:   String,
  accountNumber: String,
  bankName:      String,
}, { _id: false })

const transferPoolSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedAmount: { type: Number, required: true },  // kobo
  pooledAmount:    { type: Number, default: 0 },       // kobo actually collected
  currency:        { type: String, default: 'NGN' },
  status: {
    type: String,
    enum: ['PENDING', 'COLLECTING', 'READY', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
  },
  sources:     { type: [fundingSourceSchema], default: [] },
  destination: { type: destinationSchema, default: {} },
  reference:   { type: String },
  transferId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Transfer' },
}, { timestamps: true })

transferPoolSchema.index({ userId: 1, status: 1 })
transferPoolSchema.index({ userId: 1, createdAt: -1 })
transferPoolSchema.index({ reference: 1 })

export default mongoose.model('TransferPool', transferPoolSchema)
