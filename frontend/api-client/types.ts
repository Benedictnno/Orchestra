export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'individual' | 'business';
  businessName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  pan: string;
  expiryDate: string;
  issuerNr?: string;
  cardStatus: string;
  cardType: 'debit' | 'prepaid' | 'virtual';
  label: string;
  isDefault?: boolean;
  isUltimate?: boolean;
  nameOnCard?: string;
  cardProgram?: string;
  spendLimit?: number;
  availableBalance?: number;
  ledgerBalance?: number;
  currency?: string;
  bank?: string;
  accountNumber?: string;
  color?: string;
}

export interface VirtualCard {
  _id: string;
  userId: string;
  parentCardId: string | Card;
  label: string;
  merchant?: string;
  spendLimit: number;
  amountSpent: number;
  autoRenew: boolean;
  paused: boolean;
  pan: string;
  expiryDate: string;
  cardStatus?: string;
}

export interface BusinessCard {
  _id: string;
  businessUserId: string;
  assignedTo: string;
  purpose?: string;
  budget: number;
  amountSpent: number;
  merchantCategories?: string[];
  expiresAt?: string;
  status: 'active' | 'suspended' | 'exhausted';
  approvalThreshold?: number;
  pan: string;
  pendingApprovals?: number;
  label?: string;
  department?: string;
  cardHolder?: string;
  availableBalance?: number;
  spendLimit?: number;
  cardStatus?: string;
}

export interface ApprovalRequest {
  _id: string;
  businessCardId: string | Partial<BusinessCard>;
  requestedBy: string;
  amount: number;
  merchant?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt?: string;
}

export interface Transaction {
  _id: string;
  pan?: string;
  cardId?: string;
  userId: string;
  amount: number;
  currency: string;
  merchant?: string;
  category?: string;
  narration?: string;
  transactionDate: string;
  isAnomaly: boolean;
  anomalyReason?: string;
  type?: 'debit' | 'top_up' | 'transfer' | 'bill_payment';
}

export interface Transfer {
  _id: string;
  userId: string;
  sourceCardId: string;
  sourcePan?: string;
  amount: number;
  currency: string;
  narration?: string;
  reference: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  recipientBankName?: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

export interface BillPayment {
  _id: string;
  userId: string;
  sourceCardId: string;
  sourcePan?: string;
  amount: number;
  currency: string;
  reference: string;
  billerCode: string;
  billerName?: string;
  customerId: string;
  narration?: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

export interface RoutingRule {
  _id: string;
  userId: string;
  mode: 'primary' | 'balanced' | 'auto-split';
  primaryCardId?: string | Partial<Card>;
  cardOrder: (string | Partial<Card>)[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TransactionSummary {
  totalSpent: number;
  transactionCount: number;
  subscriptionSpend: number;
  anomalyCount: number;
  byCategory: Record<string, number>;
  dailySpend: Record<string, number>;
  topMerchants: [string, number][];
}

export interface InsightItem {
  title: string;
  detail: string;
}

export interface FinancialScore {
  score: number;
  label: string;
}

export interface Insight {
  _id: string;
  userId: string;
  summary: string;
  insights: InsightItem[];
  recommendations: InsightItem[];
  anomalies: string[];
  savingsOpportunity: number;
  byCategory: Record<string, number>;
  totalSpent: number;
  financialScore: FinancialScore | number;
  generatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sentAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
