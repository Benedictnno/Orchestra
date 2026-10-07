/**
 * Funding Allocation Engine
 *
 * Pure, deterministic and side-effect free. Given a set of candidate funding
 * sources and a requested amount, it decides how much to draw from each source.
 *
 * Strategy: sequential ("waterfall") allocation — sources are consumed in the
 * order the user selected them until the requested amount is raised.
 *
 * IMPORTANT: this module performs no I/O and never mutates balances. It is used
 * both for the read-only preview and for the server-side recalculation during
 * execution. All monetary values are in kobo.
 */

export const ALLOCATION_STATUS = {
  OK: 'OK',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
}

const toSafeBalance = (value) => Math.max(0, Math.floor(Number(value) || 0))

/**
 * Allocate a requested amount across the provided sources.
 *
 * @param {Array<{accountId: string, availableBalance: number}>} sources
 * @param {number} requestedAmount - amount to raise, in kobo
 * @returns {{
 *   status: string,
 *   requestedAmount: number,
 *   totalAvailable: number,
 *   totalAllocated: number,
 *   shortfall: number,
 *   allocations: Array<{
 *     accountId: string,
 *     amountRequested: number,
 *     amountAllocated: number,
 *     balanceBefore: number,
 *     balanceAfter: number
 *   }>
 * }}
 */
export function calculateAllocation(sources = [], requestedAmount) {
  const normalized = sources.map((s) => ({
    accountId: s.accountId,
    availableBalance: toSafeBalance(s.availableBalance),
  }))

  const totalAvailable = normalized.reduce((sum, s) => sum + s.availableBalance, 0)

  // Guard against zero/negative/NaN amounts before any allocation logic.
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return {
      status: ALLOCATION_STATUS.INVALID_AMOUNT,
      requestedAmount: 0,
      totalAvailable,
      totalAllocated: 0,
      shortfall: 0,
      allocations: normalized.map((s) => ({
        accountId: s.accountId,
        amountRequested: 0,
        amountAllocated: 0,
        balanceBefore: s.availableBalance,
        balanceAfter: s.availableBalance,
      })),
    }
  }

  // Not enough across all selected sources — allocate nothing, change nothing.
  if (totalAvailable < requestedAmount) {
    return {
      status: ALLOCATION_STATUS.INSUFFICIENT_FUNDS,
      requestedAmount,
      totalAvailable,
      totalAllocated: 0,
      shortfall: requestedAmount - totalAvailable,
      allocations: normalized.map((s) => ({
        accountId: s.accountId,
        amountRequested: s.availableBalance,
        amountAllocated: 0,
        balanceBefore: s.availableBalance,
        balanceAfter: s.availableBalance,
      })),
    }
  }

  // Sequential waterfall allocation.
  let remaining = requestedAmount
  const allocations = normalized.map((s) => {
    const amountAllocated = Math.min(s.availableBalance, remaining)
    remaining -= amountAllocated
    return {
      accountId: s.accountId,
      amountRequested: Math.min(s.availableBalance, requestedAmount),
      amountAllocated,
      balanceBefore: s.availableBalance,
      balanceAfter: s.availableBalance - amountAllocated,
    }
  })

  return {
    status: ALLOCATION_STATUS.OK,
    requestedAmount,
    totalAvailable,
    totalAllocated: requestedAmount,
    shortfall: 0,
    allocations,
  }
}
