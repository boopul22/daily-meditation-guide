import { useState } from 'react';
import { useStore } from '@nanostores/react';
import type { Session } from '../types';
import type { TOCItem } from '../utils/tocUtils';
import { playSession, $currentTrack, $isPlaying } from '../stores/playerStore';
import TableOfContents from './TableOfContents';

interface DetailInteractiveProps {
  session: Session;
  processedContent: string;
  headings: TOCItem[];
  relatedSessions: Session[];
}

function FAQAccordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/30 overflow-hidden transition-colors hover:border-white/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-zinc-200">{question}</span>
        <iconify-icon
          icon="solar:alt-arrow-down-linear"
          width="16"
          class={`flex-none text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        ></iconify-icon>
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function DetailInteractive({ session, processedContent, headings, relatedSessions }: DetailInteractiveProps) {
  const currentTrack = useStore($currentTrack);
  const isPlaying = useStore($isPlaying);

  const bgGradients: Record<string, string> = {
    indigo: 'from-indigo-900/50',
    teal: 'from-teal-900/50',
    orange: 'from-orange-900/50',
    rose: 'from-rose-900/50',
    blue: 'from-blue-900/50',
    emerald: 'from-emerald-900/50',
  };

  const gradientClass = bgGradients[session.color] || 'from-zinc-900/50';
  const isCurrent = currentTrack?.id === session.id;

  return (
    <article className="grid grid-cols-1 lg:grid-cols-12 gap-12">

      {/* Left: Content */}
      <div className="lg:col-span-8 space-y-8">
        <header className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-medium uppercase tracking-widest">
              {session.category}
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <iconify-icon icon="solar:clock-circle-linear" width="14"></iconify-icon>
              <span>{session.duration}</span>
            </div>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-medium text-zinc-100 tracking-tight leading-tight">
            {session.title}
          </h1>

          <div className="flex items-center gap-4 border-b border-white/5 pb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/10"></div>
            <div>
              <p className="text-sm text-zinc-200 font-medium">{session.author}</p>
              <p className="text-xs text-zinc-500">{session.role}</p>
              {(session.publishedAt || session.createdAt) && (
                <p className="text-xs text-zinc-600 mt-0.5">
                  {new Date(String(session.publishedAt || session.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {session.updatedAt && session.updatedAt !== session.publishedAt && (
                    <span> · Updated {new Date(String(session.updatedAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  )}
                </p>
              )}
            </div>
            <div className="flex-grow"></div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <iconify-icon icon="solar:bookmark-linear" width="16"></iconify-icon>
              </button>
              <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <iconify-icon icon="solar:share-linear" width="16"></iconify-icon>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Player Card */}
        {session.audioUrl && (
          <div className="lg:hidden">
            <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl shadow-black/50">
              <div className={`h-52 bg-gradient-to-br ${gradientClass} to-zinc-900 relative transition-colors duration-500`}>
                {session.featuredImage ? (
                  <img src={session.featuredImage} alt={session.title} loading="lazy" decoding="async" width={400} height={208} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-40"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => playSession(session)}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  >
                    <iconify-icon icon={isCurrent && isPlaying ? "solar:pause-linear" : "solar:play-linear"} width="28" stroke-width="2" class="ml-1"></iconify-icon>
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  <span>{isCurrent && isPlaying ? "Now Playing" : "Up Next"}</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                    {isCurrent ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className={`flex items-center gap-1 h-8 items-end justify-center ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-30'}`}>
                  {[3, 5, 8, 4, 6, 3, 7, 4, 2, 5, 3, 5, 8, 4, 6].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-zinc-500 rounded-full ${isCurrent && isPlaying ? 'animate-pulse' : ''}`}
                      style={{ height: `${h * 4}px`, animationDelay: `${i * 0.05}s` }}
                    ></div>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-200 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <iconify-icon icon="solar:download-linear" width="18"></iconify-icon>
                  Download for Offline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile TOC */}
        <div className="block lg:hidden mt-8">
          <TableOfContents headings={headings} />
        </div>

        {/* Blog Body */}
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: processedContent || session.fullContent }}
        />

        {/* FAQ Section */}
        {session.faqItems && session.faqItems.length > 0 && (
          <section className="pt-8 border-t border-white/5">
            <h2 className="font-display text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
              <iconify-icon icon="solar:chat-round-dots-linear" width="22" class="text-indigo-400"></iconify-icon>
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {session.faqItems.map((faq, i) => (
                <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>
        )}

        {/* Mobile Related Sessions */}
        {relatedSessions.length > 0 && (
          <div className="lg:hidden pt-8 border-t border-white/5">
            <h4 className="text-zinc-200 font-medium text-sm mb-4">Related Sessions</h4>
            <div className="space-y-3">
              {relatedSessions.map(r => (
                <a key={r.id} href={`/session/${r.slug}`} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <iconify-icon icon="solar:play-linear" class="text-zinc-500 group-hover:text-zinc-300"></iconify-icon>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 group-hover:text-white transition-colors">{r.title}</p>
                    <p className="text-[10px] text-zinc-500">{r.duration} &middot; {r.category}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Sticky Player/Card & TOC - Desktop */}
      <div className="hidden lg:block lg:col-span-4 lg:col-start-9">

        {/* Static Player Card */}
        {session.audioUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl shadow-black/50">
            <div className={`h-48 bg-gradient-to-br ${gradientClass} to-zinc-900 relative transition-colors duration-500`}>
              {session.featuredImage ? (
                <img src={session.featuredImage} alt={session.title} loading="lazy" decoding="async" width={400} height={192} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-40"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => playSession(session)}
                  className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  <iconify-icon icon={isCurrent && isPlaying ? "solar:pause-linear" : "solar:play-linear"} width="24" stroke-width="2" class="ml-1"></iconify-icon>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-xs font-medium text-zinc-500 uppercase tracking-widest">
                <span>{isCurrent && isPlaying ? "Now Playing" : "Up Next"}</span>
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                  {isCurrent ? 'Online' : 'Offline'}
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-zinc-100 tracking-tight leading-snug">{session.title}</h3>
                <p className="text-zinc-500 text-xs mt-1">Guided Audio Session</p>
              </div>

              <div className={`flex items-center gap-1 h-6 items-end justify-center my-1 ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-30'}`}>
                {[3, 5, 8, 4, 6, 3, 7, 4, 2, 5, 3, 5, 8, 4, 6].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-zinc-500 rounded-full ${isCurrent && isPlaying ? 'animate-pulse' : ''}`}
                    style={{ height: `${h * 3}px`, animationDelay: `${i * 0.05}s` }}
                  ></div>
                ))}
              </div>

              <button className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                <iconify-icon icon="solar:download-linear" width="16"></iconify-icon>
                Download for Offline
              </button>
            </div>
          </div>
        )}

        {/* Sticky Sidebar Container for TOC & Related */}
        <div className="sticky top-24 space-y-8">

          {/* Table of Contents */}
          <TableOfContents headings={headings} />

          {/* Related Sessions */}
          {relatedSessions.length > 0 && (
            <div className="rounded-xl p-5 border border-white/5 bg-zinc-900/30">
              <h4 className="text-zinc-200 font-medium text-xs uppercase tracking-widest mb-4">Related</h4>
              <div className="space-y-4">
                {relatedSessions.map(r => (
                  <a key={r.id} href={`/session/${r.slug}`} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <iconify-icon icon="solar:play-linear" class="text-zinc-500 group-hover:text-zinc-300"></iconify-icon>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-300 group-hover:text-white transition-colors leading-tight mb-0.5">{r.title}</p>
                      <p className="text-[10px] text-zinc-500">{r.duration}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
