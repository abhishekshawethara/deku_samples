import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const TOKEN_KEY = 'zj_token';
export const ACCOUNT_KEY = 'zj_account';
export const SAVE_TOKEN_KEY = 'zj_save_token';

export function getToken() {
  if (!browser) return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAccount() {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSaveToken() {
  if (!browser) return null;
  try {
    return localStorage.getItem(SAVE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSaveToken(token) {
  if (!browser || !token) return;
  try {
    localStorage.setItem(SAVE_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearSaveToken() {
  if (!browser) return;
  try {
    localStorage.removeItem(SAVE_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function setSession(token, account) {
  if (!browser) return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    window.dispatchEvent(new CustomEvent('zj:auth'));
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  if (!browser) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    window.dispatchEvent(new CustomEvent('zj:auth'));
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(status, message, code, body) {
    super(message);
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

/**
 * Call the JSON API on the same origin.
 * On an expired token the session is cleared and the visitor is sent to /signin.
 */
export async function api(path, options = {}) {
  const { method = 'GET', body, auth = true, headers = {}, redirectOnExpiry = true } = options;
  const h = { ...headers };
  if (body !== undefined) h['content-type'] = 'application/json';
  const token = auth ? getToken() : null;
  if (token) h.authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const code = payload?.code;
    const message =
      payload?.message || payload?.error || `The request failed (${res.status}). Try again.`;
    if (res.status === 401 && code === 'token_expired' && browser && redirectOnExpiry) {
      clearSession();
      const next = window.location.pathname + window.location.search;
      goto(`/signin?next=${encodeURIComponent(next)}`);
    }
    throw new ApiError(res.status, message, code, payload);
  }

  return { data: payload, headers: res.headers, status: res.status };
}

export async function apiData(path, options) {
  const { data } = await api(path, options);
  return data;
}
