export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }

  return res.json();
}
