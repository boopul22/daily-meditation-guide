import type { APIContext } from 'astro';

export const prerender = false;

export async function GET(context: APIContext) {
  const db = (context.locals as any).runtime.env.DB;
  const { results } = await db
    .prepare(
      'SELECT video_id, title FROM youtube_videos ORDER BY published_at DESC'
    )
    .all();

  return Response.json(
    results.map((r: any) => ({ id: r.video_id, title: r.title })),
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    }
  );
}
