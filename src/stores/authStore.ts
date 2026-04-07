import { atom } from 'nanostores';
import type { User } from '../types';

export const $user = atom<User | null>(null);
export const $authLoading = atom<boolean>(true);

export async function fetchCurrentUser(): Promise<void> {
  $authLoading.set(true);
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      $user.set(data.user ?? null);
    } else {
      $user.set(null);
    }
  } catch {
    $user.set(null);
  } finally {
    $authLoading.set(false);
  }
}

export function login(): void {
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/auth/login?redirect=${redirect}`;
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    // ignore
  }
  $user.set(null);
}
