/**
 * Unit tests for detectAnomalies.
 */
import { jest } from '@jest/globals'

jest.unstable_mockModule('../../transactions/index.js', () => ({
  transactionsService: {
    getTransactions: jest.fn(),
    flagTransactionAnomaly: jest.fn(),
  }
}))

const { transactionsService } = await import('../../transactions/index.js')
const { detectAnomalies } = await import('../services/anomaly.service.js')

const tx = (overrides = {}) => ({
  category: 'food',
  merchant: 'Shoprite',
  amount: 10_000_00,
  transactionDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  isAnomaly: false,
  ...overrides,
})

describe('detectAnomalies', () => {
  test('returns null when no anomaly rules are triggered', async () => {
    transactionsService.getTransactions.mockResolvedValue({
      transactions: [
        tx({ amount: 10_000_00 }),
        tx({ amount: 12_000_00 }),
        tx({ amount: 9_000_00 }),
      ]
    })

    const result = await detectAnomalies('user1', 11_000_00, 'Shoprite', 'food')
    expect(result).toBeNull()
  })

  test('flags when amount is 3x category average', async () => {
    transactionsService.getTransactions.mockResolvedValue({
      transactions: [
        tx({ amount: 10_000, category: 'food' }),
        tx({ amount: 10_000, category: 'food' }),
        tx({ amount: 10_000, category: 'food' }),
      ]
    })

    const result = await detectAnomalies('user1', 50_000, 'Shoprite', 'food')
    expect(result).not.toBeNull()
    expect(result.flagged).toBe(true)
    expect(result.reasons.some(r => r.includes('food'))).toBe(true)
  })

  test('flags a first-time merchant above NGN 20k threshold', async () => {
    transactionsService.getTransactions.mockResolvedValue({
      transactions: [
        tx({ merchant: 'Shoprite' }),
      ]
    })

    const result = await detectAnomalies('user1', 2_500_000, 'Jumia', 'shopping')
    expect(result).not.toBeNull()
    expect(result.reasons.some(r => r.includes('Jumia'))).toBe(true)
  })

  test('flags duplicate merchant within 10 minutes', async () => {
    transactionsService.getTransactions.mockResolvedValue({
      transactions: [
        tx({ merchant: 'Netflix', transactionDate: new Date(Date.now() - 5 * 60 * 1000).toISOString() }),
      ]
    })

    const result = await detectAnomalies('user1', 150_000, 'Netflix', 'subscriptions')
    expect(result).not.toBeNull()
    expect(result.reasons.some(r => r.includes('Duplicate'))).toBe(true)
  })
})
