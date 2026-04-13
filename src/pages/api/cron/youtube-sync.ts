import type { APIContext } from 'astro';
import { syncYouTubeVideos } from '../../../lib/youtubeSync';

export const prerender = false;

export async function POST(context: APIContext) {
  return handle(context);
}

export async function GET(context: APIContext) {
  return handle(context);
}

async function handle(context: APIContext) {
  const env = (context.locals as any).runtime.env as {
    DB: any;
    YOUTUBE_API_KEY?: string;
    CRON_SECRET?: string;
  };

  const provided = context.request.headers.get('x-cron-secret');
  if (!env.CRON_SECRET || provided !== env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!env.YOUTUBE_API_KEY) {
    return Response.json({ error: 'YOUTUBE_API_KEY not configured' }, { status: 500 });
  }

  const url = new URL(context.request.url);
  const fullBackfill = url.searchParams.get('backfill') === '1';

  try {
    const result = await syncYouTubeVideos(env.DB, env.YOUTUBE_API_KEY, { fullBackfill });
    return Response.json({ ok: true, ...result });
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
