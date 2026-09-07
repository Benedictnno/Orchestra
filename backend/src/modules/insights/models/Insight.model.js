import mongoose from 'mongoose'

const insightSchema = new mongoose.Schema({
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  summary:            String,
  insights:           [mongoose.Schema.Types.Mixed],
  recommendations:    [mongoose.Schema.Types.Mixed],
  anomalies:          [String],
  savingsOpportunity: Number,    // in NGN
  byCategory:         mongoose.Schema.Types.Mixed,
  totalSpent:         Number,
  financialScore:     mongoose.Schema.Types.Mixed,  // { score: number, label: string } or number
  generatedAt:        { type: Date, default: Date.now },
}, { timestamps: true })

insightSchema.index({ userId: 1, generatedAt: -1 })

export default mongoose.model('Insight', insightSchema)
