import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

type ThemeStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme: 'light' })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('dark')
          document.documentElement.classList.add('light')
        }
      },
      toggleTheme: () => {
        get().setTheme('light')
      },
    }),
    {
      name: 'spaghetti-expresso-theme',
    }
  )
)
