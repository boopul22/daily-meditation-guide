import React, { useState } from 'react';
import { YOUTUBE_VIDEOS, YouTubeVideo } from '../data/youtubeVideos';
import VideoCard from '../components/VideoCard';
import SEO from '../components/SEO';

const SessionsView: React.FC = () => {
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

    return (
        <div className="space-y-12 animate-[fade-enter_0.5s_ease-out]">
            <SEO
                title="Guided Sessions"
                description="Explore our library of guided meditation sessions and visual journeys. Immerse yourself in curated meditations designed to help you find peace and clarity."
                keywords="guided meditation, meditation sessions, mindfulness videos, visual journeys, meditation library"
                url="https://dailymeditationguide.com/sessions"
            />

            <header className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-medium text-zinc-100 tracking-tight">
                    Guided Sessions
                </h1>
                <p className="text-zinc-500 max-w-2xl text-lg">
                    Immerse yourself in our curated collection of guided meditations and visual journeys designed to help you find peace and clarity.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {YOUTUBE_VIDEOS.map((video) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        onClick={setSelectedVideo}
                    />
                ))}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
                    <div
                        className="absolute inset-0"
                        onClick={() => setSelectedVideo(null)}
                        aria-label="Close modal"
                    ></div>

                    <div className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-[scale-in_0.3s_ease-out]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900">
                            <h3 className="text-zinc-200 font-medium truncate pr-8">{selectedVideo.title}</h3>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="text-zinc-400 hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <iconify-icon icon="solar:close-linear" width="24"></iconify-icon>
                            </button>
                        </div>

                        <div className="relative pt-[56.25%] bg-black">
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                                className="absolute inset-0 w-full h-full"
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionsView;
