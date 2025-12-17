import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import enTranslations from './locales/en.json';
// import deTranslations from './locales/de.json';
import { getUILMFile } from '@/components/core/language-selector/services/language.service';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

i18n.use(initReactI18next).init({
  lng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  resources: {},
});

export const loadTranslations = async (language: string): Promise<any> => {
  try {
    const translations = await getUILMFile(language);
    if (!translations) {
      return;
    }
    i18n.addResourceBundle(language, 'translation', translations, true, true);
  } catch (error) {
    console.error(' Failed to fetch translation language');
  }
};

declare global {
  interface Window {
    __i18nKeyMode?: boolean;
  }
}

// Initialise global flag
if (typeof window !== 'undefined') {
  window.__i18nKeyMode = false;
}

// Preserve original translator
const originalT = i18n.t.bind(i18n);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(i18n as any).t = (key: string | string[], options?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.__i18nKeyMode) {
    if (Array.isArray(key)) return key[0];
    return key;
  }
  return (originalT as any)(key, options);
};

// Listen for messages coming from the browser extension
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return; // Ignore messages from iframes or other sources
    if (event.origin !== window.location.origin) return; // Prevent cross-origin injections
    const { data } = event;
    if (!data || typeof data !== 'object') return;

    const { action, keymode } = data as { action?: string; keymode?: boolean };
    if (action === 'keymode' && typeof keymode === 'boolean') {
      const previous = window.__i18nKeyMode;
      window.__i18nKeyMode = keymode;

      if (previous !== keymode) {
        (i18n as any).emit('languageChanged', i18n.language);
      }
    }
  });
}

export default i18n;
