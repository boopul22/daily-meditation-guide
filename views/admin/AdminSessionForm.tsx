import React, { useCallback, useEffect, useRef, useState } from 'react';
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

type MobileTab = 'details' | 'editor' | 'preview';

interface FormData {
  title: string; slug: string; author: string; role: string; duration: string;
  category: string; color: string; description: string;
  featuredImage: string; audioUrl: string; fullContent: string;
  relatedSessions: string[];
}

const AdminSessionForm: React.FC = () => {
  const isAuth = useAdminAuth();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEdit = !!slug;

  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const featuredFileRef = useRef<HTMLInputElement>(null);
  const [rightTab, setRightTab] = useState<'editor' | 'preview'>('editor');
  const [mobileTab, setMobileTab] = useState<MobileTab>('details');

  // Draft/publish state
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null); // Track the slug after first save for auto-save
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUnsavedChanges = useRef(false);
  const formRef = useRef<FormData | null>(null);

  const [form, setForm] = useState<FormData>({
    title: '', slug: '', author: '', role: '', duration: '',
    category: CATEGORIES[0], color: COLORS[0], description: '',
    featuredImage: '', audioUrl: '', fullContent: '',
    relatedSessions: [],
  });

  // Keep formRef in sync
  useEffect(() => { formRef.current = form; }, [form]);

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
          setStatus(session.status || 'draft');
          setPublishedAt(session.publishedAt || null);
          setSavedSlug(session.slug);
        }
      } catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, [isAuth, isEdit, slug]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !isEdit && !savedSlug) updated.slug = slugify(value);
      if (field === 'author') {
        const match = allSessions.find(s => s.author === value);
        if (match) updated.role = match.role;
      }
      return updated;
    });
    hasUnsavedChanges.current = true;
    scheduleAutoSave();
  };

  const toggleRelated = (id: string) => {
    setForm(prev => ({
      ...prev,
      relatedSessions: prev.relatedSessions.includes(id)
        ? prev.relatedSessions.filter(r => r !== id)
        : [...prev.relatedSessions, id],
    }));
    hasUnsavedChanges.current = true;
    scheduleAutoSave();
  };

  // Auto-save logic — save as draft after 3s of inactivity
  const doAutoSave = useCallback(async () => {
    const currentForm = formRef.current;
    if (!currentForm || !hasUnsavedChanges.current) return;
    if (!currentForm.title || !currentForm.slug) return; // Need at least title+slug

    hasUnsavedChanges.current = false;
    setAutoSaveStatus('saving');
    try {
      const payload = { ...currentForm, durationSec: parseDurationToSec(currentForm.duration), status: status };
      if (savedSlug) {
        await updateSession(savedSlug, payload);
        // If slug changed, update savedSlug
        if (currentForm.slug !== savedSlug) setSavedSlug(currentForm.slug);
      } else {
        const created = await createSession({ ...payload, status: 'draft' });
        setSavedSlug(created.slug);
        setStatus('draft');
      }
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch {
      setAutoSaveStatus('error');
      hasUnsavedChanges.current = true; // Retry on next change
    }
  }, [savedSlug, status]);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(doAutoSave, 3000);
  }, [doAutoSave]);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

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

  // Save draft explicitly
  const handleSaveDraft = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, durationSec: parseDurationToSec(form.duration), status: 'draft' as const };
      if (savedSlug) {
        await updateSession(savedSlug, payload);
        if (form.slug !== savedSlug) setSavedSlug(form.slug);
      } else {
        const created = await createSession(payload);
        setSavedSlug(created.slug);
      }
      setStatus('draft');
      hasUnsavedChanges.current = false;
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Publish
  const handlePublish = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setPublishing(true);
    setError('');
    try {
      const payload = { ...form, durationSec: parseDurationToSec(form.duration), status: 'published' as const };
      if (savedSlug) {
        const updated = await updateSession(savedSlug, payload);
        if (form.slug !== savedSlug) setSavedSlug(form.slug);
        setPublishedAt(updated.publishedAt || null);
      } else {
        const created = await createSession(payload);
        setSavedSlug(created.slug);
        setPublishedAt(created.publishedAt || null);
      }
      setStatus('published');
      hasUnsavedChanges.current = false;
    } catch (err: any) { setError(err.message); }
    finally { setPublishing(false); }
  };

  // Unpublish — revert to draft
  const handleUnpublish = async () => {
    if (!savedSlug) return;
    setSaving(true);
    setError('');
    try {
      await updateSession(savedSlug, { ...form, durationSec: parseDurationToSec(form.duration), status: 'draft' } as any);
      setStatus('draft');
      setPublishedAt(null);
      hasUnsavedChanges.current = false;
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Prevent accidental form submit — all actions are via buttons
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (!isAuth) return null;
  if (loading) return <div className="h-screen flex items-center justify-center"><p className="text-zinc-500">Loading...</p></div>;

  const relatedOptions = allSessions.filter(s => s.slug !== form.slug);
  const existingAuthors = [...new Set(allSessions.map(s => s.author).filter(Boolean))];
  const existingRoles = [...new Set(allSessions.map(s => s.role).filter(Boolean))];
  const isBusy = saving || publishing;

  const statusBadge = status === 'published' ? (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Published</span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">Draft</span>
  );

  const autoSaveIndicator = autoSaveStatus === 'saving' ? (
    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
      <span className="w-2 h-2 border border-zinc-500 border-t-zinc-300 rounded-full animate-spin"></span>
      Saving...
    </span>
  ) : autoSaveStatus === 'saved' ? (
    <span className="text-[10px] text-zinc-500">Saved</span>
  ) : autoSaveStatus === 'error' ? (
    <span className="text-[10px] text-red-400">Save failed</span>
  ) : null;

  const metadataFields = (
    <>
      <input
        value={form.title}
        onChange={e => handleChange('title', e.target.value)}
        placeholder="Session title"
        className="sf-input !text-sm !font-medium !text-zinc-100 !py-2"
        required
      />

      <div>
        <span className="sf-label">Slug</span>
        <input value={form.slug} onChange={e => handleChange('slug', e.target.value)} className="sf-input !text-xs !text-zinc-500" required />
      </div>

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

      <div>
        <span className="sf-label">Description</span>
        <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={2} className="sf-input resize-none" required />
      </div>

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

      <div>
        <span className="sf-label">Audio URL</span>
        <input value={form.audioUrl} onChange={e => handleChange('audioUrl', e.target.value)} placeholder="https://..." className="sf-input !text-xs" />
      </div>

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

      {/* Published info */}
      {publishedAt && (
        <div className="pt-1 border-t border-white/5">
          <span className="sf-label">Published</span>
          <p className="text-[11px] text-zinc-500">{new Date(publishedAt).toLocaleString()}</p>
        </div>
      )}
    </>
  );

  return (
    <form onSubmit={handleFormSubmit} className="fixed inset-0 flex flex-col bg-[#030303] z-50">
      {/* Top Bar */}
      <div className="flex-none flex items-center justify-between px-3 md:px-5 py-2 md:py-2.5 border-b border-white/5 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="flex-none w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <iconify-icon icon="solar:arrow-left-linear" width="16"></iconify-icon>
          </button>
          <h1 className="text-xs md:text-sm font-medium text-zinc-100 truncate">
            {isEdit ? 'Edit' : 'New'}{form.title ? `: ${form.title}` : ' Session'}
          </h1>
          <span className="hidden sm:inline">{statusBadge}</span>
          {autoSaveIndicator && <span className="hidden sm:inline">{autoSaveIndicator}</span>}
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          {error && <span className="text-red-400 text-xs max-w-32 truncate hidden lg:inline">{error}</span>}

          {/* Save Draft button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isBusy}
            className="px-2.5 md:px-3 py-1.5 border border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-400 hover:text-zinc-200 rounded-lg font-medium text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving && <span className="w-3 h-3 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin"></span>}
            <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Draft'}</span>
            <span className="sm:hidden">{saving ? '...' : 'Draft'}</span>
          </button>

          {/* Publish / Unpublish */}
          {status === 'published' ? (
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={isBusy}
              className="px-2.5 md:px-3 py-1.5 border border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400 rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isBusy}
              className="px-2.5 md:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {publishing && <span className="w-3 h-3 border-2 border-emerald-300 border-t-white rounded-full animate-spin"></span>}
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Mobile status bar */}
      <div className="flex-none md:hidden flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-zinc-950/50">
        <div className="flex items-center gap-2">
          {statusBadge}
          {autoSaveIndicator}
        </div>
        {error && <span className="text-red-400 text-[10px] max-w-40 truncate">{error}</span>}
      </div>

      {/* Mobile Tabs */}
      <div className="flex-none md:hidden flex border-b border-white/5">
        {(['details', 'editor', 'preview'] as const).map(tab => (
          <button key={tab} type="button" onClick={() => setMobileTab(tab)}
            className={`flex-1 px-2 py-2.5 text-[11px] font-medium transition-colors border-b-2 -mb-px flex items-center justify-center gap-1.5 ${mobileTab === tab ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-500'}`}
          >
            <iconify-icon icon={tab === 'details' ? 'solar:settings-linear' : tab === 'editor' ? 'solar:pen-linear' : 'solar:eye-linear'} width="14"></iconify-icon>
            {tab === 'details' ? 'Details' : tab === 'editor' ? 'Write' : 'Preview'}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop: Left Sidebar */}
        <div className="hidden md:block flex-none w-72 xl:w-80 border-r border-white/5 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
          {metadataFields}
        </div>

        {/* Mobile: Details */}
        <div className={`md:hidden flex-1 overflow-y-auto p-3 space-y-3 ${mobileTab === 'details' ? '' : 'hidden'}`}>
          {metadataFields}
        </div>

        {/* Desktop: Right panel */}
        <div className="hidden md:flex flex-1 flex-col min-w-0">
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

        {/* Mobile: Editor */}
        <div className={`md:hidden flex-1 flex flex-col min-w-0 ${mobileTab === 'editor' ? '' : 'hidden'}`}>
          <div className="h-full flex flex-col">
            <RichTextEditor key={(slug || 'new') + '-mobile'} content={form.fullContent} onChange={(html) => handleChange('fullContent', html)} />
          </div>
        </div>

        {/* Mobile: Preview */}
        <div className={`md:hidden flex-1 overflow-y-auto p-4 ${mobileTab === 'preview' ? '' : 'hidden'}`}>
          {form.fullContent ? (
            <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: form.fullContent }} />
          ) : (
            <p className="text-zinc-600 text-sm italic text-center mt-20">Preview will appear here...</p>
          )}
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
        @media (max-width: 767px) {
          .sf-input {
            padding: 0.5rem 0.625rem;
            font-size: 1rem;
            border-radius: 0.5rem;
          }
          .sf-label {
            font-size: 0.6875rem;
            margin-bottom: 0.25rem;
          }
        }
      `}</style>
    </form>
  );
};

export default AdminSessionForm;
