import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const STATUS_URL = BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) + '/api/status' : `${BASE_URL}/status`;

const STATUS_META = {
  operational: { label: 'Operational',        color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  Icon: CheckCircle },
  degraded:    { label: 'Degraded Performance', color: 'text-amber-600', bg: 'bg-amber-50',  border: 'border-amber-200', Icon: AlertTriangle },
  down:        { label: 'Down',                color: 'text-red-600',   bg: 'bg-red-50',    border: 'border-red-200',   Icon: XCircle },
};

const OVERALL_META = {
  operational: { label: 'All Systems Operational',     color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  degraded:    { label: 'Some Systems Degraded',        color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  down:        { label: 'Service Disruption',           color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
};

export default function Status() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(STATUS_URL);
      const json = await res.json();
      setData(json);
      setError('');
    } catch (e) {
      setError('Could not reach the status endpoint.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [load]);

  const overall = OVERALL_META[data?.overall] || OVERALL_META.operational;

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <SEOHead
        title="System Status | Sambid"
        description="Live status of Sambid's website, database, and SAM.gov data sync."
        canonical="https://sambid.co/status"
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Sambid
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Live status, checked in real time - refreshes automatically every 30 seconds.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : error ? (
          <div className={`flex items-center gap-2 p-4 rounded-xl border ${OVERALL_META.down.bg} ${OVERALL_META.down.border} ${OVERALL_META.down.color} text-sm font-medium`}>
            <XCircle className="w-5 h-5 shrink-0" /> {error} - the website itself may be reachable while the status API is not.
          </div>
        ) : (
          <>
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${overall.bg} ${overall.border} mb-6`}>
              <span className={`w-2.5 h-2.5 rounded-full ${data.overall === 'operational' ? 'bg-green-500 animate-pulse' : data.overall === 'degraded' ? 'bg-amber-500' : 'bg-red-500'}`} />
              <p className={`font-semibold ${overall.color}`}>{overall.label}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {data.checks?.map((c, i) => {
                const meta = STATUS_META[c.status] || STATUS_META.operational;
                const Icon = meta.Icon;
                return (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.detail}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                      <Icon className="w-3.5 h-3.5" /> {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Last checked: {new Date(data.checkedAt).toLocaleTimeString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
