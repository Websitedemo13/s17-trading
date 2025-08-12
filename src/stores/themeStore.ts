import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setPrimaryColor: (color: string) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      primaryColor: 'hsl(220, 100%, 60%)', // Default blue

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      setPrimaryColor: (color) => {
        set({ primaryColor: color });
        document.documentElement.style.setProperty('--primary', color);
        
        // Store in localStorage for persistence across sessions
        localStorage.setItem('primary-color', color);
      },

      initializeTheme: () => {
        const { theme, primaryColor } = get();
        applyTheme(theme);
        
        // Apply saved primary color
        const savedColor = localStorage.getItem('primary-color');
        if (savedColor) {
          document.documentElement.style.setProperty('--primary', savedColor);
          set({ primaryColor: savedColor });
        } else {
          document.documentElement.style.setProperty('--primary', primaryColor);
        }
      }
    }),
    {
      name: 'theme-settings',
      partialize: (state) => ({ 
        theme: state.theme,
        primaryColor: state.primaryColor 
      })
    }
  )
);

function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = window.document.documentElement;
  
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

// Initialize theme on app start
if (typeof window !== 'undefined') {
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      applyTheme('system');
    }
  });
}
