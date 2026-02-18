import React from 'react';
import { YouTubeVideo } from '../data/youtubeVideos';

interface VideoCardProps {
    video: YouTubeVideo;
    onClick: (video: YouTubeVideo) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
    const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

    return (
        <div
            onClick={() => onClick(video)}
            className="cursor-pointer group relative bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-zinc-800/40"
        >
            <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 bg-zinc-800">
                <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-110 transition-transform">
                        <iconify-icon icon="solar:play-linear" width="24" class="ml-1"></iconify-icon>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-zinc-200 font-medium tracking-tight h-12 line-clamp-2 group-hover:text-white transition-colors">
                    {video.title}
                </h3>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-2">
                    <iconify-icon icon="logos:youtube-icon" width="20"></iconify-icon>
                    <span className="text-xs text-zinc-400">Watch Session</span>
                </div>
                <iconify-icon icon="solar:arrow-right-linear" class="text-zinc-600 group-hover:text-zinc-300 transition-colors"></iconify-icon>
            </div>
        </div>
    );
};

export default VideoCard;
