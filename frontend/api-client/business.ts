import axiosInstance from './axios';
import { BusinessCard, ApprovalRequest } from './types';

export const getBusinessCards = async (): Promise<{ cards: BusinessCard[]; pendingActions: ApprovalRequest[] }> => {
  return axiosInstance.get('/api/business');
};

export const createBusinessCard = async (data: Partial<BusinessCard>): Promise<BusinessCard> => {
  return axiosInstance.post('/api/business', data);
};

export const updateBusinessCardStatus = async (id: string, status: 'active' | 'suspended'): Promise<BusinessCard> => {
  return axiosInstance.patch(`/api/business/${id}`, { status });
};

export const approveExpense = async (requestId: string, action: 'approve' | 'reject', note?: string): Promise<{ success: boolean; message: string }> => {
  return axiosInstance.post('/api/business/approve', { requestId, action, note });
};
