/**
 * Service-level tests for previewTransfer — the multi-source funding pool flow.
 *
 * The cards service is mocked so the tests are deterministic and DB-free. The
 * allocation engine itself is exercised separately in allocation.test.js.
 */
import { jest } from '@jest/globals'

jest.unstable_mockModule('../../cards/index.js', () => ({
  cardsService: {
    getUserCards: jest.fn(),
    deductBalanceByPan: jest.fn(),
  },
}))

const { cardsService } = await import('../../cards/index.js')
const { previewTransfer } = await import('../transfers.service.js')
const { ALLOCATION_STATUS } = await import('../allocation.engine.js')

// `availableBalance` is in kobo; the API accepts `amount` in Naira.
const card = (id, availableBalance, overrides = {}) => ({
  _id: { toString: () => id },
  pan: `506198402198${id}`,
  label: `Card ${id}`,
  bank: 'TestBank',
  cardStatus: '1',
  availableBalance,
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('previewTransfer — multi-source funding pool', () => {
  test('allocates sequentially across selected sources without mutating balances', async () => {
    cardsService.getUserCards.mockResolvedValue([
      card('a', 1000),
      card('b', 8000),
      card('c', 1000),
    ])

    const preview = await previewTransfer('user1', { amount: 30, sourceCardIds: ['a', 'b', 'c'] })

    expect(preview.status).toBe(ALLOCATION_STATUS.OK)
    expect(preview.allocations.map((a) => a.amountAllocated)).toEqual([1000, 2000, 0])
    expect(preview.totalAllocated).toBe(3000)
    // Balances are only reported, never written.
    expect(cardsService.deductBalanceByPan).not.toHaveBeenCalled()
  })

  test('reports INSUFFICIENT_FUNDS with the shortfall when sources cannot cover the amount', async () => {
    cardsService.getUserCards.mockResolvedValue([card('a', 1000), card('b', 500)])

    const preview = await previewTransfer('user1', { amount: 30, sourceCardIds: ['a', 'b'] })

    expect(preview.status).toBe(ALLOCATION_STATUS.INSUFFICIENT_FUNDS)
    expect(preview.totalAvailable).toBe(1500)
    expect(preview.shortfall).toBe(1500)
    expect(preview.allocations.every((a) => a.amountAllocated === 0)).toBe(true)
  })

  test('supports a single routing source (legacy sourceCardId) as one entry', async () => {
    cardsService.getUserCards.mockResolvedValue([card('a', 10000), card('b', 5000)])

    const preview = await previewTransfer('user1', { amount: 30, sourceCardId: 'a' })

    expect(preview.status).toBe(ALLOCATION_STATUS.OK)
    expect(preview.allocations).toHaveLength(1)
    expect(preview.allocations[0].amountAllocated).toBe(3000)
  })

  test('rejects a source that does not belong to the user', async () => {
    cardsService.getUserCards.mockResolvedValue([card('a', 5000)])

    await expect(
      previewTransfer('user1', { amount: 10, sourceCardIds: ['a', 'ghost'] })
    ).rejects.toThrow(/not found|does not belong/i)
  })

  test('rejects duplicate funding source ids', async () => {
    cardsService.getUserCards.mockResolvedValue([card('a', 5000)])

    await expect(
      previewTransfer('user1', { amount: 10, sourceCardIds: ['a', 'a'] })
    ).rejects.toThrow(/duplicate/i)
  })

  test('rejects inactive funding sources', async () => {
    cardsService.getUserCards.mockResolvedValue([card('a', 5000, { cardStatus: '2' })])

    await expect(
      previewTransfer('user1', { amount: 10, sourceCardIds: ['a'] })
    ).rejects.toThrow(/not active/i)
  })

  test('rejects an empty funding source selection', async () => {
    await expect(previewTransfer('user1', { amount: 10, sourceCardIds: [] })).rejects.toThrow(
      /at least one funding source/i
    )
  })
})
