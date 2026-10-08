import axiosInstance from './axios'
import { Card } from './types'

export interface OrchestraCardResponse {
  card: {
    _id: string
    userId: string
    status: string
    cardId: Card | null
    selectedFundingSourceId: Card | null
    createdAt?: string
    updatedAt?: string
  }
}

export interface FundingSource {
  _id: string
  label: string
  bank?: string | null
  cardProgram?: string | null
  color?: string | null
  pan: string
  availableBalance: number
  isSelected: boolean
}

export interface FundingSourcesResponse {
  sources: FundingSource[]
  selectedFundingSourceId: string | null
}

export interface RoutePaymentRequest {
  amount: number // kobo
  merchant?: string
  category?: string
  narration?: string
}

export interface RoutePaymentSuccessResponse {
  success: true
  transactionId: string
  reference: string
  amount: number
  currency: string
  merchant: string
  fundingSourceId: string
  fundingSourceName: string
  maskedFundingSourcePan: string
  orchestraCardId: string
  balanceBefore: number
  balanceAfter: number
  status: 'COMPLETED'
}

export interface RoutePaymentFailureResponse {
  success: false
  reason: string
  fundingSourceName: string
  availableBalance: number
  requestedAmount: number
}

export type RoutePaymentResponse = RoutePaymentSuccessResponse | RoutePaymentFailureResponse

export const getOrchestraCard = async (): Promise<OrchestraCardResponse> => {
  const res = await axiosInstance.get('/api/orchestration/card')
  return res as unknown as OrchestraCardResponse
}

export const getFundingSources = async (): Promise<FundingSourcesResponse> => {
  const res = await axiosInstance.get('/api/orchestration/sources')
  return res as unknown as FundingSourcesResponse
}

export const selectFundingSource = async (fundingSourceId: string): Promise<OrchestraCardResponse> => {
  const res = await axiosInstance.post('/api/orchestration/select-source', { fundingSourceId })
  return res as unknown as OrchestraCardResponse
}

export const routePayment = async (data: RoutePaymentRequest): Promise<RoutePaymentResponse> => {
  const res = await axiosInstance.post('/api/orchestration/pay', data)
  return res as unknown as RoutePaymentResponse
}
