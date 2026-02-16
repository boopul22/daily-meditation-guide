import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import PlayerBar from './components/PlayerBar';
import HomeView from './views/HomeView';
import DetailView from './views/DetailView';
import AdminLogin from './views/admin/AdminLogin';
import AdminDashboard from './views/admin/AdminDashboard';
import AdminSessionForm from './views/admin/AdminSessionForm';
import { Session } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Player state
  const [currentTrack, setCurrentTrack] = useState<Session | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => setIsPlaying(false));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handlePlaySession = useCallback((session: Session) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.id === session.id) {
      // Toggle play/pause for same track
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      // New track
      setCurrentTrack(session);
      setCurrentTime(0);
      if (session.audioUrl) {
        audio.src = session.audioUrl;
        audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        audio.src = '';
        setIsPlaying(false);
      }
    }
    navigate(`/session/${session.slug}`);
  }, [currentTrack, isPlaying, navigate]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio.src) {
        audio.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow pt-24 pb-32 px-6 relative max-w-6xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route
            path="/session/:slug"
            element={
              <DetailView
                onPlay={handlePlaySession}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
              />
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/new" element={<AdminSessionForm />} />
          <Route path="/admin/edit/:slug" element={<AdminSessionForm />} />
        </Routes>
      </main>

      {!isAdminRoute && (
        <PlayerBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
      )}
    </>
  );
};

export default App;
