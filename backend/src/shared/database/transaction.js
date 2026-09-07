import mongoose from 'mongoose'

/**
 * Execute a unit of work inside an atomic MongoDB multi-document transaction.
 * Automatically falls back to direct execution if MongoDB is running as a standalone node
 * without replica set transaction support.
 *
 * @param {Function} work - Async callback receiving the session: async (session) => result
 * @returns {Promise<any>}
 */
export async function withTransaction(work) {
  let session = null
  try {
    session = await mongoose.startSession()
    session.startTransaction()

    const result = await work(session)

    await session.commitTransaction()
    return result
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction()
      } catch {
        // Suppress abort errors if transaction never started
      }
    }

    // Check if error is due to standalone MongoDB (no replica set support)
    const isNoReplicaSet =
      error?.message?.includes('Transaction numbers are only allowed on a replica set') ||
      error?.message?.includes('This MongoDB deployment does not support transactions') ||
      error?.codeName === 'IllegalOperation'

    if (isNoReplicaSet) {
      // Graceful fallback for standalone dev environments
      return work(null)
    }

    throw error
  } finally {
    if (session) {
      await session.endSession()
    }
  }
}
