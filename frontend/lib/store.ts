import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User { id: number; name: string; email: string; role: string; avatar?: string }
interface Workspace { id: number; name: string; slug: string; plan: string; status: string; plan_limits: Record<string, number> }

interface AppState {
  user: User | null
  workspace: Workspace | null
  token: string | null
  setAuth: (user: User, workspace: Workspace, token: string) => void
  clearAuth: () => void
  updateWorkspace: (ws: Partial<Workspace>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null, workspace: null, token: null,
      setAuth: (user, workspace, token) => {
        localStorage.setItem('afrihub_token', token)
        set({ user, workspace, token })
      },
      clearAuth: () => {
        localStorage.removeItem('afrihub_token')
        set({ user: null, workspace: null, token: null })
      },
      updateWorkspace: (ws) => set((s) => ({ workspace: s.workspace ? { ...s.workspace, ...ws } : null })),
    }),
    { name: 'afrihub-store', partialize: (s) => ({ user: s.user, workspace: s.workspace, token: s.token }) }
  )
)
