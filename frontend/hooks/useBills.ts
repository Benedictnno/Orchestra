import { useQuery, useMutation } from '@tanstack/react-query';
import { getBillPayments, createBillPayment } from '@/api/bills';
import { queryClient } from '@/lib/queryClient';

export const useBillPayments = () => {
  return useQuery({
    queryKey: ['bills'],
    queryFn: getBillPayments,
  });
};

export const useCreateBillPayment = () => {
  return useMutation({
    mutationFn: createBillPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
