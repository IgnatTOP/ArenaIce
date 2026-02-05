import { create } from 'zustand'

interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  phone: string
  is_staff: boolean
  groups_info: Array<{ group_id: number; group_name: string; section: string }>
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false })
  },
}))
