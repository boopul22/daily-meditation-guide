import { atom } from 'nanostores';
import type { Session } from '../types';

export const $currentTrack = atom<Session | null>(null);
export const $isPlaying = atom<boolean>(false);
export const $currentTime = atom<number>(0);
export const $duration = atom<number>(0);

export function playSession(session: Session): void {
  const current = $currentTrack.get();

  if (current?.id === session.id) {
    // Toggle play/pause for same track
    $isPlaying.set(!$isPlaying.get());
  } else {
    // New track
    $currentTrack.set(session);
    $currentTime.set(0);
    $duration.set(0);
    if (session.audioUrl) {
      $isPlaying.set(true);
    } else {
      $isPlaying.set(false);
    }
  }
}

export function togglePlay(): void {
  $isPlaying.set(!$isPlaying.get());
}

export function seekTo(time: number): void {
  $currentTime.set(time);
}

export function setDuration(d: number): void {
  $duration.set(d);
}

export function setCurrentTime(t: number): void {
  $currentTime.set(t);
}
