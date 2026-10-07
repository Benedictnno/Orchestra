import axiosInstance from './axios';
import { Transfer, TransferPreview } from './types';

export const getTransfers = async (): Promise<Transfer[]> => {
  const res: { transfers?: Transfer[] } = await axiosInstance.get('/api/transfers');
  return res?.transfers ?? [];
};

export interface CreateTransferInput {
  amount: number;              // Naira
  sourceCardId?: string;       // single source (legacy)
  sourceCardIds?: string[];    // multi-source funding pool
  recipientBank: string;
  recipientAccount: string;
  recipientName: string;
  narration?: string;
  category?: string;
}

export const createTransfer = async (
  data: CreateTransferInput
): Promise<{ success: boolean; transfer: Transfer }> => {
  return axiosInstance.post('/api/transfers', data);
};

/**
 * Read-only allocation preview. Never mutates balances — safe to call as the
 * user edits the amount or toggles funding sources.
 */
export const previewTransfer = async (
  data: { amount: number; sourceCardIds: string[] }
): Promise<TransferPreview> => {
  const res: { success: boolean; preview: TransferPreview } = await axiosInstance.post(
    '/api/transfers/preview',
    data
  );
  return res.preview;
};
