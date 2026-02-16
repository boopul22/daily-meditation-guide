import React, { useState } from 'react';
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

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handlePlaySession = (session: Session) => {
    if (currentTrack?.id === session.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(session);
      setIsPlaying(true);
    }
    navigate(`/session/${session.slug}`);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

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
        />
      )}
    </>
  );
};

export default App;
