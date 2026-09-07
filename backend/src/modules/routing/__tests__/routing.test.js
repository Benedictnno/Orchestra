/**
 * Unit tests for resolvePayment — the routing engine.
 */
import { jest } from '@jest/globals'

jest.unstable_mockModule('../models/RoutingRule.model.js', () => ({
  default: { findOne: jest.fn() }
}))
jest.unstable_mockModule('../../cards/index.js', () => ({
  cardsService: { getUserCardsWithBalances: jest.fn() }
}))

const { default: RoutingRule } = await import('../models/RoutingRule.model.js')
const { cardsService } = await import('../../cards/index.js')
const { resolvePayment } = await import('../routing.service.js')

const fakeCard = (id, available) => ({
  _id:      { toString: () => id },
  pan:      `PAN_${id}`,
  cardType: 'debit',
  label:    `Card ${id}`,
  bank:     'TestBank',
  cardProgram: 'VERVE',
  available,
  toObject: function() { return { ...this, available } },
})

describe('resolvePayment — auto-split mode', () => {
  beforeEach(() => {
    const c1 = fakeCard('card1', 5000_00)
    const c2 = fakeCard('card2', 3000_00)
    RoutingRule.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          mode: 'auto-split',
          cardOrder: [c1, c2],
        })
      })
    })
    cardsService.getUserCardsWithBalances.mockResolvedValue([c1, c2])
  })

  test('charges first card when it fully covers the amount', async () => {
    const result = await resolvePayment('user1', 2000_00)
    expect(result.success).toBe(true)
    expect(result.allocations).toHaveLength(1)
    expect(result.allocations[0].charge).toBe(2000_00)
  })

  test('splits across two cards when first card is insufficient', async () => {
    const result = await resolvePayment('user1', 7000_00)
    expect(result.success).toBe(true)
    expect(result.allocations).toHaveLength(2)
    expect(result.allocations[0].charge).toBe(5000_00)
    expect(result.allocations[1].charge).toBe(2000_00)
  })

  test('returns failure when total balance is insufficient', async () => {
    const result = await resolvePayment('user1', 99_000_00)
    expect(result.success).toBe(false)
    expect(result.reason).toMatch(/insufficient/i)
  })
})
