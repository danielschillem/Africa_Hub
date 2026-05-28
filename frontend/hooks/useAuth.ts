import { useAppStore } from '@/lib/store'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { user, workspace, token, setAuth, clearAuth } = useAppStore()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    setAuth(data.user, data.workspace, data.token)
    router.push('/dashboard')
    return data
  }

  const register = async (payload: Record<string, string>) => {
    const { data } = await api.post('/auth/register', payload)
    setAuth(data.user, data.workspace, data.token)
    router.push('/dashboard')
    return data
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    clearAuth()
    router.push('/auth/login')
  }

  const isAuthenticated = !!token
  const canPublish  = user?.role !== 'viewer'
  const canCampaign = user?.role === 'owner' || user?.role === 'admin'
  const canSettings = user?.role === 'owner' || user?.role === 'admin'

  return { user, workspace, token, login, register, logout, isAuthenticated, canPublish, canCampaign, canSettings }
}
