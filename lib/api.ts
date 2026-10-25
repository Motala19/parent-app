import * as SecureStore from 'expo-secure-store';

// EXPO_PUBLIC_ variables from .env are baked in when the app starts
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

const KEY = 'auth-token';
let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export async function loadToken() {
  token = await SecureStore.getItemAsync(KEY); // encrypted storage on the phone
  return token;
}

export async function saveToken(value: string | null) {
  token = value;
  if (value) await SecureStore.setItemAsync(KEY, value);
  else await SecureStore.deleteItemAsync(KEY);
}

export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

type Options = { method?: string; body?: unknown };

export async function api<T = any>(path: string, { method = 'GET', body }: Options = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json', // makes Laravel answer with JSON errors
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the school server. Check your internet connection and try again.');
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (res.status === 401 && path !== '/login') {
    onUnauthorized?.();
    throw new ApiError('Your session has ended. Please log in again.', 401);
  }

  if (!res.ok) {
    const first = data?.errors ? (Object.values(data.errors)[0] as string[])?.[0] : '';
    throw new ApiError(first || data?.message || 'Something went wrong. Please try again.', res.status);
  }

  return data as T;
}