import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../lib/useAdminAuth';
import { fetchSessions, fetchSessionBySlug, createSession, updateSession } from '../../lib/api';
import { Session } from '../../types';

const CATEGORIES = ['Sleep', 'Anxiety', 'Focus', 'Sounds'];
const COLORS = ['indigo', 'teal', 'orange', 'rose', 'blue', 'emerald', 'purple'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseDurationToSec(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

const AdminSessionForm: React.FC = () => {
  const isAuth = useAdminAuth();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEdit = !!slug;

  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    author: '',
    role: '',
    duration: '',
    category: CATEGORIES[0],
    color: COLORS[0],
    description: '',
    fullContent: '',
    relatedSessions: [] as string[],
  });

  useEffect(() => {
    if (!isAuth) return;

    const load = async () => {
      try {
        const sessions = await fetchSessions();
        setAllSessions(sessions);

        if (isEdit && slug) {
          const session = await fetchSessionBySlug(slug);
          setForm({
            title: session.title,
            slug: session.slug,
            author: session.author,
            role: session.role,
            duration: session.duration,
            category: session.category,
            color: session.color,
            description: session.description,
            fullContent: session.fullContent,
            relatedSessions: session.relatedSessions,
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuth, isEdit, slug]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !isEdit) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const toggleRelated = (id: string) => {
    setForm(prev => ({
      ...prev,
      relatedSessions: prev.relatedSessions.includes(id)
        ? prev.relatedSessions.filter(r => r !== id)
        : [...prev.relatedSessions, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      durationSec: parseDurationToSec(form.duration),
    };

    try {
      if (isEdit && slug) {
        await updateSession(slug, payload);
      } else {
        await createSession(payload);
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuth) return null;
  if (loading) return <p className="text-zinc-500">Loading...</p>;

  // Filter out current session from related options
  const relatedOptions = allSessions.filter(s => s.slug !== form.slug);

  return (
    <div className="animate-[fade-enter_0.5s_ease-out]">
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-200 mb-6 transition-colors"
      >
        <iconify-icon icon="solar:arrow-left-linear" class="group-hover:-translate-x-1 transition-transform"></iconify-icon>
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      <h1 className="text-2xl font-medium text-zinc-100 tracking-tight mb-8">
        {isEdit ? 'Edit Session' : 'New Session'}
      </h1>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form Fields */}
          <div className="space-y-5">
            <Field label="Title">
              <input
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                className="input-field"
                required
              />
            </Field>

            <Field label="Slug">
              <input
                value={form.slug}
                onChange={e => handleChange('slug', e.target.value)}
                className="input-field"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Author">
                <input
                  value={form.author}
                  onChange={e => handleChange('author', e.target.value)}
                  className="input-field"
                  required
                />
              </Field>
              <Field label="Role">
                <input
                  value={form.role}
                  onChange={e => handleChange('role', e.target.value)}
                  className="input-field"
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Duration (mm:ss)">
                <input
                  value={form.duration}
                  onChange={e => handleChange('duration', e.target.value)}
                  placeholder="10:00"
                  className="input-field"
                  required
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="input-field"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Color">
                <select
                  value={form.color}
                  onChange={e => handleChange('color', e.target.value)}
                  className="input-field"
                >
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={3}
                className="input-field resize-y"
                required
              />
            </Field>

            <Field label="Full Content (HTML)">
              <textarea
                value={form.fullContent}
                onChange={e => handleChange('fullContent', e.target.value)}
                rows={12}
                className="input-field resize-y font-mono text-xs"
              />
            </Field>

            {relatedOptions.length > 0 && (
              <Field label="Related Sessions">
                <div className="space-y-2">
                  {relatedOptions.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.relatedSessions.includes(s.id)}
                        onChange={() => toggleRelated(s.id)}
                        className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/20"
                      />
                      <span className="text-sm text-zinc-300">{s.title}</span>
                    </label>
                  ))}
                </div>
              </Field>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Session' : 'Create Session'}
            </button>
          </div>

          {/* Right: Live Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Content Preview</h3>
            <div className="border border-white/5 rounded-xl p-6 bg-zinc-900/30 min-h-[400px] overflow-y-auto">
              {form.fullContent ? (
                <div
                  className="prose prose-invert prose-zinc max-w-none text-zinc-400 font-light leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: form.fullContent }}
                />
              ) : (
                <p className="text-zinc-600 text-sm italic">HTML preview will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: rgb(24 24 27 / 0.5);
          border: 1px solid rgb(255 255 255 / 0.1);
          border-radius: 0.75rem;
          color: #e4e4e7;
          font-size: 0.875rem;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          outline: none;
          border-color: rgb(255 255 255 / 0.2);
        }
        .input-field::placeholder {
          color: rgb(82 82 91);
        }
      `}</style>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export default AdminSessionForm;
