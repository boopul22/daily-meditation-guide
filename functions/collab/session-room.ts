import { DurableObject } from 'cloudflare:workers';
import * as Y from 'yjs';

interface UserPresence {
    email: string;
    name: string;
    color: string;
}

// Predefined cursor colors for collaborators
const CURSOR_COLORS = [
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f97316', // orange
    '#f43f5e', // rose
    '#3b82f6', // blue
    '#10b981', // emerald
    '#a855f7', // purple
    '#ec4899', // pink
];

/**
 * SessionRoom Durable Object
 * 
 * Manages real-time collaboration for a single session editor.
 * Each session gets its own Durable Object instance that:
 * - Accepts WebSocket connections from authenticated admins
 * - Maintains a Yjs document and broadcasts updates
 * - Tracks presence (who's online)
 * - Uses WebSocket Hibernation API for cost efficiency
 */
export class SessionRoom extends DurableObject {
    private doc: Y.Doc;
    private connections: Map<WebSocket, UserPresence> = new Map();
    private colorIndex = 0;

    constructor(ctx: DurableObjectState, env: any) {
        super(ctx, env);
        this.doc = new Y.Doc();

        // Restore Yjs state from storage if available
        this.ctx.blockConcurrencyWhile(async () => {
            const stored = await this.ctx.storage.get<Uint8Array>('yjs-state');
            if (stored) {
                Y.applyUpdate(this.doc, new Uint8Array(stored));
            }
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // Extract user info from query params (set by the auth route)
        const email = url.searchParams.get('email') || 'unknown';
        const name = url.searchParams.get('name') || email.split('@')[0];

        // WebSocket upgrade
        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response('Expected WebSocket', { status: 426 });
        }

        const pair = new WebSocketPair();
        const [client, server] = [pair[0], pair[1]];

        const color = CURSOR_COLORS[this.colorIndex % CURSOR_COLORS.length];
        this.colorIndex++;

        const presence: UserPresence = { email, name, color };

        // Accept with hibernation
        this.ctx.acceptWebSocket(server, [email]);
        this.connections.set(server, presence);

        // Send initial Yjs state
        const stateVector = Y.encodeStateAsUpdate(this.doc);
        server.send(JSON.stringify({
            type: 'sync-init',
            data: Array.from(stateVector),
        }));

        // Send current presence list
        server.send(JSON.stringify({
            type: 'presence-init',
            users: Array.from(this.connections.values()),
        }));

        // Broadcast new user to others
        this.broadcast(JSON.stringify({
            type: 'presence-join',
            user: presence,
        }), server);

        return new Response(null, { status: 101, webSocket: client });
    }

    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
        try {
            if (typeof message === 'string') {
                const data = JSON.parse(message);

                switch (data.type) {
                    case 'yjs-update': {
                        const update = new Uint8Array(data.data);
                        Y.applyUpdate(this.doc, update);

                        // Broadcast to all other clients
                        this.broadcast(message, ws);

                        // Persist periodically (debounced via storage alarm)
                        await this.schedulePersist();
                        break;
                    }

                    case 'cursor-update': {
                        // Relay cursor position to all other clients
                        const presence = this.connections.get(ws);
                        if (presence) {
                            this.broadcast(JSON.stringify({
                                type: 'cursor-update',
                                user: presence,
                                cursor: data.cursor,
                            }), ws);
                        }
                        break;
                    }

                    case 'awareness-update': {
                        // Relay awareness updates (cursor, selection) to all other clients
                        this.broadcast(message, ws);
                        break;
                    }
                }
            }
        } catch (err) {
            console.error('WebSocket message error:', err);
        }
    }

    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
        const presence = this.connections.get(ws);
        this.connections.delete(ws);

        if (presence) {
            // Broadcast user leaving
            this.broadcast(JSON.stringify({
                type: 'presence-leave',
                user: presence,
            }));
        }

        // If no more connections, persist and clean up
        if (this.connections.size === 0) {
            await this.persistDoc();
        }
    }

    async webSocketError(ws: WebSocket, error: unknown) {
        const presence = this.connections.get(ws);
        this.connections.delete(ws);

        if (presence) {
            this.broadcast(JSON.stringify({
                type: 'presence-leave',
                user: presence,
            }));
        }
    }

    private broadcast(message: string, exclude?: WebSocket) {
        for (const [ws] of this.connections) {
            if (ws !== exclude) {
                try {
                    ws.send(message);
                } catch {
                    // Connection might be dead, will be cleaned up on close
                }
            }
        }
    }

    private async schedulePersist() {
        // Use alarm to debounce persistence (save at most once every 5 seconds)
        const existing = await this.ctx.storage.getAlarm();
        if (!existing) {
            await this.ctx.storage.setAlarm(Date.now() + 5000);
        }
    }

    async alarm() {
        await this.persistDoc();
    }

    private async persistDoc() {
        const state = Y.encodeStateAsUpdate(this.doc);
        await this.ctx.storage.put('yjs-state', Array.from(state));
    }
}
