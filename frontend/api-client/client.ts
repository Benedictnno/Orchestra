import { tokenStorage } from '@/utils/tokenStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orchestra-y8vf.onrender.com';

export async function apiClient<T>(
  path: string,
  method: string,
  body?: unknown,
  headers: Record<string, string> = {}
): Promise<T> {
  const token = tokenStorage.getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    tokenStorage.clearToken();
  }

  const data = await res.json();

  if (!res.ok) {
    throw data || { message: 'An unknown error occurred' };
  }

  return data;
}
