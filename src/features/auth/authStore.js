import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      // Merge changes into the logged-in user (e.g. after editing the profile)
      updateUser: (changes) =>
        set((state) => ({ user: state.user ? { ...state.user, ...changes } : null })),
    }),
    { name: 'dalchat-auth' }
  )
)