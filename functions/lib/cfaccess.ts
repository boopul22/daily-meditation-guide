import { Env } from '../types';

export interface CFAccessJWTPayload {
  email: string;
  name?: string;
  sub: string;
  iss: string;
  aud: string[];
  exp: number;
  iat: number;
  type?: string;
  identity_nonce?: string;
  custom?: Record<string, unknown>;
}

function getCFAuthCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').find((c) => c.trim().startsWith('CF_Authorization='));
  return match ? match.trim().slice('CF_Authorization='.length) : null;
}

function base64UrlDecode(str: string): Uint8Array {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '='
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getPublicKeys(teamName: string): Promise<CryptoKey[]> {
  const certsUrl = `https://${teamName}.cloudflareaccess.com/cdn-cgi/access/certs`;
  const response = await fetch(certsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Cloudflare Access certs: ${response.status}`);
  }
  const { keys } = (await response.json()) as { keys: JsonWebKey[] };
  return Promise.all(
    keys
      .filter((key) => key.kty === 'RSA')
      .map((key) =>
        crypto.subtle.importKey(
          'jwk',
          key,
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
          false,
          ['verify']
        )
      )
  );
}

export async function verifyCFAccessJWT(
  request: Request,
  env: Env
): Promise<CFAccessJWTPayload | null> {
  const token = getCFAuthCookie(request);
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  let payload: CFAccessJWTPayload;
  try {
    const payloadJson = new TextDecoder().decode(base64UrlDecode(parts[1]));
    payload = JSON.parse(payloadJson);
  } catch {
    return null;
  }

  // Check expiration
  if (payload.exp < Date.now() / 1000) return null;

  // Check audience
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(env.CF_ACCESS_AUD)) return null;

  // Verify signature
  let keys: CryptoKey[];
  try {
    keys = await getPublicKeys(env.CF_ACCESS_TEAM_NAME);
  } catch {
    return null;
  }

  const signatureInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = base64UrlDecode(parts[2]);

  for (const key of keys) {
    try {
      const valid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        key,
        signature,
        signatureInput
      );
      if (valid) return payload;
    } catch {
      continue;
    }
  }

  return null;
}
