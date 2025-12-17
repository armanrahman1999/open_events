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

/**
 * Hardcoded available languages
 */
const AVAILABLE_LANGUAGES = [
  {
    itemId: '1',
    languageCode: 'en-US',
    languageName: 'English',
    isDefault: true,
  },
  {
    itemId: '2',
    languageCode: 'de-DE',
    languageName: 'Deutsch',
    isDefault: false,
  },
];

/**
 * Type definition for the Language Context.
 * Provides language-related state and functionality throughout the application.
 *
 * @interface LanguageContextType
 */
interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string, isUserAction?: boolean) => Promise<void>;
  isLoading: boolean;
  availableLanguages: any[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Props for the LanguageProvider component.
 *
 * @interface LanguageProviderProps
 */
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

/**
 * Language Provider Component
 *
 * Provides language context to the application with hardcoded language options.
 * No API calls are made - all languages are pre-defined.
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'en-US',
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(defaultLanguage);
  const [isLoading] = useState(false);
  const { i18n } = useTranslation();
  const isInitialized = useRef(false);

  const setLanguage = useCallback(
    async (language: string, isUserAction = true): Promise<void> => {
      try {
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
      }
    },
    [i18n]
  );

  /**
   * Initialize language on mount
   */
  useEffect(() => {
    if (!isInitialized.current) {
      const storedLanguage =
        typeof window !== 'undefined' ? localStorage.getItem('language') : null;
      const initialLanguage = storedLanguage || defaultLanguage;

      setCurrentLanguage(initialLanguage);
      i18n.changeLanguage(initialLanguage);
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
    [currentLanguage, setLanguage, isLoading]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

/**
 * Hook to access the language context
 */
export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
};
