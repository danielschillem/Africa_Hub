import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function useCampaigns() {
  return useQuery({ queryKey: ['campaigns'], queryFn: () => api.get('/campaigns').then(r => r.data) })
}

export function useCampaignPresets() {
  return useQuery({ queryKey: ['campaign-presets'], queryFn: () => api.get('/campaigns/presets').then(r => r.data), staleTime: Infinity })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/campaigns', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campagne créée !') },
    onError:   (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  })
}

export function useLaunchCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.post(`/campaigns/${id}/launch`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campagne lancée !') },
    onError:   (e: any) => toast.error(e.response?.data?.message || 'Erreur au lancement'),
  })
}
