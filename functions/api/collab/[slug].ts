import { Env } from '../../types';
import { verifyCFAccessJWT } from '../../lib/cfaccess';

/**
 * WebSocket upgrade route for collaborative editing.
 * Authenticates the admin via CF Access JWT, then forwards
 * the connection to the session's Durable Object.
 */
export const onRequestGet: PagesFunction<Env> = async ({ params, request, env }) => {
    // Authenticate the admin
    const jwtPayload = await verifyCFAccessJWT(request, env);
    if (!jwtPayload) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Check that this is a WebSocket upgrade request
    if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const slug = params.slug as string;
    const email = jwtPayload.email;
    const name = jwtPayload.name || email.split('@')[0];

    // Get or create the Durable Object for this session
    const id = env.SESSION_ROOMS.idFromName(`session:${slug}`);
    const room = env.SESSION_ROOMS.get(id);

    // Forward the WebSocket request to the Durable Object with user info
    const url = new URL(request.url);
    url.searchParams.set('email', email);
    url.searchParams.set('name', name);

    return room.fetch(new Request(url.toString(), {
        headers: request.headers,
    }));
};
