import mongoose from 'mongoose'

const orchestraCardSchema = new mongoose.Schema({
  userId:                { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  cardId:                { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  selectedFundingSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  status:                { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true })

orchestraCardSchema.index({ userId: 1 })

export default mongoose.model('OrchestraCard', orchestraCardSchema)
