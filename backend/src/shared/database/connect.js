import mongoose from 'mongoose'
import { config } from '../config/env.js'

export default async function connectDB() {
  try {
    await mongoose.connect(config.mongodbUri)
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  }
}
