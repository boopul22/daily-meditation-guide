import { useEffect, useState } from 'react';
import VideoCard from './VideoCard';

interface YouTubeVideo {
  id: string;
  title: string;
}

export default function SessionsContent() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/youtube-videos')
            .then((r) => {
                if (!r.ok) throw new Error(`Failed to load videos (${r.status})`);
                return r.json();
            })
            .then((data: YouTubeVideo[]) => {
                if (!cancelled) {
                    setVideos(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err?.message ?? 'Failed to load videos');
                    setLoading(false);
                }
            });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="space-y-12">
            {loading && (
                <div className="text-center py-16 text-zinc-500 text-sm">Loading sessions…</div>
            )}

            {error && (
                <div className="text-center py-16 text-rose-400 text-sm">{error}</div>
            )}

            {!loading && !error && videos.length === 0 && (
                <div className="text-center py-16 text-zinc-500 text-sm">No sessions yet.</div>
            )}

            {!loading && !error && videos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            onClick={setSelectedVideo}
                        />
                    ))}
                </div>
            )}

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
}
