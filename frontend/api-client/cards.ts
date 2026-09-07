import axiosInstance from './axios';
import { Card } from './types';

export const getCards = async (): Promise<Card[]> => {
  const res: { cards?: Card[] } = await axiosInstance.get('/api/cards');
  return res?.cards ?? [];
};

export const createCard = async (cardData: Partial<Card>): Promise<Card> => {
  return axiosInstance.post('/api/cards', cardData);
};

export const getCardById = async (id: string): Promise<Card> => {
  return axiosInstance.get(`/api/cards/${id}`);
};

export const updateCardStatus = async (id: string, action: 'block' | 'unblock'): Promise<Card> => {
  return axiosInstance.patch(`/api/cards/${id}`, { action });
};

export const deleteCard = async (id: string): Promise<{ success: boolean }> => {
  return axiosInstance.delete(`/api/cards/${id}`);
};

export const getCardBalance = async (id: string): Promise<{ balance: number; currency: string }> => {
  return axiosInstance.get(`/api/cards/${id}/balance`);
};
