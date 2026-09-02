import { useState, useEffect, useCallback } from 'react';
import { Globe, Eye, Users, Clock, Monitor, Smartphone, Tablet, Loader2, AlertCircle } from 'lucide-react';
import { adminPanelAPI } from '../../services/adminApi';

const RANGES = [
  { id: '7d',  label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
];

const DEVICE_META = {
  desktop: { label: 'Desktop', icon: Monitor,    color: 'bg-indigo-500' },
  mobile:  { label: 'Mobile',  icon: Smartphone,  color: 'bg-emerald-500' },
  tablet:  { label: 'Tablet',  icon: Tablet,      color: 'bg-amber-500' },
  unknown: { label: 'Unknown', icon: Globe,       color: 'bg-gray-400' },
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function fmtDuration(sec) {
  if (!sec) return '0s';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function AdminTrafficAnalytics() {
  const [range,   setRange]   = useState('30d');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminPanelAPI.getTrafficAnalytics(range);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load traffic analytics.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const maxDailyViews = data?.daily?.length ? Math.max(...data.daily.map(d => d.views), 1) : 1;
  const maxPageViews   = data?.topPages?.length ? Math.max(...data.topPages.map(p => p.views), 1) : 1;
  const maxCountryViews = data?.topCountries?.length ? Math.max(...data.topCountries.map(c => c.views), 1) : 1;
  const totalDeviceViews = data?.devices?.reduce((s, d) => s + d.views, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-600" /> Website Traffic
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Anonymous visitor tracking - pages, devices, countries, and time on site. Admin panel usage is excluded.
          </p>
        </div>
        <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1 self-start">
          {RANGES.map(r => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                range === r.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : data && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Eye}   label="Total Page Views"  value={data.totalViews.toLocaleString()}     color="text-indigo-500" />
            <StatCard icon={Users} label="Unique Visitors"   value={data.uniqueVisitors.toLocaleString()} color="text-emerald-500" />
            <StatCard icon={Clock} label="Avg. Time on Page" value={fmtDuration(data.avgDurationSeconds)} color="text-amber-500" />
          </div>

          {/* Daily views chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-5 text-sm">Page Views Over Time</h3>
            {data.daily.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No traffic recorded yet in this range.</p>
            ) : (
              <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-1">
                {data.daily.map(d => (
                  <div key={d.date} className="flex-1 min-w-[6px] flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-indigo-500 rounded-t opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ height: `${(d.views / maxDailyViews) * 130 + 4}px` }}
                      title={`${d.date}: ${d.views} views, ${d.visitors} visitors`}
                    />
                  </div>
                ))}
              </div>
            )}
            {data.daily.length > 0 && (
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{data.daily[0].date}</span>
                <span>{data.daily[data.daily.length - 1].date}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top pages */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Top Pages</h3>
              {data.topPages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No page views yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topPages.map(p => (
                    <div key={p.path}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <code className="text-gray-700 font-mono truncate max-w-[70%]">{p.path}</code>
                        <span className="text-gray-400 font-medium">{p.views.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(p.views / maxPageViews) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top countries */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Top Countries</h3>
              {data.topCountries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No location data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topCountries.map(c => (
                    <div key={c.code}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-700 font-medium">{c.name}</span>
                        <span className="text-gray-400 font-medium">{c.views.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(c.views / maxCountryViews) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Devices */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Devices</h3>
              <div className="space-y-3">
                {(data.devices.length ? data.devices : [{ device: 'unknown', views: 0 }]).map(d => {
                  const meta = DEVICE_META[d.device] || DEVICE_META.unknown;
                  const Icon = meta.icon;
                  const pct = Math.round((d.views / totalDeviceViews) * 100);
                  return (
                    <div key={d.device} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-600 w-16 shrink-0">{meta.label}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${meta.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Browsers */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Browsers</h3>
              {data.browsers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No browser data yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.browsers.map(b => (
                    <div key={b.browser} className="flex items-center justify-between text-xs py-1">
                      <span className="text-gray-700">{b.browser}</span>
                      <span className="text-gray-400 font-medium">{b.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
