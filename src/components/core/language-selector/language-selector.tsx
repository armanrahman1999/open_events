import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui-kit/dropdown-menu';
import { useLanguageContext } from '@/i18n/language-context';
import { useAvailableLanguages } from './hooks/use-language';

export const LanguageSelector = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentLanguage, setLanguage } = useLanguageContext();
  const { data: AVAILABLE_LANGUAGES = [] } = useAvailableLanguages();

  useEffect(() => {
    if (AVAILABLE_LANGUAGES) {
      const currentLanguageExists = AVAILABLE_LANGUAGES.some(
        (lang) => lang.languageCode === currentLanguage
      );

      if (!currentLanguageExists) {
        const defaultLanguage = AVAILABLE_LANGUAGES.find((lang) => lang.isDefault);
        if (defaultLanguage) {
          setLanguage(defaultLanguage.languageCode);
        }
      }
    }
  }, [currentLanguage, setLanguage, AVAILABLE_LANGUAGES]);

  const changeLanguage = async (newLanguageCode: string) => {
    await setLanguage(newLanguageCode);
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center gap-1 h-[34px] px-2 rounded-[4px] hover:bg-surface">
          <span className="text-sm font-semibold text-medium-emphasis">
            {AVAILABLE_LANGUAGES.find((lang) => lang.languageCode === currentLanguage)
              ?.languageName || currentLanguage}
          </span>
          {isDropdownOpen ? (
            <ChevronUp className="h-4 w-4 text-medium-emphasis" />
          ) : (
            <ChevronDown className="h-4 w-4 text-medium-emphasis" />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {AVAILABLE_LANGUAGES.map((lang, i) => (
          <div key={lang.itemId}>
            <DropdownMenuItem
              className={cn({
                'font-bold cursor-pointer': lang.languageCode === currentLanguage,
              })}
              onClick={() => changeLanguage(lang.languageCode)}
            >
              {lang.languageName} {lang.isDefault && '(Default)'}
            </DropdownMenuItem>
            {i !== AVAILABLE_LANGUAGES.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
