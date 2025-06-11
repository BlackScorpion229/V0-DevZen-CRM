import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  username: string
  role: "admin" | "user"
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        // Simple authentication - in production, this would be server-side
        const users = [
          { id: "1", username: "admin", password: "admin123", role: "admin" as const },
          { id: "2", username: "user", password: "user123", role: "user" as const },
        ]

        const user = users.find((u) => u.username === username && u.password === password)
        if (user) {
          set({ user: { id: user.id, username: user.username, role: user.role }, isAuthenticated: true })
          return true
        }
        return false
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

export const auth = () => useAuth.getState()
