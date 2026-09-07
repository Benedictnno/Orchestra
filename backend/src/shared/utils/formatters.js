/**
 * Shared utility formatters
 */

/**
 * Mask PAN to last 4 digits for API responses (e.g., ****-****-****-1234)
 */
export function maskPan(pan) {
  if (!pan) return null
  return `****-****-****-${pan.slice(-4)}`
}

/**
 * Convert Naira to Kobo
 */
export function nairaToKobo(naira) {
  return Math.round(Number(naira) * 100)
}

/**
 * Convert Kobo to Naira
 */
export function koboToNaira(kobo) {
  return Number(kobo) / 100
}
