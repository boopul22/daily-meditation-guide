import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $authLoading, fetchCurrentUser } from '../../stores/authStore';
import {
  fetchInfographicBySlug,
  createInfographic,
  updateInfographic,
  uploadImage,
  ConflictError,
} from '../../lib/api';
import type { Infographic } from '../../types';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface FormState {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  altText: string;
  tagsInput: string;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: FormState = {
  title: '',
  slug: '',
  description: '',
  imageUrl: '',
  imageWidth: 0,
  imageHeight: 0,
  altText: '',
  tagsInput: '',
  seoTitle: '',
  seoDescription: '',
};

interface Props {
  slug?: string;
}

const AdminInfographicForm: React.FC<Props> = ({ slug }) => {
  const user = useStore($user);
  const authLoading = useStore($authLoading);
  const isEdit = !!slug;

  useEffect(() => {
    if (!user && authLoading) fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const redirect = encodeURIComponent('/admin/infographics');
      window.location.href = `/auth/login?redirect=${redirect}`;
      return;
    }
    if (!user.isAdmin) window.location.href = '/admin';
  }, [user, authLoading]);

  const isAuth = !!user?.isAdmin;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      const data = await fetchInfographicBySlug(slug);
      setForm({
        title: data.title,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        imageWidth: data.imageWidth,
        imageHeight: data.imageHeight,
        altText: data.altText,
        tagsInput: (data.tags || []).join(', '),
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      });
      setVersion(data.version);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!isAuth) return;
    if (isEdit) load();
  }, [isAuth, isEdit, load]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      // Capture natural dimensions before upload (WebP conversion preserves size)
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
          URL.revokeObjectURL(url);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Could not read image dimensions'));
        };
        img.src = url;
      });
      const url = await uploadImage(file);
      setForm(prev => ({
        ...prev,
        imageUrl: url,
        imageWidth: dims.w,
        imageHeight: dims.h,
      }));
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function save(status: 'draft' | 'published') {
    setError('');
    setSuccessMsg('');

    if (!form.title.trim()) return setError('Title is required');
    if (!form.slug.trim()) return setError('Slug is required');
    if (!form.imageUrl) return setError('Please upload an image');

    const tags = form.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload: Partial<Infographic> & { version?: number } = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl,
      imageWidth: form.imageWidth,
      imageHeight: form.imageHeight,
      altText: form.altText.trim() || form.title.trim(),
      tags,
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
      status,
    };

    setSaving(true);
    try {
      if (isEdit) {
        const updated = await updateInfographic(slug!, { ...payload, version });
        setVersion(updated.version);
        setSuccessMsg(status === 'published' ? 'Published!' : 'Saved.');
        if (updated.slug !== slug) {
          window.location.href = `/admin/infographics/edit/${updated.slug}`;
        }
      } else {
        const created = await createInfographic(payload);
        window.location.href = `/admin/infographics/edit/${created.slug}`;
      }
    } catch (err: any) {
      if (err instanceof ConflictError) {
        setError('Conflict: this infographic was modified elsewhere. Reload and try again.');
      } else {
        setError(err.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isAuth) return null;
  if (loading) return <p className="text-zinc-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-6 animate-[fade-enter_0.4s_ease-out]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-medium text-zinc-100 tracking-tight">
          {isEdit ? 'Edit Infographic' : 'New Infographic'}
        </h1>
        <a
          href="/admin/infographics"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Back
        </a>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm">
          {successMsg}
        </div>
      )}

      <div className="space-y-5">
        {/* Image upload */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Image *</label>
          {form.imageUrl ? (
            <div className="space-y-2">
              <img
                src={form.imageUrl}
                alt="Preview"
                className="max-h-96 rounded-lg border border-white/10 object-contain bg-zinc-900/40"
              />
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>{form.imageWidth} × {form.imageHeight}</span>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, imageUrl: '', imageWidth: 0, imageHeight: 0 }))}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full py-12 border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] rounded-xl text-zinc-500 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Click to upload infographic image'}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900/40 border border-white/10 focus:border-white/20 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
            placeholder="e.g. 5-Minute Breathing Technique"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Slug *</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => { setSlugTouched(true); update('slug', slugify(e.target.value)); }}
            className="w-full px-4 py-2.5 bg-zinc-900/40 border border-white/10 focus:border-white/20 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none font-mono text-sm transition-colors"
            placeholder="5-minute-breathing-technique"
          />
          <p className="text-[10px] text-zinc-600">URL: /infographic/{form.slug || 'your-slug'}</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-zinc-900/40 border border-white/10 focus:border-white/20 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none resize-y transition-colors"
            placeholder="Short blurb shown on the listing, meta description, and RSS feed."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Alt text</label>
          <input
            type="text"
            value={form.altText}
            onChange={(e) => update('altText', e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900/40 border border-white/10 focus:border-white/20 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
            placeholder="Describe the image for accessibility and image search"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Tags</label>
          <input
            type="text"
            value={form.tagsInput}
            onChange={(e) => update('tagsInput', e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900/40 border border-white/10 focus:border-white/20 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
            placeholder="breathing, anxiety, beginners (comma separated)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">SEO title</label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => update('seoTitle', e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900/40 border border-white/10 focus:border-white/20 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
              placeholder="Defaults to title"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">SEO description</label>
            <input
              type="text"
              value={form.seoDescription}
              onChange={(e) => update('seoDescription', e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900/40 border border-white/10 focus:border-white/20 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
              placeholder="Defaults to description"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={saving || uploading}
            className="px-5 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={() => save('published')}
            disabled={saving || uploading}
            className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInfographicForm;
