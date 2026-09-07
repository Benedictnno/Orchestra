import { useQuery, useMutation } from '@tanstack/react-query';
import { getTransfers, createTransfer } from '@/api/transfers';
import { queryClient } from '@/lib/queryClient';

export const useTransfers = () => {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: getTransfers,
  });
};

export const useCreateTransfer = () => {
  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
