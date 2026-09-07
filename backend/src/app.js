import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import { randomUUID } from 'crypto'
import 'express-async-errors'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'

import { config } from './shared/config/env.js'
import { errorHandler } from './shared/middleware/error.middleware.js'

// Domain Module Routes
import { authRoutes } from './modules/auth/index.js'
import { cardsRoutes } from './modules/cards/index.js'
import { routingRoutes } from './modules/routing/index.js'
import { virtualCardsRoutes } from './modules/virtual-cards/index.js'
import { businessRoutes } from './modules/business/index.js'
import { transactionsRoutes, transfersRoutes, billsRoutes } from './modules/transactions/index.js'
import { insightsRoutes, chatRoutes, anomaliesRoutes, reportRoutes } from './modules/insights/index.js'

const app = express()

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please slow down' }
})
app.use('/api/', limiter)

// Swagger UI API documentation
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'))
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
} catch {
  console.warn('⚠️  swagger.yaml not found — /api-docs disabled')
}

// Security headers
app.use(helmet())

// Structured request logging with correlation ID
app.use(pinoHttp({
  genReqId: () => randomUUID(),
  redact:   ['req.headers.authorization'], // don't log JWTs
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url } },
    res(res) { return { statusCode: res.statusCode } },
  },
}))

// CORS setup
app.use(cors({ 
  origin:      config.clientUrls,
  credentials: true 
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Mount Domain Modules
app.use('/api/auth',          authRoutes)
app.use('/api/cards',         cardsRoutes)
app.use('/api/routing',       routingRoutes)
app.use('/api/virtual-cards', virtualCardsRoutes)
app.use('/api/business',      businessRoutes)
app.use('/api/transactions',  transactionsRoutes)
app.use('/api/transfers',     transfersRoutes)
app.use('/api/bills',         billsRoutes)
app.use('/api/insights',      insightsRoutes)
app.use('/api/chat',          chatRoutes)
app.use('/api/anomalies',     anomaliesRoutes)
app.use('/api/report',        reportRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` })
})

// Global error handler — must be registered last
app.use(errorHandler)

export default app