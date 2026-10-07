import { useQuery, useMutation } from '@tanstack/react-query';
import { getBusinessCards, createBusinessCard, updateBusinessCardStatus, approveExpense } from '@/api/business';
import { queryClient } from '@/lib/queryClient';
import { BusinessCard } from '@/api/types';
import toast from 'react-hot-toast';

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

export const useApprovalActions = () => {
  const { mutate } = useApproveExpense();

  const approve = (requestId: string, note?: string) =>
    mutate(
      { requestId, action: 'approve', note },
      {
        onSuccess: () => toast.success('Expense request approved and settled'),
        onError: () => toast.error('Failed to approve request'),
      }
    );

  const reject = (requestId: string, note?: string) =>
    mutate(
      { requestId, action: 'reject', note },
      {
        onSuccess: () => toast.success('Expense request rejected'),
        onError: () => toast.error('Failed to reject request'),
      }
    );

  return { approve, reject };
};
