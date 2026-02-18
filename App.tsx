import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import PlayerBar from './components/PlayerBar';
import Footer from './components/Footer';
import HomeView from './views/HomeView';
import DetailView from './views/DetailView';
import AdminLogin from './views/admin/AdminLogin';
import AdminDashboard from './views/admin/AdminDashboard';
import AdminSessionForm from './views/admin/AdminSessionForm';
import { Session } from './types';
import AboutView from './views/AboutView';
import ContactView from './views/ContactView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import TermsView from './views/TermsView';
import DisclaimerView from './views/DisclaimerView';
import SessionsView from './views/SessionsView';
import CookieConsent from './components/CookieConsent';
import NotFound from './views/NotFound';

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

      <div className="flex flex-col flex-1">
        <main className="flex-1 pt-24 px-6 relative max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/sessions" element={<SessionsView />} />
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
            <Route path="/about" element={<AboutView />} />
            <Route path="/contact" element={<ContactView />} />
            <Route path="/privacy" element={<PrivacyPolicyView />} />
            <Route path="/terms" element={<TermsView />} />
            <Route path="/disclaimer" element={<DisclaimerView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>

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

      {!isAdminRoute && <CookieConsent />}
    </>
  );
};

export default App;
