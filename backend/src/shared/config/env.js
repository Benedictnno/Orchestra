import 'dotenv/config'

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/orchestra',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',').map(o => o.trim()) 
    : ['http://localhost:3000'],
  card360: {
    enabled: process.env.CARD360_ENABLED === 'true',
    baseUrl: process.env.CARD360_BASE_URL || '',
    token: process.env.CARD360_TOKEN || '',
  },
  ai: {
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqBaseUrl: process.env.GROQ_BASE_URL || '',
    premiumModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    fastModel: process.env.GROQ_FAST_MODEL || 'llama-3.1-8b-instant',
  }
}
