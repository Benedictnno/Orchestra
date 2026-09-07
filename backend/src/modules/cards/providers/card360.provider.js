import Card from '../models/Card.model.js'
import CardBalance from '../models/CardBalance.model.js'
import { config } from '../../../shared/config/env.js'

const LIVE  = config.card360.enabled
const BASE  = config.card360.baseUrl
const TOKEN = config.card360.token

const h = () => ({
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
})

// Real API calls — dormant until CARD360_ENABLED=true
const real = {
  fetchCard: (body) =>
    fetch(`${BASE}/card-management/api/v1/card/fetchSingle`,
      { method: 'POST', headers: h(), body: JSON.stringify(body) }
    ).then(r => r.json()),

  getBalance: (pan, type) =>
    fetch(`${BASE}/card-management/api/v1/card/${type}/balance`,
      { method: 'POST', headers: h(), body: JSON.stringify({ pan }) }
    ).then(r => r.json()),

  blockCard: (pan, type) =>
    fetch(`${BASE}/card-management/api/v1/card/${type === 'prepaid' ? 'prepaid/' : ''}block`,
      { method: 'POST', headers: h(), body: JSON.stringify({ pan }) }
    ).then(r => r.json()),

  unblockCard: (pan, type) =>
    fetch(`${BASE}/card-management/api/v1/card/${type === 'prepaid' ? 'prepaid/' : ''}unblock`,
      { method: 'POST', headers: h(), body: JSON.stringify({ pan }) }
    ).then(r => r.json()),
}

// Mock implementations — read/write MongoDB
const mock = {
  fetchCard: async ({ pan, expiryDate, issuerNr, cardSequenceNr }) => {
    // For demo: if card isn't in DB, return a successful mock response anyway
    const card = await Card.findOne({ pan })
    
    return {
      code: '00', description: 'Successful',
      cardDetails: [{
        pan: pan, 
        expiryDate: expiryDate || card?.expiryDate || '2612', 
        issuerNr: card?.issuerNr || issuerNr || '000001',
        firstName: card?.firstName || 'Demo', 
        lastName: card?.lastName || 'User',
        nameOnCard: card?.nameOnCard || 'DEMO USER', 
        cardProgram: card?.cardProgram || (pan.startsWith('4') ? 'VISA' : 'VERVE'),
        customerId: card?.customerId || 'CUST-DEMO', 
        cardStatus: card?.cardStatus || '1', 
        seqNr: card?.seqNr || cardSequenceNr || '01'
      }]
    }
  },

  getBalance: async (pan) => {
    const b = await CardBalance.findOne({ pan }).sort({ fetchedAt: -1 })
    if (!b) return { code: '10500', description: 'Balance not found', availableBalance: 0, ledgerBalance: 0, currency: 'NGN' }
    return {
      code: '00', description: 'Successful',
      availableBalance: b.availableBalance,
      ledgerBalance: b.ledgerBalance, currency: b.currency
    }
  },

  blockCard: async (pan) => {
    await Card.findOneAndUpdate({ pan }, { cardStatus: '2' })
    return { code: '00', description: 'Card blocked successfully' }
  },

  unblockCard: async (pan) => {
    await Card.findOneAndUpdate({ pan }, { cardStatus: '1' })
    return { code: '00', description: 'Card unblocked successfully' }
  },
}

// Public interface — controllers/services always call these, never real/mock directly
export const card360 = {
  fetchCard:   (p)         => LIVE ? real.fetchCard(p)           : mock.fetchCard(p),
  getBalance:  (pan, type) => LIVE ? real.getBalance(pan, type)  : mock.getBalance(pan),
  blockCard:   (pan, type) => LIVE ? real.blockCard(pan, type)   : mock.blockCard(pan),
  unblockCard: (pan, type) => LIVE ? real.unblockCard(pan, type) : mock.unblockCard(pan),
}
