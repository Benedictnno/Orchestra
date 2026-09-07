import axiosInstance from './axios';
import { Insight, ChatMessage, Transaction } from './types';

export const getInsights = async (): Promise<{ insights: Insight; fromCache: boolean }> => {
  return axiosInstance.get('/api/insights');
};

export const getSavingsCalculation = async (adjustments: Record<string, number>): Promise<{
  currentMonthly: number;
  projectedMonthly: number;
  monthlySavings: number;
  annualSavings: number;
  breakdown: Record<string, { current: number; projected: number; saving: number }>;
}> => {
  return axiosInstance.post('/api/insights/savings', { adjustments });
};

export const sendChatMessage = async (message: string): Promise<{ reply: string; history: ChatMessage[] }> => {
  return axiosInstance.post('/api/chat', { message });
};

export const getChatHistory = async (): Promise<{ history: ChatMessage[] }> => {
  return axiosInstance.get('/api/chat');
};

export const clearChatHistory = async (): Promise<{ message: string }> => {
  return axiosInstance.delete('/api/chat');
};

export const getAnomalies = async (): Promise<{ anomalies: Transaction[] }> => {
  return axiosInstance.get('/api/anomalies');
};

export const scanAnomalies = async (): Promise<{ message: string; flaggedCount: number }> => {
  return axiosInstance.post('/api/anomalies/scan');
};

export const getSpendingReport = async (days = 30): Promise<{ report: unknown }> => {
  return axiosInstance.get('/api/report', { params: { days } });
};
