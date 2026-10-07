// Always store in kobo, only convert for display
export const toNaira = (kobo: number | undefined) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 2
  }).format((kobo || 0) / 100)

export interface FormattedTxAmount {
  formatted: string
  isCredit: boolean
  colorClass: string
}

export function formatTxAmount(
  amount: number | undefined,
  txMeta?: { type?: string; category?: string; merchant?: string; narration?: string }
): FormattedTxAmount {
  const type = txMeta?.type?.toLowerCase() || ''
  const cat = txMeta?.category?.toLowerCase() || ''
  const merchant = txMeta?.merchant?.toLowerCase() || ''
  const narration = txMeta?.narration?.toLowerCase() || ''

  // Determine if transaction is incoming (credit / top-up / refund / income)
  const isIncoming =
    type === 'top_up' ||
    type === 'credit' ||
    type === 'deposit' ||
    type === 'refund' ||
    type === 'inflow' ||
    cat === 'income' ||
    cat === 'deposit' ||
    cat === 'refund' ||
    merchant.includes('top-up') ||
    merchant.includes('top up') ||
    merchant.includes('deposit') ||
    merchant.includes('refund') ||
    narration.includes('top-up') ||
    narration.includes('top up') ||
    narration.includes('deposit') ||
    narration.includes('refund') ||
    narration.includes('received') ||
    narration.includes('credit')

  const absKobo = Math.abs(amount || 0)
  const absNaira = absKobo / 100
  const formattedNumber = absNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (isIncoming) {
    return {
      formatted: `+₦${formattedNumber}`,
      isCredit: true,
      colorClass: 'text-emerald-600',
    }
  } else {
    return {
      formatted: `-₦${formattedNumber}`,
      isCredit: false,
      colorClass: 'text-rose-600',
    }
  }
}

export const maskPAN = (pan: string | undefined) => {
  if (!pan) return '•••• •••• •••• ••••'
  if (pan.startsWith('VIRT') || pan.startsWith('BIZ')) return pan
  const clean = pan.replace(/[\s-]/g, '')
  if (clean.length >= 12) {
    const first4 = /^\d{4}/.test(clean) ? clean.slice(0, 4) : '••••'
    return `${first4} •••• •••• ${clean.slice(-4)}`
  }
  return '•••• •••• •••• ' + clean.slice(-4)
}

export const formatPAN = maskPAN

export function formatCardGroups(
  pan: string | undefined,
  reveal: boolean = true,
  isUltimate: boolean = false,
  cardProgram?: string,
  bank?: string
): [string, string, string, string] {
  if (isUltimate) {
    if (!reveal) {
      return ['4000', '••••', '••••', '9010']
    }
    return ['4000', '1234', '5678', '9010']
  }

  if (!pan) {
    if (cardProgram === 'VISA' || bank?.toLowerCase().includes('access')) {
      return reveal ? ['4084', '7291', '3048', '7150'] : ['4084', '••••', '••••', '7150']
    }
    if (cardProgram === 'MASTERCARD' || bank?.toLowerCase().includes('union')) {
      return reveal ? ['5399', '4812', '3901', '8842'] : ['5399', '••••', '••••', '8842']
    }
    return reveal ? ['5061', '9840', '2198', '4419'] : ['5061', '••••', '••••', '4419']
  }

  const clean = pan.replace(/[\s-]/g, '')

  // If clean has full 16 digits
  if (clean.length === 16 && /^\d+$/.test(clean)) {
    if (!reveal) {
      return [clean.slice(0, 4), '••••', '••••', clean.slice(12, 16)]
    }
    return [
      clean.slice(0, 4),
      clean.slice(4, 8),
      clean.slice(8, 12),
      clean.slice(12, 16),
    ]
  }

  // If clean is masked (e.g. ****-****-****-9012 or ****9012)
  const last4 = clean.slice(-4)
  let prefix = '5399'
  let mid1 = '4812'
  let mid2 = '3901'
  if (clean.startsWith('5061') || bank?.toLowerCase().includes('gtb') || cardProgram === 'VERVE') {
    prefix = '5061'
    mid1 = '9840'
    mid2 = '2198'
  } else if (clean.startsWith('4084') || bank?.toLowerCase().includes('access') || cardProgram === 'VISA') {
    prefix = '4084'
    mid1 = '7291'
    mid2 = '3048'
  } else if (clean.startsWith('5399') || bank?.toLowerCase().includes('union') || cardProgram === 'MASTERCARD') {
    prefix = '5399'
    mid1 = '4812'
    mid2 = '3901'
  }

  if (!reveal) {
    return [prefix, '••••', '••••', last4 || '8842']
  }
  return [prefix, mid1, mid2, last4 || '8842']
}

export const formatExpiry = (expiryDate: string | undefined) => {
  if (!expiryDate || expiryDate.length < 4) return ''
  return expiryDate.slice(2) + '/' + expiryDate.slice(0, 2)
}

export const formatDate = (date: string | Date | number) =>
  new Intl.DateTimeFormat('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(date))

export const cardStatusLabel = (status: string | undefined) => {
  const labels: Record<string, string> = { '0': 'Inactive', '1': 'Active', '2': 'Blocked' }
  return status ? (labels[status] ?? 'Unknown') : 'Unknown'
}

export const cardStatusColor = (status: string | undefined) => {
  const colors: Record<string, string> = { '0': 'text-gray-500', '1': 'text-green-600', '2': 'text-red-600' }
  return status ? (colors[status] ?? '') : ''
}

export const percentUsed = (spent: number, budget: number) =>
  Math.min(100, Math.round((spent / budget) * 100))

