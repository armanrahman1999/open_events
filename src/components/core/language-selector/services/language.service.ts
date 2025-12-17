import { clients } from '@/lib/localization';
import { LanguageResponse } from '../types/language.types';

const projectKey = 'EF83CA37DE4F438AAD4DE4B1AB2B91F0';

export const getLanguae = async (): Promise<LanguageResponse> => {
  const params = new URLSearchParams({
    ProjectKey: projectKey,
  });
  const url = `/uilm/v1/Language/Gets?${params.toString()}`;
  const res = await clients.get<LanguageResponse>(url);
  return res;
};

export const getUILMFile = async (language: string): Promise<any> => {
  const moduleName = 'open_events';
  const params = new URLSearchParams({
    Language: language,
    ModuleName: moduleName,
    ProjectKey: projectKey,
  });
  const url = `/uilm/v1/Key/GetUilmFile?${params.toString()}`;
  const res = await clients.get<any>(url);
  return res;
};
