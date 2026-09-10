import axiosInstance from './axios';
import { Insight, ChatMessage, Transaction, ChatSession } from './types';


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

export const sendChatMessage = async (
  message: string,
  sessionId?: string
): Promise<{
  reply: string;
  response: string;
  history: ChatMessage[];
  sessionId?: string;
  title?: string;
  artifact?: unknown;
}> => {
  return axiosInstance.post('/api/chat', { message, sessionId });
};

export const getChatHistory = async (sessionId?: string): Promise<{ history: ChatMessage[]; session?: ChatSession }> => {
  return axiosInstance.get('/api/chat', { params: { sessionId } });
};

export const getChatSessions = async (): Promise<{ sessions: ChatSession[] }> => {
  return axiosInstance.get('/api/chat/sessions');
};

export const createChatSession = async (title?: string): Promise<ChatSession> => {
  return axiosInstance.post('/api/chat/sessions', { title });
};

export const getChatSession = async (
  sessionId: string
): Promise<{ session: ChatSession & { messages: ChatMessage[] }; history: ChatMessage[] }> => {
  return axiosInstance.get(`/api/chat/sessions/${sessionId}`);
};

export const deleteChatSession = async (sessionId: string): Promise<{ message: string; sessionId: string }> => {
  return axiosInstance.delete(`/api/chat/sessions/${sessionId}`);
};

export const clearChatHistory = async (sessionId?: string): Promise<{ message: string }> => {
  return axiosInstance.delete('/api/chat', { params: { sessionId } });
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
