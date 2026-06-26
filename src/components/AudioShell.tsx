import { useEffect, useState, type ComponentType } from 'react';

type Loaded = {
  AudioManager: ComponentType;
  PlayerBar: ComponentType;
};

const AudioShell: React.FC = () => {
  const [parts, setParts] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loaded = false;

    const load = async () => {
      if (loaded) return;
      loaded = true;
      const [a, p] = await Promise.all([
        import('./AudioManager'),
        import('./PlayerBar'),
      ]);
      if (cancelled) return;
      setParts({ AudioManager: a.default, PlayerBar: p.default });
    };

    const events = ['scroll', 'pointerdown', 'keydown', 'touchstart'];
    const onInteract = () => {
      events.forEach((e) => window.removeEventListener(e, onInteract));
      load();
    };
    events.forEach((e) =>
      window.addEventListener(e, onInteract, { passive: true, once: true })
    );

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const onLoad = () => {
      if (win.requestIdleCallback) {
        idleId = win.requestIdleCallback(load, { timeout: 4000 });
      } else {
        timeoutId = window.setTimeout(load, 1500);
      }
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, onInteract));
      window.removeEventListener('load', onLoad);
      if (idleId !== undefined && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!parts) return null;
  const { AudioManager, PlayerBar } = parts;
  return (
    <>
      <AudioManager />
      <PlayerBar />
    </>
  );
};

export default AudioShell;
