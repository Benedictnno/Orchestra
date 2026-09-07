import app from './app.js'
import connectDB from './shared/database/connect.js'
import { config } from './shared/config/env.js'

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`🎼 Orchestra API running on port ${config.port}`)
  })
})
