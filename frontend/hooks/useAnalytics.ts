import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export function useDashboardAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: ['analytics-dashboard', from, to],
    queryFn: () => api.get('/analytics/dashboard', { params: { from, to } }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePostsAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: ['analytics-posts', from, to],
    queryFn: () => api.get('/analytics/posts', { params: { from, to } }).then(r => r.data),
  })
}

export function useConversionAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: ['analytics-conversion', from, to],
    queryFn: () => api.get('/analytics/conversion', { params: { from, to } }).then(r => r.data),
  })
}
