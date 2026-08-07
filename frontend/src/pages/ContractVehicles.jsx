import { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, CheckCircle, Calendar, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
import { contractVehicleAPI } from '../services/api';
import { useUserPlan } from '../hooks/useUserPlan';
import PlanGate from '../components/PlanGate';
import HowItWorks from '../components/HowItWorks';

const CERTS = ['8(a)', 'WOSB', 'HUBZone', 'SDVOSB', 'VOSB', 'Small Business', 'MBE'];
const TYPES = ['GWAC', 'IDIQ', 'BPA', 'GSA Schedule', 'Other'];
const ON_RAMP_OPTIONS = [
  { value: 'unknown', label: 'Unknown / not researched' },
  { value: 'open',    label: 'Open now' },
  { value: 'closed',  label: 'Closed' },
  { value: 'upcoming', label: 'Upcoming window' },
];

const COMMON_VEHICLES = [
  { name: 'GSA Multiple Award Schedule (MAS)', acronym: 'GSA MAS', agency: 'GSA', type: 'GSA Schedule' },
  { name: 'SEWP V', acronym: 'SEWP V', agency: 'NASA', type: 'GWAC' },
  { name: 'CIO-SP3', acronym: 'CIO-SP3', agency: 'NIH', type: 'GWAC' },
  { name: 'Alliant 2 SB', acronym: 'Alliant 2 SB', agency: 'GSA', type: 'GWAC' },
  { name: '8(a) STARS III', acronym: 'STARS III', agency: 'GSA', type: 'GWAC' },
  { name: 'VETS 2', acronym: 'VETS 2', agency: 'GSA', type: 'GWAC' },
  { name: 'OASIS+', acronym: 'OASIS+', agency: 'GSA', type: 'GWAC' },
  { name: 'DISA SITE III', acronym: 'SITE III', agency: 'DISA', type: 'IDIQ' },
  { name: 'Army ITES-3S', acronym: 'ITES-3S', agency: 'Army', type: 'IDIQ' },
  { name: 'NITAAC CIO-CS', acronym: 'CIO-CS', agency: 'NIH', type: 'GWAC' },
];

const EMPTY_FORM = { name: '', acronym: '', agency: '', type: 'Other', onRampStatus: 'unknown', ceilingValue: '', eligibleNaicsCodes: '', expiryDate: '', notes: '' };

export default function ContractVehicles() {
  const { plan: userPlan } = useUserPlan();
  const [vehicles,  setVehicles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [newV, setNewV] = useState(EMPTY_FORM);
  const [newCerts, setNewCerts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await contractVehicleAPI.getAll();
      setVehicles(res.data.data || []);
    } catch (err) {
      setError('Failed to load your contract vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleNewCert = (c) => setNewCerts(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]);

  const addVehicle = async (overrides = {}) => {
    const payload = { ...newV, ...overrides };
    if (!payload.name?.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await contractVehicleAPI.create({
        name: payload.name.trim(),
        acronym: payload.acronym || '',
        agency: payload.agency || '',
        type: payload.type || 'Other',
        onRampStatus: payload.onRampStatus || 'unknown',
        ceilingValue: payload.ceilingValue ? Number(payload.ceilingValue) : null,
        eligibleNaicsCodes: (payload.eligibleNaicsCodes || '').split(',').map(s => s.trim()).filter(Boolean),
        eligibleSetAsides: overrides.eligibleSetAsides || newCerts,
        expiryDate: payload.expiryDate || null,
        notes: payload.notes || '',
      });
      setVehicles(v => [res.data.data, ...v]);
      setNewV(EMPTY_FORM);
      setNewCerts([]);
      setShowAdd(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle.');
    } finally {
      setSaving(false);
    }
  };

  const addCommon = (v) => {
    if (vehicles.find(x => x.name === v.name)) return;
    addVehicle({ name: v.name, acronym: v.acronym, agency: v.agency, type: v.type, eligibleNaicsCodes: '', eligibleSetAsides: [] });
  };

  const remove = async (id) => {
    setVehicles(v => v.filter(x => x._id !== id)); // optimistic
    try {
      await contractVehicleAPI.remove(id);
    } catch (err) {
      load(); // roll back on failure
    }
  };

  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
  };

  const expiryStatus = (days) => {
    if (days === null) return null;
    if (days < 0)   return { label: 'Expired', color: 'text-red-600 bg-red-50' };
    if (days <= 30) return { label: `${days}d left`, color: 'text-red-600 bg-red-50' };
    if (days <= 90) return { label: `${days}d left`, color: 'text-yellow-600 bg-yellow-50' };
    return { label: `${days}d left`, color: 'text-green-600 bg-green-50' };
  };

  const eligibilityBadge = (eligible) => {
    if (eligible === true)  return { label: 'You likely qualify', color: 'text-green-700 bg-green-50 border-green-200', Icon: CheckCircle };
    if (eligible === false) return { label: 'May not qualify yet', color: 'text-amber-700 bg-amber-50 border-amber-200', Icon: AlertTriangle };
    return { label: 'Add eligibility info to check', color: 'text-gray-500 bg-gray-50 border-gray-200', Icon: HelpCircle };
  };

  if (!['starter', 'pro', 'enterprise'].includes(userPlan)) {
    return <PlanGate requiredPlan="starter"
      featureName="Contract Vehicles Tracker"
      description="Track your GSA schedules, GWAC vehicles, and IDIQ contracts with expiry alerts and real eligibility matching. Available on Starter, Pro, and Enterprise plans." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Contract Vehicle Tracker
                <HowItWorks title="Contract Vehicles" steps={[
                  { title: 'Track your vehicles', description: 'Add GSA MAS, SEWP V, OASIS+, 8(a) STARS III, and any other contract vehicles your company holds or is pursuing' },
                  { title: 'Expiry alerts', description: 'Color-coded warnings: Red (<30 days), Yellow (30-90 days), Green (>90 days) - never let a vehicle expire' },
                  { title: 'Eligibility matching', description: 'Enter the NAICS codes and certifications a vehicle requires, and it checks that against your real Company Profile automatically' },
                ]} dataUsed={['Your Vehicles', 'Your NAICS Codes', 'Your Certifications']} >
                  <p className="text-sm font-semibold text-gray-700 mt-2">Why this matters:</p>
                  <ul className="text-xs text-gray-500 list-disc list-inside space-y-0.5 mt-1">
                    <li>Many contracts require you to be on a specific vehicle to bid</li>
                    <li>On-ramp windows for GWACs/IDIQs open once every several years - miss one, wait years for the next</li>
                    <li>An expired vehicle means you lose access to thousands of opportunities</li>
                  </ul>
                </HowItWorks>
              </h1>
              <p className="text-gray-500 text-sm">Track your GWACs, IDIQs, and GSA schedules. Get expiry alerts and eligibility checks.</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        {/* Common Vehicles Quick Add */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Quick Add - Common Contract Vehicles</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_VEHICLES.map(v => {
              const already = vehicles.find(x => x.name === v.name);
              return (
                <button key={v.name} onClick={() => addCommon(v)} disabled={!!already || saving}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${already ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-600'}`}>
                  {already && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {v.acronym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-white rounded-2xl border border-orange-200 p-5 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Add Custom Contract Vehicle</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Vehicle Name *</label>
                <input value={newV.name} onChange={e => setNewV(v => ({...v, name: e.target.value}))}
                  placeholder="e.g. GSA MAS IT 70" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Acronym</label>
                <input value={newV.acronym} onChange={e => setNewV(v => ({...v, acronym: e.target.value}))}
                  placeholder="e.g. GSA MAS" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Issuing Agency</label>
                <input value={newV.agency} onChange={e => setNewV(v => ({...v, agency: e.target.value}))}
                  placeholder="e.g. GSA, NASA, NIH" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Contract Expiry Date</label>
                <input type="date" value={newV.expiryDate} onChange={e => setNewV(v => ({...v, expiryDate: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select value={newV.type} onChange={e => setNewV(v => ({...v, type: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">On-Ramp Status</label>
                <select value={newV.onRampStatus} onChange={e => setNewV(v => ({...v, onRampStatus: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                  {ON_RAMP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ceiling Value ($)</label>
                <input type="number" value={newV.ceilingValue} onChange={e => setNewV(v => ({...v, ceilingValue: e.target.value}))}
                  placeholder="e.g. 50000000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Eligible NAICS Codes</label>
                <input value={newV.eligibleNaicsCodes} onChange={e => setNewV(v => ({...v, eligibleNaicsCodes: e.target.value}))}
                  placeholder="e.g. 541511, 541512" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1.5 block">Eligible Set-Asides (what this vehicle requires - checked against your active certifications)</label>
              <div className="flex flex-wrap gap-2">
                {CERTS.map(c => (
                  <button key={c} type="button" onClick={() => toggleNewCert(c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${newCerts.includes(c) ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:border-orange-400'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={newV.notes} onChange={e => setNewV(v => ({...v, notes: e.target.value}))} rows={2}
              placeholder="Contract number, special notes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-3" />
            <div className="flex gap-2">
              <button onClick={() => addVehicle()} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Vehicle
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        )}

        {/* Vehicle List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No contract vehicles added yet</p>
            <p className="text-sm">Add the GWACs and IDIQs your company is on to track expiry dates and get alerts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map(v => {
              const days = daysUntil(v.expiryDate);
              const status = expiryStatus(days);
              const elig = eligibilityBadge(v.eligible);
              const EligIcon = elig.Icon;
              return (
                <div key={v._id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{v.name}</p>
                        {v.agency && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{v.agency}</span>}
                        {v.type && v.type !== 'Other' && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded">{v.type}</span>}
                        {status && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                            {days < 0 ? <AlertTriangle className="w-3 h-3 inline mr-0.5" /> : <Calendar className="w-3 h-3 inline mr-0.5" />}
                            {status.label}
                          </span>
                        )}
                      </div>
                      {v.ceilingValue > 0 && <p className="text-xs text-gray-400 mt-0.5">Ceiling: ${v.ceilingValue.toLocaleString()}</p>}
                      {v.expiryDate && <p className="text-xs text-gray-400 mt-0.5">Expires: {new Date(v.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                      {v.notes && <p className="text-xs text-gray-500 mt-1">{v.notes}</p>}
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border mt-2 ${elig.color}`}>
                        <EligIcon className="w-3 h-3" /> {elig.label}
                      </span>
                    </div>
                    <button onClick={() => remove(v._id)} className="text-gray-300 hover:text-red-400 transition shrink-0 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
