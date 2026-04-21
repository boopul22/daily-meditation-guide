interface Env {
  SYNC_URL: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runSync(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/run') {
      const result = await runSync(env);
      return Response.json(result);
    }
    return new Response('dmg-youtube-cron', { status: 200 });
  },
};

async function runSync(env: Env): Promise<{ ok: boolean; status?: number; body?: string; error?: string }> {
  try {
    const target = new URL(env.SYNC_URL);
    const res = await fetch(target.toString(), {
      method: 'POST',
      headers: {
        'x-cron-secret': env.CRON_SECRET,
        'Origin': target.origin,
      },
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body: body.slice(0, 500) };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}
