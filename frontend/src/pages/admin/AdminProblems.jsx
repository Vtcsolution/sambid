import { useState, useEffect, useRef } from 'react';
import {
  AlertCircle, Plus, Edit2, Trash2, Save, Loader, X, Eye, EyeOff,
  Search, RefreshCw, Sparkles, ExternalLink, Upload,
} from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
function authH() {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}
async function api(path, method = 'GET', body) {
  const r = await fetch(`${BASE}/api/problems${path}`, { method, headers: authH(), body: body ? JSON.stringify(body) : undefined });
  return r.json();
}
async function uploadFile(file) {
  const token = localStorage.getItem('adminToken');
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(`${BASE}/api/problems/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
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
          if (res.success) onUploaded(res.data.url);
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

function ProblemEditor({ problem, onSave, onCancel }) {
  const [p, setP] = useState(problem || {
    slug: '', num: '', title: '', subtitle: '', video: '', videoThumbnail: '',
    timelinePoints: [''], solveTitle: 'How Sambid Solves It', solve: '', isActive: true, order: 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!p.title?.trim()) return alert('Title is required');
    if (!p.slug?.trim()) return alert('Slug is required');
    setSaving(true);
    try {
      const res = problem?._id ? await api(`/admin/${problem._id}`, 'PUT', p) : await api('/admin', 'POST', p);
      if (res.success) onSave(res.data);
      else alert(res.message || 'Failed');
    } catch { alert('Error saving'); }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{problem?._id ? 'Edit Problem' : 'Add Problem'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-[80px_1fr_140px] gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Num</label>
          <input value={p.num} onChange={e => set('num', e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Title *</label>
          <input value={p.title} onChange={e => set('title', e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Order</label>
          <input type="number" value={p.order} onChange={e => set('order', Number(e.target.value))} className="w-full text-sm border rounded-lg px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Slug *</label>
        <input value={p.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="w-full text-sm border rounded-lg px-3 py-2 font-mono" />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Subtitle</label>
        <input value={p.subtitle} onChange={e => set('subtitle', e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Video (YouTube link)</label>
        <input value={p.video} onChange={e => set('video', e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full text-sm border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Video Thumbnail (shown if no video yet)</label>
        <div className="flex gap-2">
          <input value={p.videoThumbnail} onChange={e => set('videoThumbnail', e.target.value)} placeholder="Image URL or upload →" className="flex-1 text-sm border rounded-lg px-3 py-2" />
          <UploadBtn label="Upload" accept="image/jpeg,image/png,image/webp,image/gif" onUploaded={url => set('videoThumbnail', url)} />
        </div>
        {p.videoThumbnail && <img src={p.videoThumbnail} alt="" className="mt-2 h-16 rounded border object-cover" />}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500">Escalating Timeline Points (small → large)</label>
          <button onClick={() => set('timelinePoints', [...(p.timelinePoints || []), ''])} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Add Point</button>
        </div>
        <div className="space-y-2">
          {(p.timelinePoints || []).map((pt, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs font-bold text-indigo-600 mt-2 w-5 shrink-0">{i + 1}.</span>
              <textarea value={pt} rows={2} onChange={e => { const t = [...p.timelinePoints]; t[i] = e.target.value; set('timelinePoints', t); }} className="flex-1 text-sm border rounded-lg px-3 py-1.5" />
              <button onClick={() => set('timelinePoints', p.timelinePoints.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-2"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Solve Section Title</label>
          <input value={p.solveTitle} onChange={e => set('solveTitle', e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm pb-2">
          <input type="checkbox" checked={p.isActive} onChange={e => set('isActive', e.target.checked)} className="accent-indigo-600 w-4 h-4" />
          Active
        </label>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">How Sambid Solves It (full text)</label>
        <textarea value={p.solve} rows={4} onChange={e => set('solve', e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2" />
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

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api('/admin/all');
    if (r.success) setProblems(r.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSeed = async () => {
    if (!confirm('Create the 17 default problem pages? Only works if none exist yet.')) return;
    setSeeding(true);
    const r = await api('/admin/seed', 'POST');
    alert(r.message || (r.success ? 'Seeded.' : 'Failed'));
    if (r.success) load();
    setSeeding(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this problem page?')) return;
    await api(`/admin/${id}`, 'DELETE');
    load();
  };

  const handleToggle = async (p) => {
    await api(`/admin/${p._id}`, 'PUT', { isActive: !p.isActive });
    load();
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-indigo-600" /> Problems Pages
          </h1>
          <p className="text-sm text-gray-500">Manage the 17 public "problem" landing pages - timeline points, fix text, video/thumbnail.</p>
        </div>
        <div className="flex gap-2">
          {problems.length === 0 && (
            <button onClick={handleSeed} disabled={seeding} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
              {seeding ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Seed 17 Defaults
            </button>
          )}
          <button onClick={() => { setAdding(true); setEditing(null); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Problem
          </button>
          <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {(adding || editing) && (
        <div className="mb-6">
          <ProblemEditor
            problem={editing}
            onSave={() => { setAdding(false); setEditing(null); load(); }}
            onCancel={() => { setAdding(false); setEditing(null); }}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No problem pages yet</p>
          <p className="text-sm mt-1">Click "Seed 17 Defaults" to create all of them with preset content</p>
        </div>
      ) : (
        <div className="space-y-2">
          {problems.map(p => (
            <div key={p._id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${p.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50/30'}`}>
              <div className="w-8 text-center text-xs font-bold text-gray-400">{p.num}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                  {!p.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Hidden</span>}
                  {p.video && <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">Video</span>}
                </div>
                <p className="text-xs text-gray-500 truncate">/problems/{p.slug} · {p.timelinePoints?.length || 0} timeline points</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a href={`/problems/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-indigo-600"><ExternalLink className="w-4 h-4" /></a>
                <button onClick={() => handleToggle(p)} className="p-1.5 text-gray-400 hover:text-amber-600">{p.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                <button onClick={() => { setEditing(p); setAdding(false); }} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
