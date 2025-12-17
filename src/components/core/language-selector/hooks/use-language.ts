import { useQuery } from '@tanstack/react-query';
import { LanguageResponse } from '../types/language.types';
import { getLanguae, getUILMFile } from '../services/language.service';

export const useAvailableLanguages = () => {
  return useQuery<LanguageResponse>({
    queryKey: ['getLanguages'],
    queryFn: () => getLanguae(),
    staleTime: 0,
    refetchOnMount: true,
    refetchIntervalInBackground: false,
  });
};

export const useGetUilmFile = (language: string) => {
  return useQuery({
    queryKey: ['getUilmFile', language],
    queryFn: () => getUILMFile(language),
  });
};
