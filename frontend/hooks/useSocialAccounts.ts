import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function useSocialAccounts() {
  return useQuery({ queryKey: ['social-accounts'], queryFn: () => api.get('/social-accounts').then(r => r.data) })
}

export function useConnectFacebook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { access_token: string; page_id: string }) => api.post('/social-accounts/facebook', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-accounts'] }); toast.success('Compte Facebook connecté !') },
    onError:   (e: any) => toast.error(e.response?.data?.message || 'Erreur de connexion Facebook'),
  })
}

export function useDisconnectAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/social-accounts/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-accounts'] }); toast.success('Compte déconnecté') },
  })
}
