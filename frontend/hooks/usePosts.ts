import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function usePosts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => api.get('/posts', { params }).then(r => r.data),
  })
}

export function usePostCalendar(from?: string, to?: string) {
  return useQuery({
    queryKey: ['posts-calendar', from, to],
    queryFn: () => api.get('/posts/calendar', { params: { from, to } }).then(r => r.data),
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/posts', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post créé avec succès !')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur lors de la création'),
  })
}

export function usePublishPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: number) => api.post(`/posts/${postId}/publish`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Publication en cours...')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: number) => api.delete(`/posts/${postId}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post supprimé')
    },
  })
}

export function usePostStats(postId: number) {
  return useQuery({
    queryKey: ['post-stats', postId],
    queryFn: () => api.get(`/posts/${postId}/stats`).then(r => r.data),
    enabled: !!postId,
  })
}
