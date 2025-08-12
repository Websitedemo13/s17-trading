import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  Translations, 
  defaultTranslations,
  getStoredLanguage,
  setStoredLanguage 
} from '@/i18n';
import { viTranslations } from '@/i18n/translations/vi';

interface I18nState {
  currentLanguage: SupportedLanguage;
  translations: Translations;
  isLoading: boolean;
  
  // Actions
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  getTranslation: (key: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string) => string;
  interpolate: (template: string, values: Record<string, string | number>) => string;
}

// Translation mapping
const translationMap: Record<SupportedLanguage, Translations> = {
  vi: viTranslations,
  en: defaultTranslations,
  zh: defaultTranslations, // TODO: Add Chinese translations
  ja: defaultTranslations, // TODO: Add Japanese translations
  ko: defaultTranslations, // TODO: Add Korean translations
  th: defaultTranslations, // TODO: Add Thai translations
  id: defaultTranslations, // TODO: Add Indonesian translations
};

// Load translations for a language
const loadTranslations = async (language: SupportedLanguage): Promise<Translations> => {
  // For now, return from static mapping
  // In the future, this could load from API or dynamic imports
  return translationMap[language] || defaultTranslations;
};

// Get nested translation value
const getNestedTranslation = (obj: any, path: string): string => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return path if translation not found
    }
  }
  
  return typeof current === 'string' ? current : path;
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      currentLanguage: getStoredLanguage(),
      translations: translationMap[getStoredLanguage()] || defaultTranslations,
      isLoading: false,

      setLanguage: async (language: SupportedLanguage) => {
        set({ isLoading: true });
        
        try {
          const translations = await loadTranslations(language);
          
          // Update localStorage and DOM
          setStoredLanguage(language);
          
          set({ 
            currentLanguage: language, 
            translations,
            isLoading: false 
          });
          
          // Trigger page refresh for full language change if needed
          // window.location.reload();
        } catch (error) {
          console.error('Failed to load translations:', error);
          set({ isLoading: false });
        }
      },

      getTranslation: (key: string) => {
        const { translations } = get();
        return getNestedTranslation(translations, key);
      },

      formatNumber: (value: number, options?: Intl.NumberFormatOptions) => {
        const { currentLanguage } = get();
        const config = SUPPORTED_LANGUAGES[currentLanguage];
        
        try {
          return new Intl.NumberFormat(config.numberFormat.locale, {
            ...config.numberFormat,
            ...options
          }).format(value);
        } catch {
          return value.toString();
        }
      },

      formatCurrency: (value: number, currency?: string) => {
        const { currentLanguage } = get();
        const config = SUPPORTED_LANGUAGES[currentLanguage];
        
        try {
          return new Intl.NumberFormat(config.currencyFormat.locale, {
            ...config.currencyFormat,
            currency: currency || config.currencyFormat.currency
          }).format(value);
        } catch {
          return `${currency || '$'} ${value}`;
        }
      },

      formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
        const { currentLanguage } = get();
        const config = SUPPORTED_LANGUAGES[currentLanguage];
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        try {
          return new Intl.DateTimeFormat(config.numberFormat.locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
          }).format(dateObj);
        } catch {
          return dateObj.toLocaleDateString();
        }
      },

      formatRelativeTime: (date: Date | string) => {
        const { currentLanguage, translations } = get();
        const config = SUPPORTED_LANGUAGES[currentLanguage];
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
        
        try {
          const rtf = new Intl.RelativeTimeFormat(config.numberFormat.locale, { 
            numeric: 'auto' 
          });
          
          if (diffInSeconds < 60) {
            return translations.time.now;
          } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return rtf.format(-minutes, 'minute');
          } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return rtf.format(-hours, 'hour');
          } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return rtf.format(-days, 'day');
          } else if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return rtf.format(-months, 'month');
          } else {
            const years = Math.floor(diffInSeconds / 31536000);
            return rtf.format(-years, 'year');
          }
        } catch {
          // Fallback for unsupported browsers
          if (diffInSeconds < 60) return translations.time.now;
          if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${translations.time.minutesAgo}`;
          if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${translations.time.hoursAgo}`;
          return get().formatDate(dateObj);
        }
      },

      interpolate: (template: string, values: Record<string, string | number>) => {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return values[key]?.toString() || match;
        });
      },
    }),
    {
      name: 'i18n-storage',
      partialize: (state) => ({ currentLanguage: state.currentLanguage }),
    }
  )
);

// Hook for easier translation access
export const useTranslation = () => {
  const { 
    getTranslation, 
    formatNumber, 
    formatCurrency, 
    formatDate, 
    formatRelativeTime,
    interpolate,
    currentLanguage 
  } = useI18nStore();
  
  return {
    t: getTranslation,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    interpolate,
    currentLanguage,
    isRTL: SUPPORTED_LANGUAGES[currentLanguage]?.rtl || false,
  };
};

// Hook for language switching
export const useLanguage = () => {
  const { currentLanguage, setLanguage, isLoading } = useI18nStore();
  
  return {
    currentLanguage,
    setLanguage,
    isLoading,
    availableLanguages: Object.values(SUPPORTED_LANGUAGES),
  };
};

// Initialize language on app start
export const initializeI18n = () => {
  const { currentLanguage } = useI18nStore.getState();
  setStoredLanguage(currentLanguage);
};
