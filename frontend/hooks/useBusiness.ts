import { useQuery, useMutation } from '@tanstack/react-query';
import { getBusinessCards, createBusinessCard, updateBusinessCardStatus, approveExpense } from '@/api/business';
import { queryClient } from '@/lib/queryClient';
import { BusinessCard } from '@/api/types';

export const useBusinessCards = () => {
  return useQuery({
    queryKey: ['business-cards'],
    queryFn: getBusinessCards,
  });
};

export const useCreateBusinessCard = () => {
  return useMutation({
    mutationFn: (data: Partial<BusinessCard>) => createBusinessCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cards'] });
    },
  });
};

export const useUpdateBusinessCardStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      updateBusinessCardStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cards'] });
    },
  });
};

export const useApproveExpense = () => {
  return useMutation({
    mutationFn: ({ requestId, action, note }: { requestId: string; action: 'approve' | 'reject'; note?: string }) =>
      approveExpense(requestId, action, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cards'] });
      queryClient.invalidateQueries({ queryKey: ['business-approvals'] });
    },
  });
};
