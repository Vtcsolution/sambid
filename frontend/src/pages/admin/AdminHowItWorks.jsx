import { useState, useEffect, useRef } from 'react';
import {
  Layers, Save, Loader, RefreshCw, Sparkles, Upload, Plus, Trash2,
  ChevronDown, ChevronUp, Play, Image as ImageIcon,
} from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
function authH() {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}
async function api(path, method = 'GET', body) {
  const r = await fetch(`${BASE}/api/how-it-works${path}`, { method, headers: authH(), body: body ? JSON.stringify(body) : undefined });
  return r.json();
}
async function uploadFile(file) {
  const token = localStorage.getItem('adminToken');
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(`${BASE}/api/how-it-works/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
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

const ICON_OPTIONS = ['Users', 'SlidersHorizontal', 'FileText', 'BellRing', 'Timer', 'Shield', 'Target', 'Award', 'TrendingUp', 'Zap'];
const FLOW_KINDS = ['in', 'out', 'eng', 'gold'];

function Section({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50">
        <span className="font-bold text-gray-900 text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  );
}

function TextField({ label, value, onChange, textarea, mono }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      {textarea ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3}
          className={`w-full text-sm border rounded-lg px-3 py-2 ${mono ? 'font-mono' : ''}`} />
      ) : (
        <input value={value || ''} onChange={e => onChange(e.target.value)}
          className={`w-full text-sm border rounded-lg px-3 py-2 ${mono ? 'font-mono' : ''}`} />
      )}
    </div>
  );
}

function FlowEditor({ flow, onChange }) {
  const items = flow || [];
  const update = (i, patch) => { const next = [...items]; next[i] = { ...next[i], ...patch }; onChange(next); };
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  const add = (isSep) => onChange([...items, isSep ? { sep: '→' } : { label: '', kind: 'in' }]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-500">Workflow Chips (the "Automated Workflow" strip)</label>
        <div className="flex gap-2">
          <button onClick={() => add(false)} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Chip</button>
          <button onClick={() => add(true)} className="text-xs text-gray-500 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Arrow/Sep</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1.5">
            {item.sep !== undefined ? (
              <input value={item.sep} onChange={e => update(i, { sep: e.target.value, label: undefined })} className="w-10 text-xs text-center border rounded px-1 py-1" placeholder="→" />
            ) : (
              <>
                <input value={item.label || ''} onChange={e => update(i, { label: e.target.value })} className="text-xs border rounded px-2 py-1 w-40" placeholder="Chip label" />
                <select value={item.kind || 'in'} onChange={e => update(i, { kind: e.target.value })} className="text-xs border rounded px-1 py-1 bg-white">
                  {FLOW_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </>
            )}
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PainPointEditor({ point, index, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const set = (patch) => onChange({ ...point, ...patch });

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{point.num || index + 1}</span>
        <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{point.title || 'Untitled point'}</span>
        {point.video && <span className="inline-flex items-center gap-0.5 text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full shrink-0"><Play className="w-3 h-3" />Video</span>}
        {point.videoThumbnail && !point.video && <span className="inline-flex items-center gap-0.5 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full shrink-0"><ImageIcon className="w-3 h-3" />Thumb</span>}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <TextField label="Num" value={point.num} onChange={v => set({ num: v })} />
            <TextField label="Title" value={point.title} onChange={v => set({ title: v })} />
          </div>
          <TextField label="The Problem" value={point.pain} onChange={v => set({ pain: v })} textarea />
          <TextField label="The Sambid Fix" value={point.solve} onChange={v => set({ solve: v })} textarea />

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Video (YouTube link)</label>
            <input value={point.video || ''} onChange={e => set({ video: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full text-sm border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Video Thumbnail (poster image / shown if no video yet)</label>
            <div className="flex gap-2">
              <input value={point.videoThumbnail || ''} onChange={e => set({ videoThumbnail: e.target.value })} placeholder="Image URL or upload →" className="flex-1 text-sm border rounded-lg px-3 py-2" />
              <UploadBtn label="Image" accept="image/jpeg,image/png,image/webp,image/gif" onUploaded={url => set({ videoThumbnail: url })} />
            </div>
            {point.videoThumbnail && <img src={point.videoThumbnail} alt="" className="mt-2 h-16 rounded border object-cover" />}
          </div>

          <FlowEditor flow={point.flow} onChange={flow => set({ flow })} />

          <button onClick={onRemove} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />Remove this point</button>
        </div>
      )}
    </div>
  );
}

export default function AdminHowItWorks() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api('/admin');
    if (r.success) setContent(r.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSeed = async () => {
    if (!confirm('Seed the How It Works page with the current default copy? Only works if nothing exists yet.')) return;
    setSeeding(true);
    const r = await api('/admin/seed', 'POST');
    alert(r.message || (r.success ? 'Seeded.' : 'Failed'));
    if (r.success) setContent(r.data);
    setSeeding(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const r = await api('/admin', 'PUT', content);
    if (r.success) { setContent(r.data); alert('Saved.'); }
    else alert(r.message || 'Save failed');
    setSaving(false);
  };

  const set = (path, value) => {
    setContent(prev => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  if (!content) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="font-medium text-gray-700">No How It Works content yet</p>
        <p className="text-sm text-gray-400 mt-1 mb-4">Seed it with the current default copy, then edit anything below.</p>
        <button onClick={handleSeed} disabled={seeding} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mx-auto">
          {seeding ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Seed Default Content
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1000px] mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" /> How It Works Page
          </h1>
          <p className="text-sm text-gray-500">Edit the hero, comparison table, AI engine strip, and all 17 pain points — including their videos.</p>
        </div>
        <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg shrink-0"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="space-y-3">
        <Section title="Hero" defaultOpen>
          <TextField label="Badge text" value={content.hero?.badge} onChange={v => set('hero.badge', v)} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Title line 1" value={content.hero?.titleLine1} onChange={v => set('hero.titleLine1', v)} />
            <TextField label="Title line 2" value={content.hero?.titleLine2} onChange={v => set('hero.titleLine2', v)} />
          </div>
          <TextField label="Subtitle" value={content.hero?.subtitle} onChange={v => set('hero.subtitle', v)} textarea />
        </Section>

        <Section title="Comparison Section (5-item table)">
          <TextField label="Tag" value={content.compareSection?.tag} onChange={v => set('compareSection.tag', v)} />
          <TextField label="Title" value={content.compareSection?.title} onChange={v => set('compareSection.title', v)} />
          <TextField label="Subtitle" value={content.compareSection?.subtitle} onChange={v => set('compareSection.subtitle', v)} />
          <div className="space-y-2">
            {(content.compareSection?.items || []).map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={item.topic} onChange={e => { const items = [...content.compareSection.items]; items[i] = { ...items[i], topic: e.target.value }; set('compareSection.items', items); }} placeholder="Topic" className="text-xs border rounded-lg px-2 py-1.5" />
                  <select value={item.icon} onChange={e => { const items = [...content.compareSection.items]; items[i] = { ...items[i], icon: e.target.value }; set('compareSection.items', items); }} className="text-xs border rounded-lg px-2 py-1.5 bg-white">
                    {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <input value={item.before} onChange={e => { const items = [...content.compareSection.items]; items[i] = { ...items[i], before: e.target.value }; set('compareSection.items', items); }} placeholder="Before" className="w-full text-xs border rounded-lg px-2 py-1.5" />
                <input value={item.after} onChange={e => { const items = [...content.compareSection.items]; items[i] = { ...items[i], after: e.target.value }; set('compareSection.items', items); }} placeholder="After" className="w-full text-xs border rounded-lg px-2 py-1.5" />
              </div>
            ))}
          </div>
          <TextField label="Summary line" value={content.compareSection?.summaryLine} onChange={v => set('compareSection.summaryLine', v)} />
        </Section>

        <Section title="AI Engine Strip">
          <TextField label="Tag" value={content.aiEngineSection?.tag} onChange={v => set('aiEngineSection.tag', v)} />
          <TextField label="Title" value={content.aiEngineSection?.title} onChange={v => set('aiEngineSection.title', v)} />
          <TextField label="Subtitle" value={content.aiEngineSection?.subtitle} onChange={v => set('aiEngineSection.subtitle', v)} textarea />
          <FlowEditor flow={content.aiEngineSection?.flow} onChange={flow => set('aiEngineSection.flow', flow)} />
        </Section>

        <Section title="Pain Points — Section Header">
          <TextField label="Tag" value={content.painPointsSection?.tag} onChange={v => set('painPointsSection.tag', v)} />
          <TextField label="Title" value={content.painPointsSection?.title} onChange={v => set('painPointsSection.title', v)} />
          <TextField label="Subtitle" value={content.painPointsSection?.subtitle} onChange={v => set('painPointsSection.subtitle', v)} />
        </Section>

        <Section title={`The 17 Pain Points (${content.painPoints?.length || 0})`} defaultOpen>
          <div className="flex justify-end mb-1">
            <button
              onClick={() => set('painPoints', [...(content.painPoints || []), { num: String((content.painPoints?.length || 0) + 1).padStart(2, '0'), title: '', pain: '', solve: '', flow: [] }])}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            ><Plus className="w-3 h-3" />Add Point</button>
          </div>
          <div className="space-y-2">
            {(content.painPoints || []).map((point, i) => (
              <PainPointEditor
                key={i}
                point={point}
                index={i}
                onChange={updated => { const pts = [...content.painPoints]; pts[i] = updated; set('painPoints', pts); }}
                onRemove={() => set('painPoints', content.painPoints.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        </Section>

        <Section title="Closing CTA">
          <TextField label="Title" value={content.closing?.title} onChange={v => set('closing.title', v)} />
          <TextField label="Text" value={content.closing?.text} onChange={v => set('closing.text', v)} textarea />
        </Section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 px-6 py-3 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Changes
        </button>
      </div>
    </div>
  );
}
