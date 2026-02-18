import { Env } from '../types';
import { requireAuth } from '../lib/auth';

// POST /api/upload — upload image to R2
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const authError = requireAuth(context.request, context.env);
  if (authError) return authError;

  try {
    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum 10MB.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const MIME_TO_EXT: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };
    const ext = MIME_TO_EXT[file.type] || file.name.split('.').pop() || 'png';
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    await context.env.R2.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    // Relative path works in both local dev and production
    const publicUrl = `/api/image/${key}`;

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
