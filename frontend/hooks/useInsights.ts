import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getInsights,
  getSavingsCalculation,
  getAnomalies,
  scanAnomalies,
  getChatSessions,
  createChatSession,
  getChatSession,
  deleteChatSession,
} from '@/api/insights';
import { queryClient } from '@/lib/queryClient';

export const useInsights = () => {
  return useQuery({
    queryKey: ['insights'],
    queryFn: getInsights,
  });
};

export const useSavings = (adjustments: Record<string, number>) => {
  return useQuery({
    queryKey: ['savings', adjustments],
    queryFn: () => getSavingsCalculation(adjustments),
    enabled: Object.keys(adjustments).length > 0,
  });
};

export const useAnomalies = () => {
  return useQuery({
    queryKey: ['anomalies'],
    queryFn: getAnomalies,
  });
};

export const useScanAnomalies = () => {
  return useMutation({
    mutationFn: scanAnomalies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
};

export const useChatSessions = () => {
  return useQuery({
    queryKey: ['chat-sessions'],
    queryFn: getChatSessions,
    staleTime: 1000 * 30, // 30s
  });
};

export const useChatSession = (sessionId?: string | null) => {
  return useQuery({
    queryKey: ['chat-session', sessionId],
    queryFn: () => (sessionId ? getChatSession(sessionId) : null),
    enabled: Boolean(sessionId),
  });
};

export const useCreateChatSession = () => {
  return useMutation({
    mutationFn: (title?: string) => createChatSession(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
};

export const useDeleteChatSession = () => {
  return useMutation({
    mutationFn: (sessionId: string) => deleteChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
};

