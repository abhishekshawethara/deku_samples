import { error, redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { getToken } from '$lib/api';

export const ssr = false;

export async function load({ fetch }) {
  if (!browser) return { documents: [] };
  const token = getToken();
  if (!token) throw redirect(307, '/signin?next=/investors/room');

  const res = await fetch('/api/documents', { headers: { authorization: `Bearer ${token}` } });
  if (res.status === 401) throw redirect(307, '/signin?next=/investors/room');
  if (!res.ok) throw error(404, 'We cannot find that page');
  return { documents: await res.json() };
}
