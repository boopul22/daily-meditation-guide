export { SessionRoom } from './session-room';

export default {
    async fetch(request: Request, env: any): Promise<Response> {
        // This Worker's main purpose is hosting the Durable Object.
        // Direct HTTP requests are forwarded from the Pages project via the DO binding.
        return new Response('Collab Worker active', { status: 200 });
    },
};
