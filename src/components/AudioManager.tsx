import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  $currentTrack,
  $isPlaying,
  $currentTime,
  setCurrentTime,
  setDuration,
  $isPlaying as isPlayingStore,
} from '../stores/playerStore';

/**
 * AudioManager is a hidden React component that manages the actual <audio> element.
 * It listens to nanostores changes and plays/pauses/seeks accordingly.
 * This replaces the audio logic that was in the original App.tsx.
 */
const AudioManager: React.FC = () => {
  const currentTrack = useStore($currentTrack);
  const isPlaying = useStore($isPlaying);
  const currentTime = useStore($currentTime);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTrackIdRef = useRef<string | null>(null);
  const seekingRef = useRef(false);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();

    audio.addEventListener('timeupdate', () => {
      if (!seekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      isPlayingStore.set(false);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.pause();
      audio.src = '';
      lastTrackIdRef.current = null;
      return;
    }

    if (currentTrack.id !== lastTrackIdRef.current) {
      // New track loaded
      lastTrackIdRef.current = currentTrack.id;
      if (currentTrack.audioUrl) {
        audio.src = currentTrack.audioUrl;
        audio.load();
      } else {
        audio.pause();
        audio.src = '';
      }
    }
  }, [currentTrack]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay may be blocked
        isPlayingStore.set(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle seeking — detect external seek requests
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    // Only seek if the difference is significant (> 1 second) to avoid loops
    const diff = Math.abs(audio.currentTime - currentTime);
    if (diff > 1) {
      seekingRef.current = true;
      audio.currentTime = currentTime;
      // Reset seeking flag after a short delay
      setTimeout(() => {
        seekingRef.current = false;
      }, 100);
    }
  }, [currentTime]);

  // This component renders nothing visible
  return null;
};

export default AudioManager;
