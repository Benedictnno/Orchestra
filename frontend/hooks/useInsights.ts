import { useQuery, useMutation } from '@tanstack/react-query';
import { getInsights, getSavingsCalculation, getAnomalies, scanAnomalies } from '@/api/insights';
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
