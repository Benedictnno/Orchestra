import mongoose from 'mongoose'
import dns from 'dns'
import { config } from '../config/env.js'

// Configure public DNS servers to resolve MongoDB Atlas SRV records reliably on Windows/VPNs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4'])
} catch {
  // Ignore if not supported
}

export default async function connectDB() {
  try {
    await mongoose.connect(config.mongodbUri)
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    throw err
  }
}
