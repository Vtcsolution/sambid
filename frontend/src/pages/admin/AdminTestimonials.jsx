import { useState, useEffect, useRef } from 'react';
import {
  Quote, Plus, Edit2, Trash2, Save, Loader, X, Eye, EyeOff,
  RefreshCw, Star, Upload, Image as ImageIcon, Play, ExternalLink,
} from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
function authH(json = true) {
  const token = localStorage.getItem('adminToken');
  const h = { Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}
async function api(path, method = 'GET', body) {
  const r = await fetch(`${BASE}/api/testimonials${path}`, { method, headers: authH(), body: body ? JSON.stringify(body) : undefined });
  return r.json();
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(`${BASE}/api/testimonials/admin/upload`, { method: 'POST', headers: authH(false), body: fd });
  return r.json();
}

function UploadBtn({ label, accept, onUploaded }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
          const res = await uploadFile(file);
          if (res.success) onUploaded(res.data.url, res.data.publicId);
          else alert(res.message || 'Upload failed');
        } catch { alert('Upload error'); }
        setUploading(false);
        e.target.value = '';
      }} />
      <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
        className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 disabled:opacity-50 shrink-0">
        {uploading ? <Loader className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {label}
      </button>
    </>
  );
}

function TestimonialEditor({ testimonial, onSave, onCancel }) {
  const [f, setF] = useState(testimonial || {
    clientName: '', company: '', role: '', quote: '', rating: 5,
    imageUrl: '', imagePublicId: '', videoUrl: '', videoPublicId: '',
    isActive: true, order: 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!f.clientName?.trim()) return alert('Client name is required');
    if (!f.quote?.trim()) return alert('Feedback text is required');
    setSaving(true);
    try {
      const res = testimonial?._id
        ? await api(`/admin/${testimonial._id}`, 'PUT', f)
        : await api('/admin', 'POST', f);
      if (res.success) onSave(res.data);
      else alert(res.message || 'Failed');
    } catch { alert('Error saving'); }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{testimonial?._id ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Client Name *</label>
          <input value={f.clientName} onChange={e => set('clientName', e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
          <input value={f.role} onChange={e => set('role', e.target.value)} placeholder="CEO, Founder..." className="w-full text-sm border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Company</label>
          <input value={f.company} onChange={e => set('company', e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Feedback / Quote *</label>
        <textarea value={f.quote} onChange={e => set('quote', e.target.value)} rows={3} className="w-full text-sm border rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} type="button" onClick={() => set('rating', i)}>
              <Star className={`w-6 h-6 ${i <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Client Photo</label>
          <div className="flex gap-2">
            <input value={f.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} placeholder="Image URL or upload →" className="flex-1 text-sm border rounded-lg px-3 py-2" />
            <UploadBtn label="Upload" accept="image/jpeg,image/png,image/webp,image/gif" onUploaded={(url, publicId) => { set('imageUrl', url); set('imagePublicId', publicId); }} />
          </div>
          {f.imageUrl && (
            <div className="mt-1 flex items-center gap-2">
              <img src={f.imageUrl} alt="Preview" className="h-10 rounded border" />
              <p className="text-xs text-green-600 truncate">{f.imageUrl.split('/').pop()}</p>
            </div>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Testimonial Video (optional, overrides photo)</label>
          <div className="flex gap-2">
            <input value={f.videoUrl || ''} onChange={e => set('videoUrl', e.target.value)} placeholder="Video URL or upload →" className="flex-1 text-sm border rounded-lg px-3 py-2" />
            <UploadBtn label="Upload" accept="video/mp4,video/webm,video/quicktime" onUploaded={(url, publicId) => { set('videoUrl', url); set('videoPublicId', publicId); }} />
          </div>
          {f.videoUrl && <p className="text-xs text-green-600 mt-1 truncate">Current: {f.videoUrl.split('/').pop()}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Order</label>
          <input type="number" value={f.order} onChange={e => set('order', Number(e.target.value))} className="w-full text-sm border rounded-lg px-3 py-2" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={f.isActive} onChange={e => set('isActive', e.target.checked)} className="accent-indigo-600 w-4 h-4" />
            Active (shown on public page)
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
        <button onClick={onCancel} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
      </div>
    </div>
  );
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [editing, setEditing]           = useState(null);
  const [adding, setAdding]             = useState(false);
  const [enabled, setEnabled]           = useState(false);
  const [toggling, setToggling]         = useState(false);

  const load = async () => {
    setLoading(true);
    const [listRes, settingsRes] = await Promise.all([
      api('/admin/all'),
      fetch(`${BASE}/api/testimonials/settings`).then(r => r.json()),
    ]);
    if (listRes.success) setTestimonials(listRes.data || []);
    if (settingsRes.success) setEnabled(!!settingsRes.data.isEnabled);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggleFeature = async () => {
    setToggling(true);
    const res = await api('/admin/settings', 'PUT', { isEnabled: !enabled });
    if (res.success) setEnabled(res.data.isEnabled);
    setToggling(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await api(`/admin/${id}`, 'DELETE');
    load();
  };

  const handleToggleActive = async (t) => {
    await api(`/admin/${t._id}`, 'PUT', { isActive: !t.isActive });
    load();
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1440px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Quote className="w-6 h-6 text-indigo-600" /> Testimonials
          </h1>
          <p className="text-sm text-gray-500">Client feedback, photos & videos shown on the public Testimonials page.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setAdding(true); setEditing(null); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
          <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Feature toggle — controls the public nav link + /testimonials page */}
      <div className={`mb-6 rounded-2xl border p-5 flex items-center justify-between gap-4 ${enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
        <div>
          <p className="font-semibold text-gray-900">Testimonials page {enabled ? 'is live' : 'is hidden'}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {enabled
              ? 'The "Testimonials" nav link and public page are visible to visitors.'
              : 'Turn this on to show the "Testimonials" nav link and public page on the site.'}
          </p>
        </div>
        <button
          onClick={handleToggleFeature}
          disabled={toggling}
          className={`shrink-0 relative w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-300'} disabled:opacity-50`}
        >
          <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      {(adding || editing) && (
        <div className="mb-6">
          <TestimonialEditor
            testimonial={editing}
            onSave={() => { setAdding(false); setEditing(null); load(); }}
            onCancel={() => { setAdding(false); setEditing(null); }}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Quote className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No testimonials yet</p>
          <p className="text-sm mt-1">Click "Add Testimonial" to add your first client story.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {testimonials.map(t => (
            <div key={t._id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${t.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50/30'}`}>
              <div className="w-8 text-center text-xs font-bold text-gray-400">{t.order}</div>
              <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                {t.imageUrl ? (
                  <img src={t.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{t.clientName}</p>
                  {!t.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Hidden</span>}
                  {t.videoUrl && <span className="inline-flex items-center gap-0.5 text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full"><Play className="w-3 h-3" />Video</span>}
                  <span className="inline-flex items-center gap-0.5 text-xs text-amber-500">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400" />)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{t.role}{t.role && t.company ? ', ' : ''}{t.company} — {t.quote}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a href="/testimonials" target="_blank" rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-indigo-600"><ExternalLink className="w-4 h-4" /></a>
                <button onClick={() => handleToggleActive(t)} className="p-1.5 text-gray-400 hover:text-amber-600">
                  {t.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditing(t); setAdding(false); }} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t._id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
