/**
 * Unit tests for the Funding Allocation Engine.
 *
 * Values are treated as abstract monetary units — the engine is currency and
 * unit agnostic (the service always feeds it kobo).
 */
import { calculateAllocation, ALLOCATION_STATUS } from '../allocation.engine.js'

const sources = (...balances) =>
  balances.map((availableBalance, i) => ({ accountId: `acc${i + 1}`, availableBalance }))

const amounts = (result) => result.allocations.map((a) => a.amountAllocated)

describe('calculateAllocation — sequential waterfall', () => {
  test('Test 1: spreads ₦3,000 across ₦1,000 / ₦8,000 / ₦1,000 sequentially', () => {
    const result = calculateAllocation(sources(1000, 8000, 1000), 3000)
    expect(result.status).toBe(ALLOCATION_STATUS.OK)
    expect(amounts(result)).toEqual([1000, 2000, 0])
    expect(result.totalAllocated).toBe(3000)
  })

  test('Test 2: fails with INSUFFICIENT_FUNDS and allocates nothing', () => {
    const result = calculateAllocation(sources(1000, 500), 3000)
    expect(result.status).toBe(ALLOCATION_STATUS.INSUFFICIENT_FUNDS)
    expect(amounts(result)).toEqual([0, 0])
    expect(result.totalAllocated).toBe(0)
    expect(result.shortfall).toBe(1500)
  })

  test('Test 3: a single sufficient source covers the whole amount', () => {
    const result = calculateAllocation(sources(10000, 5000), 3000)
    expect(result.status).toBe(ALLOCATION_STATUS.OK)
    expect(amounts(result)).toEqual([3000, 0])
  })

  test('Test 4: skips a zero-balance source rather than erroring', () => {
    const result = calculateAllocation(sources(0, 2000, 2000), 3000)
    expect(result.status).toBe(ALLOCATION_STATUS.OK)
    expect(amounts(result)).toEqual([0, 2000, 1000])
  })

  test('Test 5: draws exactly the full balance when the amount equals total available', () => {
    const result = calculateAllocation(sources(1000, 2000), 3000)
    expect(result.status).toBe(ALLOCATION_STATUS.OK)
    expect(amounts(result)).toEqual([1000, 2000])
    expect(result.allocations.map((a) => a.balanceAfter)).toEqual([0, 0])
  })

  test('Test 6: rejects a zero amount as INVALID_AMOUNT', () => {
    const result = calculateAllocation(sources(1000, 2000), 0)
    expect(result.status).toBe(ALLOCATION_STATUS.INVALID_AMOUNT)
    expect(amounts(result)).toEqual([0, 0])
  })

  test('rejects negative and non-numeric amounts as INVALID_AMOUNT', () => {
    expect(calculateAllocation(sources(1000), -50).status).toBe(ALLOCATION_STATUS.INVALID_AMOUNT)
    expect(calculateAllocation(sources(1000), NaN).status).toBe(ALLOCATION_STATUS.INVALID_AMOUNT)
  })

  test('preserves source order and reports balanceBefore/balanceAfter', () => {
    const result = calculateAllocation(sources(700, 2000, 300), 1500)
    expect(result.status).toBe(ALLOCATION_STATUS.OK)
    expect(amounts(result)).toEqual([700, 800, 0])
    expect(result.allocations[0]).toMatchObject({ balanceBefore: 700, balanceAfter: 0 })
    expect(result.allocations[1]).toMatchObject({ balanceBefore: 2000, balanceAfter: 1200 })
    expect(result.allocations[2]).toMatchObject({ balanceBefore: 300, balanceAfter: 300 })
  })

  test('treats missing/negative source balances as zero', () => {
    const result = calculateAllocation(
      [{ accountId: 'a', availableBalance: -100 }, { accountId: 'b' }],
      50
    )
    expect(result.status).toBe(ALLOCATION_STATUS.INSUFFICIENT_FUNDS)
    expect(result.totalAvailable).toBe(0)
  })
})
