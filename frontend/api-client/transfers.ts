import axiosInstance from './axios';
import { Transfer } from './types';

export const getTransfers = async (): Promise<Transfer[]> => {
  const res: { transfers: Transfer[] } = await axiosInstance.get('/api/transfers');
  return res.transfers;
};

export const createTransfer = async (data: {
  amount: number;
  sourceCardId: string;
  recipientBank: string;
  recipientAccount: string;
  recipientName: string;
  narration?: string;
}): Promise<{ success: boolean; transfer: Transfer }> => {
  return axiosInstance.post('/api/transfers', data);
};
