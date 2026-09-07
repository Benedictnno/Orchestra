import axiosInstance from './axios';
import { VirtualCard } from './types';

export const getVirtualCards = async (): Promise<VirtualCard[]> => {
  const res: { virtualCards?: VirtualCard[]; cards?: VirtualCard[] } = await axiosInstance.get('/api/virtual-cards');
  return res?.virtualCards ?? res?.cards ?? [];
};

export const createVirtualCard = async (data: Partial<VirtualCard>): Promise<VirtualCard> => {
  return axiosInstance.post('/api/virtual-cards', data);
};

export const updateVirtualCardStatus = async (id: string, action: 'pause' | 'resume' | 'delete'): Promise<VirtualCard> => {
  return axiosInstance.patch(`/api/virtual-cards/${id}`, { action });
};
