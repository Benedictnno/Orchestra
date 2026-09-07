import { tokenStorage } from '@/utils/tokenStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orchestra-y8vf.onrender.com';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = tokenStorage.getToken();
  
  // Prepend baseURL if it's an internal path
  const finalUrl = url.startsWith('/') ? `${BASE_URL}${url}` : url;

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;

  const res = await fetch(finalUrl, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    tokenStorage.clearToken();
  }

  return res;
}
