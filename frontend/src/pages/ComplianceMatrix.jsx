import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck, Sparkles, Loader2, Lock, Search, Briefcase, X, Hash,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, FileText,
} from 'lucide-react';
import { aiAPI, savedAPI } from '../services/api';
import { AICreditsBar } from '../components/AICreditsBar';
import { useUserPlan } from '../hooks/useUserPlan';
import { usePlans } from '../hooks/usePlans';
import HowItWorks from '../components/HowItWorks';

function ProGate() {
  const { getMonthly } = usePlans();
  const proPrice = getMonthly('pro');
  const ctaText = proPrice != null ? `Upgrade to Pro - $${proPrice}/mo` : 'Upgrade to Pro';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro Feature</h2>
      <p className="text-gray-500 max-w-md mb-6">
        The Compliance Matrix checks your AI proposal against every RFP requirement, section by section.
        Available on Pro and Enterprise plans.
      </p>
      <Link to="/pricing" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
        <Sparkles className="w-4 h-4" />{ctaText}
      </Link>
    </div>
  );
}

// ── Saved Opportunity Selector (same pattern as Proposal Builder) ────────────
function OpportunitySelector({ selected, onSelect }) {
  const [saved, setSaved]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const ref = useRef(null);

  useEffect(() => {
    savedAPI.getAll()
      .then(r => setSaved(r.data?.data || r.data?.saved || []))
      .catch(() => setSaved([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = saved.filter(s => {
    const opp = s.opportunity || s;
    return opp.title?.toLowerCase().includes(search.toLowerCase()) ||
           opp.agency?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm text-left text-gray-500 hover:border-gray-300 transition-colors"
      >
        <Search className="w-4 h-4 shrink-0" />
        {selected ? <span className="text-gray-900 truncate">{selected.title}</span> : 'Search your saved contracts...'}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type to filter..."
            className="w-full px-4 py-2.5 text-sm border-b border-gray-100 focus:outline-none"
          />
          {loading ? (
            <div className="p-4 text-center"><Loader2 className="w-4 h-4 animate-spin text-gray-300 mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-xs text-gray-400 text-center">No saved contracts match.</p>
          ) : (
            filtered.map(s => {
              const opp = s.opportunity || s;
              return (
                <button
                  key={opp._id}
                  type="button"
                  onClick={() => { onSelect({ id: opp._id, title: opp.title, agency: opp.agency }); setOpen(false); setSearch(''); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{opp.title}</p>
                  {opp.agency && <p className="text-xs text-gray-400 truncate">{opp.agency}</p>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

const STATUS_META = {
  covered: { label: 'Covered', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200' },
  partial: { label: 'Partial', icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  missing: { label: 'Missing', icon: XCircle,       cls: 'bg-red-50 text-red-700 border-red-200' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.missing;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${m.cls}`}>
      <Icon className="w-3 h-3" />{m.label}
    </span>
  );
}

function CoverageRing({ pct }) {
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
  const r = 32, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{pct}%</span>
      </div>
    </div>
  );
}

export default function ComplianceMatrix() {
  const { plan: userPlan, loading: planLoading } = useUserPlan();
  const isPro = ['pro', 'enterprise'].includes(userPlan);

  const [selected, setSelected] = useState(null);
  const [manualId, setManualId] = useState('');
  const [result, setResult]     = useState(null); // { requirements, sections, mapping, overallCoveragePct, docsAnalyzed }
  const [loading, setLoading]   = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(false);
  const [error, setError]       = useState('');
  const resultRef = useRef(null);

  const opportunityId = selected?.id || manualId.trim();

  // If a matrix already exists for the selected opportunity, show it without spending credits.
  useEffect(() => {
    if (!opportunityId) { setResult(null); return; }
    setCheckingSaved(true);
    setResult(null);
    setError('');
    aiAPI.getComplianceMatrix(opportunityId)
      .then(r => setResult(r.data.data))
      .catch(() => {}) // 404 = nothing saved yet, that's fine
      .finally(() => setCheckingSaved(false));
  }, [opportunityId]);

  const handleGenerate = async () => {
    if (!opportunityId) { setError('Please select a contract or enter an opportunity ID.'); return; }
    setLoading(true); setError('');
    try {
      const res = await aiAPI.complianceMatrix(opportunityId);
      setResult(res.data.data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate compliance matrix. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (planLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  );
  if (!isPro) return <ProGate />;

  const covered = result?.mapping.filter(m => m.status === 'covered').length || 0;
  const partial = result?.mapping.filter(m => m.status === 'partial').length || 0;
  const missing = result?.mapping.filter(m => m.status === 'missing').length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <AICreditsBar feature="compliance_matrix" />

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Compliance Matrix</h1>
                <HowItWorks
                  title="Compliance Matrix"
                  steps={[
                    { title: 'Select a contract', description: 'Choose from your saved opportunities — same picker as Proposal Builder' },
                    { title: 'AI reads the real solicitation', description: 'Extracts every SHALL/MUST requirement from the SOW/PWS and attached documents' },
                    { title: 'AI writes the proposal', description: 'Same 7-section proposal Proposal Builder generates, from your real company data' },
                    { title: 'AI checks coverage, honestly', description: 'Maps every requirement to the section that addresses it — or flags it as missing' },
                  ]}
                  dataUsed={['SAM.gov (full SOW)', 'Attached RFP/PWS documents', 'Your Company Profile', 'AI-generated proposal']}
                >
                  <p className="text-sm font-semibold text-gray-700 mt-2">Why this exists:</p>
                  <ul className="text-xs text-gray-500 list-disc list-inside space-y-0.5 mt-1">
                    <li>Missing a mandatory requirement is one of the most common reasons a bid gets marked non-responsive</li>
                    <li>This checks your AI proposal against the RFP the same way an evaluator would, before you submit</li>
                    <li>A "Missing" or "Partial" row tells you exactly what to add, and where</li>
                  </ul>
                </HowItWorks>
              </div>
              <p className="text-sm text-gray-500">Every RFP requirement, checked against your proposal — covered, partial, or missing</p>
            </div>
          </div>
        </div>

        {/* Contract selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Select a Contract</p>
              <p className="text-xs text-gray-400 mt-0.5">Choose the federal contract to check compliance for</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">From your saved contracts</label>
            <OpportunitySelector selected={selected} onSelect={opp => { setSelected(opp); setManualId(''); }} />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or paste an ID manually</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5 font-medium">
              <Hash className="w-3.5 h-3.5" />Opportunity ID
            </label>
            <input
              type="text"
              value={selected ? '' : manualId}
              onChange={e => { setManualId(e.target.value); setSelected(null); }}
              placeholder="e.g. 64f1a2b3c4d5e6f7a8b9c0d1"
              disabled={!!selected}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {selected && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-indigo-900 truncate">{selected.title}</p>
                {selected.agency && <p className="text-xs text-indigo-600 mt-0.5">{selected.agency}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-indigo-300 hover:text-indigo-500 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !opportunityId}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Writing proposal &amp; checking compliance... this can take a minute</>
              : result
                ? <><RefreshCw className="w-4 h-4" />Regenerate Compliance Matrix</>
                : <><Sparkles className="w-4 h-4" />Generate Compliance Matrix</>}
          </button>
          {checkingSaved && !loading && (
            <p className="text-xs text-gray-400 text-center mt-2">Checking for a saved matrix...</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div ref={resultRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-gray-100">
              <CoverageRing pct={result.overallCoveragePct} />
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-semibold text-gray-900">Overall Coverage</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {result.requirements.length} requirement{result.requirements.length !== 1 ? 's' : ''} checked against {result.sections.length} proposal sections
                  {result.docsAnalyzed > 0 && ` · ${result.docsAnalyzed} document${result.docsAnalyzed !== 1 ? 's' : ''} read`}
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700"><CheckCircle2 className="w-3.5 h-3.5" />{covered} covered</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700"><AlertTriangle className="w-3.5 h-3.5" />{partial} partial</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700"><XCircle className="w-3.5 h-3.5" />{missing} missing</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 pr-4 font-semibold">#</th>
                    <th className="pb-2 pr-4 font-semibold">Requirement</th>
                    <th className="pb-2 pr-4 font-semibold">Category</th>
                    <th className="pb-2 pr-4 font-semibold">Status</th>
                    <th className="pb-2 pr-4 font-semibold">Addressed In</th>
                    <th className="pb-2 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {result.mapping.map((m, i) => {
                    const req = result.requirements[m.requirementIndex];
                    if (!req) return null;
                    return (
                      <tr key={i} className="border-b border-gray-50 align-top">
                        <td className="py-3 pr-4 text-gray-400">{m.requirementIndex + 1}</td>
                        <td className="py-3 pr-4 max-w-md">
                          <p className="text-gray-900">{req.text}</p>
                          {req.mandatory && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">Mandatory</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{req.category}</td>
                        <td className="py-3 pr-4"><StatusBadge status={m.status} /></td>
                        <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                          {m.sectionTitle ? (
                            <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3 text-gray-300" />{m.sectionTitle}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-3 text-gray-500 max-w-xs">{m.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
