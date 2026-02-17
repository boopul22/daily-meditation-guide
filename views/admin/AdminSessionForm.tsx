import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../lib/useAdminAuth';
import { fetchSessions, fetchSessionBySlug, createSession, updateSession, uploadImage } from '../../lib/api';
import { Session } from '../../types';
import RichTextEditor from '../../components/admin/RichTextEditor';

const CATEGORIES = ['Sleep', 'Anxiety', 'Focus', 'Sounds'];
const COLORS = ['indigo', 'teal', 'orange', 'rose', 'blue', 'emerald', 'purple'];
const COLOR_DOT: Record<string, string> = {
  indigo: 'bg-indigo-500', teal: 'bg-teal-500', orange: 'bg-orange-500',
  rose: 'bg-rose-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500', purple: 'bg-purple-500',
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const featuredFileRef = useRef<HTMLInputElement>(null);
  const [rightTab, setRightTab] = useState<'editor' | 'preview'>('editor');

  const [form, setForm] = useState({
    title: '', slug: '', author: '', role: '', duration: '',
    category: CATEGORIES[0], color: COLORS[0], description: '',
    featuredImage: '', audioUrl: '', fullContent: '',
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
            title: session.title, slug: session.slug, author: session.author,
            role: session.role, duration: session.duration, category: session.category,
            color: session.color, description: session.description,
            featuredImage: session.featuredImage || '', audioUrl: session.audioUrl || '',
            fullContent: session.fullContent, relatedSessions: session.relatedSessions,
          });
        }
      } catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, [isAuth, isEdit, slug]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !isEdit) updated.slug = slugify(value);
      // Auto-fill role when selecting an existing author
      if (field === 'author') {
        const match = allSessions.find(s => s.author === value);
        if (match) updated.role = match.role;
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

  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingFeatured(true);
    try {
      const url = await uploadImage(e.target.files[0]);
      handleChange('featuredImage', url);
    } catch (err: any) { setError(`Upload failed: ${err.message}`); }
    finally {
      setUploadingFeatured(false);
      if (featuredFileRef.current) featuredFileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, durationSec: parseDurationToSec(form.duration) };
      if (isEdit && slug) await updateSession(slug, payload);
      else await createSession(payload);
      navigate('/admin/dashboard');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (!isAuth) return null;
  if (loading) return <div className="h-screen flex items-center justify-center"><p className="text-zinc-500">Loading...</p></div>;

  const relatedOptions = allSessions.filter(s => s.slug !== form.slug);
  const existingAuthors = [...new Set(allSessions.map(s => s.author).filter(Boolean))];
  const existingRoles = [...new Set(allSessions.map(s => s.role).filter(Boolean))];

  return (
    <form onSubmit={handleSubmit} className="fixed inset-0 flex flex-col bg-[#030303] z-50">
      {/* Top Bar */}
      <div className="flex-none flex items-center justify-between px-5 py-2.5 border-b border-white/5 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="flex-none w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <iconify-icon icon="solar:arrow-left-linear" width="16"></iconify-icon>
          </button>
          <h1 className="text-sm font-medium text-zinc-100 truncate">
            {isEdit ? 'Edit' : 'New'}{form.title ? `: ${form.title}` : ' Session'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-red-400 text-xs max-w-48 truncate hidden sm:inline">{error}</span>}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg font-medium text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving && <span className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin"></span>}
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <div className="flex-none w-72 xl:w-80 border-r border-white/5 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
          {/* Title */}
          <input
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="Session title"
            className="sf-input !text-sm !font-medium !text-zinc-100 !py-2"
            required
          />

          {/* Slug */}
          <div>
            <span className="sf-label">Slug</span>
            <input value={form.slug} onChange={e => handleChange('slug', e.target.value)} className="sf-input !text-xs !text-zinc-500" required />
          </div>

          {/* Author + Role */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="sf-label">Author</span>
              <input value={form.author} onChange={e => handleChange('author', e.target.value)} list="authors-list" className="sf-input" required />
              <datalist id="authors-list">{existingAuthors.map(a => <option key={a} value={a} />)}</datalist>
            </div>
            <div>
              <span className="sf-label">Role</span>
              <input value={form.role} onChange={e => handleChange('role', e.target.value)} list="roles-list" className="sf-input" required />
              <datalist id="roles-list">{existingRoles.map(r => <option key={r} value={r} />)}</datalist>
            </div>
          </div>

          {/* Duration + Category + Color */}
          <div className="grid grid-cols-3 gap-2">
            <div><span className="sf-label">Duration</span><input value={form.duration} onChange={e => handleChange('duration', e.target.value)} placeholder="Optional" className="sf-input" /></div>
            <div><span className="sf-label">Category</span><select value={form.category} onChange={e => handleChange('category', e.target.value)} className="sf-input">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div>
              <span className="sf-label">Color</span>
              <div className="flex items-center gap-1.5">
                <span className={`flex-none w-2 h-2 rounded-full ${COLOR_DOT[form.color] || 'bg-zinc-500'}`}></span>
                <select value={form.color} onChange={e => handleChange('color', e.target.value)} className="sf-input !flex-1">{COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="sf-label">Description</span>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={2} className="sf-input resize-none" required />
          </div>

          {/* Featured Image */}
          <div>
            <span className="sf-label">Featured Image</span>
            <div className="flex gap-1.5">
              <input value={form.featuredImage} onChange={e => handleChange('featuredImage', e.target.value)} placeholder="URL or upload" className="sf-input flex-1 !text-xs" />
              <input ref={featuredFileRef} type="file" accept="image/*" className="hidden" onChange={handleFeaturedUpload} />
              <button
                type="button"
                onClick={() => featuredFileRef.current?.click()}
                disabled={uploadingFeatured}
                className="flex-none w-8 h-[30px] rounded-md border border-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {uploadingFeatured
                  ? <span className="w-3 h-3 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin"></span>
                  : <iconify-icon icon="solar:upload-linear" width="13"></iconify-icon>
                }
              </button>
            </div>
            {form.featuredImage && (
              <img src={form.featuredImage} alt="" className="mt-1.5 rounded-lg h-20 w-full object-cover border border-white/10" onError={e => (e.currentTarget.style.display = 'none')} />
            )}
          </div>

          {/* Audio URL */}
          <div>
            <span className="sf-label">Audio URL</span>
            <input value={form.audioUrl} onChange={e => handleChange('audioUrl', e.target.value)} placeholder="https://..." className="sf-input !text-xs" />
          </div>

          {/* Related Sessions */}
          {relatedOptions.length > 0 && (
            <div>
              <span className="sf-label">Related</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {relatedOptions.map(s => {
                  const sel = form.relatedSessions.includes(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => toggleRelated(s.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${sel ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'}`}
                    >{s.title}</button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right — Editor / Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex-none flex items-center border-b border-white/5 px-1">
            {(['editor', 'preview'] as const).map(tab => (
              <button key={tab} type="button" onClick={() => setRightTab(tab)}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${rightTab === tab ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                <iconify-icon icon={tab === 'editor' ? 'solar:pen-linear' : 'solar:eye-linear'} width="13"></iconify-icon>
                {tab === 'editor' ? 'Write' : 'Preview'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {rightTab === 'editor' ? (
              <div className="h-full flex flex-col">
                <RichTextEditor key={slug || 'new'} content={form.fullContent} onChange={(html) => handleChange('fullContent', html)} />
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-8">
                {form.fullContent ? (
                  <div className="prose prose-invert max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: form.fullContent }} />
                ) : (
                  <p className="text-zinc-600 text-sm italic text-center mt-20">Preview will appear here...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sf-label {
          display: block;
          font-size: 0.625rem;
          color: rgb(82 82 91);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.125rem;
        }
        .sf-input {
          width: 100%;
          padding: 0.3rem 0.5rem;
          background: rgb(24 24 27 / 0.5);
          border: 1px solid rgb(255 255 255 / 0.07);
          border-radius: 0.375rem;
          color: #e4e4e7;
          font-size: 0.75rem;
          transition: border-color 0.15s;
        }
        .sf-input:focus {
          outline: none;
          border-color: rgb(255 255 255 / 0.2);
        }
        .sf-input::placeholder {
          color: rgb(63 63 70);
        }
      `}</style>
    </form>
  );
};

export default AdminSessionForm;
