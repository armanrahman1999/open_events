import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useAvailableLanguages } from '@/components/core/language-selector/hooks/use-language';
import { loadTranslations } from './i18n';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string, isUserAction?: boolean) => Promise<void>;
  isLoading: boolean;
  availableLanguages: any[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'en-US',
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const { i18n } = useTranslation();
  const { data: AVAILABLE_LANGUAGES = [] } = useAvailableLanguages();
  const isInitialized = useRef(false);

  const setLanguage = useCallback(
    async (language: string, isUserAction = true): Promise<void> => {
      try {
        setIsLoading(true);

        // Load translations from API
        await loadTranslations(language);

        if (typeof window !== 'undefined') {
          localStorage.setItem('language', language);
          if (isUserAction) {
            localStorage.setItem('language_user_selected', 'true');
          }
        }

        await i18n.changeLanguage(language);
        setCurrentLanguage(language);
      } catch (error) {
        console.error('Failed to change language:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [i18n]
  );

  useEffect(() => {
    if (!isInitialized.current) {
      const storedLanguage =
        typeof window !== 'undefined' ? localStorage.getItem('language') : null;
      const initialLanguage = storedLanguage || defaultLanguage;

      setCurrentLanguage(initialLanguage);

      // Load translations from API on app initialization
      setIsLoading(true);
      loadTranslations(initialLanguage)
        .then(() => {
          i18n.changeLanguage(initialLanguage);
        })
        .catch((error) => {
          console.error('Failed to load initial translations:', error);
          i18n.changeLanguage(initialLanguage);
        })
        .finally(() => {
          setIsLoading(false);
        });

      isInitialized.current = true;
    }
  }, [defaultLanguage, i18n]);

  const value = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      isLoading,
      availableLanguages: AVAILABLE_LANGUAGES,
    }),
    [currentLanguage, setLanguage, isLoading, AVAILABLE_LANGUAGES]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
};
