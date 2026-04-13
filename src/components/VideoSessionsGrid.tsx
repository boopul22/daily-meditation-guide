import { useState } from 'react';

export interface VideoSession {
  id: string;
  title: string;
  description: string;
}

interface Props {
  videos: VideoSession[];
}

function excerpt(text: string, max = 220): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut) + '…';
}

export default function VideoSessionsGrid({ videos }: Props) {
  const [selected, setSelected] = useState<VideoSession | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => {
          const thumb = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
          return (
            <article
              key={video.id}
              className="group bg-zinc-900/40 border border-white/[0.06] hover:border-white/[0.12] rounded-2xl overflow-hidden transition-all duration-300 hover:bg-zinc-800/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
            >
              <button
                type="button"
                onClick={() => setSelected(video)}
                className="block w-full text-left"
                aria-label={`Play: ${video.title}`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                  <img
                    src={thumb}
                    alt={video.title}
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={270}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                      <iconify-icon icon="solar:play-linear" width="28" class="ml-1"></iconify-icon>
                    </div>
                  </div>
                </div>
              </button>

              <div className="p-5 space-y-3">
                <h2 className="font-display text-zinc-100 font-medium tracking-tight text-lg line-clamp-2 group-hover:text-white transition-colors">
                  {video.title}
                </h2>
                {video.description && (
                  <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4 whitespace-pre-line">
                    {excerpt(video.description)}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <iconify-icon icon="logos:youtube-icon" width="18"></iconify-icon>
                    <span className="text-xs text-zinc-500">Watch Session</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(video)}
                    className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors inline-flex items-center gap-1"
                  >
                    Play
                    <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div
            className="absolute inset-0"
            onClick={() => setSelected(null)}
            aria-label="Close modal"
          ></div>

          <div className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-[scale-in_0.3s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900">
              <h3 className="text-zinc-200 font-medium truncate pr-8">{selected.title}</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <iconify-icon icon="solar:close-linear" width="24"></iconify-icon>
              </button>
            </div>

            <div className="relative pt-[56.25%] bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selected.id}?autoplay=1&rel=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full"
                title={selected.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
