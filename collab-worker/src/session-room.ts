import { DurableObject } from 'cloudflare:workers';
import * as Y from 'yjs';

interface UserPresence {
    email: string;
    name: string;
    color: string;
}

const CURSOR_COLORS = [
    '#6366f1', '#14b8a6', '#f97316', '#f43f5e',
    '#3b82f6', '#10b981', '#a855f7', '#ec4899',
];

/**
 * SessionRoom Durable Object — manages real-time Yjs collaboration for a single session.
 */
export class SessionRoom extends DurableObject {
    private doc: Y.Doc;
    private connections: Map<WebSocket, UserPresence> = new Map();
    private colorIndex = 0;

    constructor(ctx: DurableObjectState, env: any) {
        super(ctx, env);
        this.doc = new Y.Doc();

        this.ctx.blockConcurrencyWhile(async () => {
            const stored = await this.ctx.storage.get<Uint8Array>('yjs-state');
            if (stored) {
                Y.applyUpdate(this.doc, new Uint8Array(stored));
            }
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const email = url.searchParams.get('email') || 'unknown';
        const name = url.searchParams.get('name') || email.split('@')[0];

        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response('Expected WebSocket', { status: 426 });
        }

        const pair = new WebSocketPair();
        const [client, server] = [pair[0], pair[1]];

        const color = CURSOR_COLORS[this.colorIndex % CURSOR_COLORS.length];
        this.colorIndex++;
        const presence: UserPresence = { email, name, color };

        this.ctx.acceptWebSocket(server, [email]);
        this.connections.set(server, presence);

        server.send(JSON.stringify({
            type: 'sync-init',
            data: Array.from(Y.encodeStateAsUpdate(this.doc)),
        }));

        server.send(JSON.stringify({
            type: 'presence-init',
            users: Array.from(this.connections.values()),
        }));

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
                        this.broadcast(message, ws);
                        await this.schedulePersist();
                        break;
                    }
                    case 'cursor-update': {
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
                        this.broadcast(message, ws);
                        break;
                    }
                }
            }
        } catch (err) {
            console.error('WebSocket message error:', err);
        }
    }

    async webSocketClose(ws: WebSocket) {
        const presence = this.connections.get(ws);
        this.connections.delete(ws);
        if (presence) {
            this.broadcast(JSON.stringify({ type: 'presence-leave', user: presence }));
        }
        if (this.connections.size === 0) {
            await this.persistDoc();
        }
    }

    async webSocketError(ws: WebSocket) {
        const presence = this.connections.get(ws);
        this.connections.delete(ws);
        if (presence) {
            this.broadcast(JSON.stringify({ type: 'presence-leave', user: presence }));
        }
    }

    private broadcast(message: string, exclude?: WebSocket) {
        for (const [ws] of this.connections) {
            if (ws !== exclude) {
                try { ws.send(message); } catch { /* dead connection */ }
            }
        }
    }

    private async schedulePersist() {
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
