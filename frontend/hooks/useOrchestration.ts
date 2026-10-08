import { useQuery, useMutation } from '@tanstack/react-query'
import {
  getOrchestraCard,
  getFundingSources,
  selectFundingSource,
  routePayment,
} from '@/api/orchestration'
import { queryClient } from '@/lib/queryClient'

export const useOrchestraCard = () => {
  return useQuery({
    queryKey: ['orchestration', 'card'],
    queryFn: getOrchestraCard,
  })
}

export const useFundingSources = () => {
  return useQuery({
    queryKey: ['orchestration', 'sources'],
    queryFn: getFundingSources,
  })
}

export const useSelectFundingSource = () => {
  return useMutation({
    mutationFn: selectFundingSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orchestration'] })
      queryClient.invalidateQueries({ queryKey: ['orchestration', 'card'] })
      queryClient.invalidateQueries({ queryKey: ['orchestration', 'sources'] })
    },
  })
}

export const useRoutePayment = () => {
  return useMutation({
    mutationFn: routePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orchestration'] })
      queryClient.invalidateQueries({ queryKey: ['orchestration', 'card'] })
      queryClient.invalidateQueries({ queryKey: ['orchestration', 'sources'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
