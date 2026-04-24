import { createContext, useContext } from 'react'

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: 'light'
  resolvedTheme: 'light'
  defaultTheme: 'light'
  setTheme: (theme: string) => void
  resetTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: 'light',
  resolvedTheme: 'light',
  defaultTheme: 'light',
  setTheme: () => null,
  resetTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext value={initialState}>
      {children}
    </ThemeContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
