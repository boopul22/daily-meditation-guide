import React, { useState } from 'react';

type Props = {
  toolSlug: string;
  headline?: string;
};

const ToolEmailCapture: React.FC<Props> = ({
  toolSlug,
  headline = 'Email me a free 7-day practice plan',
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/tool-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), toolSlug }),
      });
      if (!res.ok) throw new Error('fail');
      setStatus('ok');
      setMessage('You’re on the list. Check your inbox soon.');
      setEmail('');
    } catch {
      setStatus('err');
      setMessage('Something went wrong. Try again or use the contact page.');
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4 sm:p-5 space-y-3">
      <p className="text-sm text-zinc-200 font-medium">{headline}</p>
      <p className="text-xs text-zinc-500">Optional — tools stay free without an email.</p>
      {status === 'ok' ? (
        <p className="text-sm text-teal-400/90">{message}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 rounded-xl bg-zinc-950 border border-white/10 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 text-sm font-medium disabled:opacity-50"
          >
            {status === 'loading' ? 'Saving…' : 'Send plan'}
          </button>
        </form>
      )}
      {status === 'err' && <p className="text-xs text-red-400">{message}</p>}
    </div>
  );
};

export default ToolEmailCapture;
