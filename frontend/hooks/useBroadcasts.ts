import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function useBroadcasts() {
  return useQuery({ queryKey: ['broadcasts'], queryFn: () => api.get('/broadcasts').then(r => r.data) })
}

export function useBroadcastTemplates() {
  return useQuery({ queryKey: ['broadcast-templates'], queryFn: () => api.get('/broadcasts/templates').then(r => r.data), staleTime: Infinity })
}

export function useBroadcastSegments() {
  return useQuery({ queryKey: ['broadcast-segments'], queryFn: () => api.get('/broadcasts/segments').then(r => r.data), staleTime: 60000 })
}

export function useCreateBroadcast() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/broadcasts', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['broadcasts'] }); toast.success('Broadcast créé !') },
    onError:   (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  })
}

export function useSendBroadcast() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.post(`/broadcasts/${id}/send`).then(r => r.data),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['broadcasts'] }); toast.success(data.message) },
    onError:   (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  })
}
