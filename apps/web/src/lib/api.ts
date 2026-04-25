const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Fetch wrapper with auth token injection and response parsing
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string | null
): Promise<{ success: boolean; data: T | null; error?: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, data: null, error: json.error || 'Request failed' };
    }

    return json;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ─── Auth API ───────────────────────────────────────

export const authApi = {
  register: (data: { phone?: string; email?: string; name: string; hostelName: string; roomNumber: string }) =>
    apiFetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  verifyOtp: (data: { phone?: string; email?: string; otp: string }) =>
    apiFetch('/api/v1/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),

  refresh: () =>
    apiFetch('/api/v1/auth/refresh', { method: 'POST' }),
};

// ─── Listings API ───────────────────────────────────

export const listingsApi = {
  browse: (params: Record<string, string>, token: string) =>
    apiFetch(`/api/v1/listings?${new URLSearchParams(params)}`, {}, token),

  search: (params: Record<string, string>, token: string) =>
    apiFetch(`/api/v1/listings/search?${new URLSearchParams(params)}`, {}, token),

  getById: (id: string, token: string) =>
    apiFetch(`/api/v1/listings/${id}`, {}, token),

  create: (data: object, token: string) =>
    apiFetch('/api/v1/listings', { method: 'POST', body: JSON.stringify(data) }, token),

  update: (id: string, data: object, token: string) =>
    apiFetch(`/api/v1/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  delete: (id: string, token: string) =>
    apiFetch(`/api/v1/listings/${id}`, { method: 'DELETE' }, token),

  compare: (name: string, token: string) =>
    apiFetch(`/api/v1/listings/compare/${encodeURIComponent(name)}`, {}, token),
};

// ─── Requests API ───────────────────────────────────

export const requestsApi = {
  browse: (token: string) =>
    apiFetch('/api/v1/requests', {}, token),

  create: (data: object, token: string) =>
    apiFetch('/api/v1/requests', { method: 'POST', body: JSON.stringify(data) }, token),

  fulfill: (id: string, token: string) =>
    apiFetch(`/api/v1/requests/${id}/fulfill`, { method: 'PATCH' }, token),

  delete: (id: string, token: string) =>
    apiFetch(`/api/v1/requests/${id}`, { method: 'DELETE' }, token),
};

// ─── Conversations API ──────────────────────────────

export const conversationsApi = {
  list: (token: string) =>
    apiFetch('/api/v1/conversations', {}, token),

  getMessages: (id: string, token: string) =>
    apiFetch(`/api/v1/conversations/${id}`, {}, token),
};

// ─── Reports API ────────────────────────────────────

export const reportsApi = {
  create: (data: object, token: string) =>
    apiFetch('/api/v1/reports', { method: 'POST', body: JSON.stringify(data) }, token),
};
