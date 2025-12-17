import { useAuthStore } from '@/state/store/auth';
import { getRefreshToken } from '@/modules/auth/services/auth.service';
import { isLocalhost } from './utils/localhost-checker/locahost-checker';

interface Https {
  get<T>(url: string, headers?: HeadersInit): Promise<T>;
  request<T>(url: string, options: RequestOptions): Promise<T>;
  createHeaders(headers?: HeadersInit): Headers;
  handleAuthError<T>(url: string, headers?: HeadersInit): Promise<T>;
}

interface RequestOptions {
  method: 'GET';
  headers?: HeadersInit;
}

export class HttpError extends Error {
  status: number;
  error: Record<string, unknown>;

  constructor(status: number, error: Record<string, unknown>) {
    const errorMessage =
      typeof (error as any)?.message === 'string' ? (error as any).message : JSON.stringify(error);

    super(errorMessage);
    this.status = status;
    this.error = error;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
const localHostChecker = isLocalhost();

export const clients: Https = {
  async get<T>(url: string, headers: HeadersInit = {}): Promise<T> {
    return this.request<T>(url, { method: 'GET', headers });
  },

  async request<T>(url: string, { method, headers = {} }: RequestOptions): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}/${url.replace(/^\//, '')}`;

    const requestHeaders = this.createHeaders(headers);

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      referrerPolicy: 'no-referrer',
    };

    if (!localHostChecker) {
      config.credentials = 'include';
    }

    try {
      const response = await fetch(fullUrl, config);

      if (response.ok) {
        return response.json() as Promise<T>;
      }

      if (response.status === 401) {
        return this.handleAuthError<T>(url, headers);
      }

      const err = await response.json();
      throw new HttpError(response.status, err);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, { error: 'Network error' });
    }
  },

  createHeaders(headers: HeadersInit = {}): Headers {
    const authToken = localHostChecker ? useAuthStore.getState().accessToken : null;

    const baseHeaders = {
      'Content-Type': 'application/json',
      'x-blocks-key': 'EF83CA37DE4F438AAD4DE4B1AB2B91F0',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    };

    const headerEntries =
      headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;

    return new Headers({
      ...baseHeaders,
      ...headerEntries,
    });
  },

  async handleAuthError<T>(url: string, headers?: HeadersInit): Promise<T> {
    const authStore = useAuthStore.getState();

    if (!authStore.refreshToken) {
      throw new HttpError(401, { error: 'invalid_request' });
    }

    const refreshTokenRes = await getRefreshToken();

    if (refreshTokenRes.error === 'invalid_request') {
      throw new HttpError(401, refreshTokenRes);
    }

    authStore.setAccessToken(refreshTokenRes.access_token);

    return this.request<T>(url, { method: 'GET', headers });
  },
};
