import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BREATH_PATTERNS, getPattern, type BreathPatternId } from '../../lib/tools/breathPatterns';

type Props = {
  initialPattern?: string;
  compact?: boolean;
  showPatternSwitcher?: boolean;
  onComplete?: (minutes: number, patternId: string) => void;
};

function trackEvent(name: string, params?: Record<string, string | number>) {
  try {
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') gtag('event', name, params);
  } catch {
    /* ignore */
  }
}

function playBeep(ctx: AudioContext, freq = 440, duration = 0.08, gain = 0.04) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

const BreathPacer: React.FC<Props> = ({
  initialPattern = 'box',
  compact = false,
  showPatternSwitcher = true,
  onComplete,
}) => {
  const [patternId, setPatternId] = useState(initialPattern);
  const pattern = getPattern(patternId);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(compact ? 2 : 5);
  const [audioOn, setAudioOn] = useState(true);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [done, setDone] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPhaseRef = useRef(-1);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const elapsedBaseRef = useRef(0);

  const step = pattern.steps[stepIndex] ?? pattern.steps[0];
  const scale =
    step.phase === 'inhale' || step.phase === 'inhale2'
      ? 0.72 + 0.28 * stepProgress
      : step.phase === 'exhale'
        ? 1 - 0.28 * stepProgress
        : step.phase === 'hold' || step.phase === 'hold2'
          ? stepIndex > 0 && pattern.steps[stepIndex - 1]?.phase.startsWith('inhale')
            ? 1
            : 0.72
          : 0.85;

  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      void audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const reset = useCallback(() => {
    stop();
    setStepIndex(0);
    setStepProgress(0);
    setElapsed(0);
    elapsedBaseRef.current = 0;
    lastPhaseRef.current = -1;
    setDone(false);
  }, [stop]);

  useEffect(() => {
    if (!running) return;

    startRef.current = performance.now();
    const targetSec = targetMinutes * 60;

    const tick = (now: number) => {
      const localElapsed = elapsedBaseRef.current + (now - startRef.current) / 1000;
      setElapsed(localElapsed);

      if (localElapsed >= targetSec) {
        setRunning(false);
        setDone(true);
        trackEvent('tool_breath_complete', { pattern: patternId, minutes: targetMinutes });
        onComplete?.(targetMinutes, patternId);
        try {
          localStorage.setItem(
            'dmg:lastBreath',
            JSON.stringify({ patternId, at: Date.now(), minutes: targetMinutes })
          );
        } catch {
          /* ignore */
        }
        return;
      }

      let remaining = localElapsed;
      const steps = getPattern(patternId).steps;
      let idx = 0;
      while (remaining >= 0) {
        const dur = steps[idx % steps.length].seconds;
        if (remaining < dur) {
          const i = idx % steps.length;
          setStepIndex(i);
          setStepProgress(remaining / dur);
          if (i !== lastPhaseRef.current) {
            lastPhaseRef.current = i;
            if (audioOn) {
              const ctx = ensureAudio();
              const ph = steps[i].phase;
              playBeep(ctx, ph.startsWith('inhale') ? 520 : ph === 'exhale' ? 360 : 440, 0.07, 0.035);
            }
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(12);
              } catch {
                /* ignore */
              }
            }
          }
          break;
        }
        remaining -= dur;
        idx += 1;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      elapsedBaseRef.current = elapsed;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, patternId, targetMinutes, audioOn]);

  const start = () => {
    ensureAudio();
    setDone(false);
    if (!running) {
      trackEvent('tool_breath_start', { pattern: patternId, minutes: targetMinutes });
      setRunning(true);
    }
  };

  const pause = () => {
    elapsedBaseRef.current = elapsed;
    stop();
  };

  return (
    <div className={`relative ${eyesClosed ? 'bg-black rounded-2xl p-6' : ''}`}>
      {showPatternSwitcher && !compact && (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {Object.values(BREATH_PATTERNS).map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={running}
              onClick={() => {
                setPatternId(p.id as BreathPatternId);
                reset();
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                patternId === p.id
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                  : 'border-white/10 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p.shortName}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        <div
          className={`relative flex items-center justify-center ${compact ? 'w-48 h-48' : 'w-56 h-56 sm:w-64 sm:h-64'}`}
          aria-live="polite"
        >
          <div
            className="absolute inset-0 rounded-full bg-indigo-500/10 blur-2xl transition-transform duration-300"
            style={{ transform: `scale(${scale})` }}
          />
          <div
            className="relative w-full h-full rounded-full border border-indigo-400/30 bg-gradient-to-br from-indigo-500/20 to-teal-500/10 flex flex-col items-center justify-center transition-transform duration-100 ease-linear shadow-[0_0_40px_-10px_rgba(196,146,69,0.35)]"
            style={{ transform: `scale(${scale})` }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-1">{step.label}</p>
            <p className="font-display text-4xl text-zinc-100 tabular-nums">
              {Math.max(1, Math.ceil(step.seconds * (1 - stepProgress)))}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">
              {Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, '0')} / {targetMinutes}:00
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500 max-w-sm">{pattern.description}</p>

        {!compact && (
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
            <label className="flex items-center gap-2">
              <span>Minutes</span>
              <select
                value={targetMinutes}
                disabled={running}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-zinc-200"
              >
                {[1, 2, 3, 5, 10].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setAudioOn((v) => !v)}
              className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5"
            >
              Audio {audioOn ? 'on' : 'off'}
            </button>
            <button
              type="button"
              onClick={() => setEyesClosed((v) => !v)}
              className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5"
            >
              {eyesClosed ? 'Show UI' : 'Eyes-closed'}
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          {!running ? (
            <button
              type="button"
              onClick={start}
              className="px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-sm font-medium hover:bg-white transition-colors"
            >
              {elapsed > 0 && !done ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button
              type="button"
              onClick={pause}
              className="px-6 py-2.5 rounded-full border border-white/15 text-zinc-200 text-sm font-medium hover:bg-white/5"
            >
              Pause
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="px-6 py-2.5 rounded-full border border-white/10 text-zinc-400 text-sm hover:text-zinc-200"
          >
            Reset
          </button>
        </div>

        {done && (
          <div className="w-full max-w-md rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-center space-y-3">
            <p className="text-sm text-zinc-200 font-medium">Nice work — {targetMinutes} min complete.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <a
                href="/sessions"
                className="inline-flex px-4 py-2 rounded-full bg-zinc-100 text-zinc-950 text-xs font-semibold"
              >
                Continue with a guided session
              </a>
              <button
                type="button"
                onClick={async () => {
                  const url = window.location.href;
                  const text = `I completed ${targetMinutes} min of ${pattern.name} on Daily Meditation Guide`;
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: pattern.name, text, url });
                    } else {
                      await navigator.clipboard.writeText(`${text}\n${url}`);
                      alert('Link copied');
                    }
                  } catch {
                    /* ignore cancel */
                  }
                }}
                className="inline-flex px-4 py-2 rounded-full border border-white/15 text-xs text-zinc-300"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathPacer;
