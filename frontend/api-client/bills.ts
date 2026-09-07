import axiosInstance from './axios';
import { BillPayment } from './types';

export const getBillPayments = async (): Promise<BillPayment[]> => {
  const res: { payments?: BillPayment[] } = await axiosInstance.get('/api/bills');
  return res?.payments ?? [];
};

export const createBillPayment = async (data: {
  amount: number;
  sourceCardId: string;
  billerCode: string;
  billerName?: string;
  customerId: string;
  narration?: string;
}): Promise<{ success: boolean; payment: BillPayment }> => {
  return axiosInstance.post('/api/bills', data);
};
