// Aggregate "Send History" for Prospect Outreach - every email ever sent,
// across every company, newest first, with Total/Delivered/Opened/Failed/Rate
// stats. Mirrors the campaign Send History panel's look and feel.
import { useState, useEffect, useCallback } from 'react';
import { History, RefreshCw, Loader2, Eye, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { adminProspectAPI } from '../../services/adminApi';

const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = d => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export default function ProspectEmailHistoryPanel() {
  const [rows, setRows]     = useState([]);
  const [stats, setStats]   = useState({ total: 0, delivered: 0, opened: 0, failed: 0, rate: 0 });
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await adminProspectAPI.getAllEmailHistory({ page: p, limit: 25 });
      if (data.success) {
        setRows(data.data || []);
        setStats(data.stats || {});
        setPage(data.page || 1);
        setPages(data.pages || 1);
      }
    } catch { /* keep previous rows on failure */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold text-gray-900 text-sm">Send History</h3>
          {stats.total > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              {stats.total} total
            </span>
          )}
        </div>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stat tiles */}
      {stats.total > 0 && (
        <div className="grid grid-cols-5 gap-3 px-6 pt-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900' },
            { label: 'Delivered', value: stats.delivered, color: 'text-green-600' },
            { label: 'Opened', value: stats.opened, color: 'text-indigo-600' },
            { label: 'Failed', value: stats.failed, color: 'text-red-600' },
            { label: 'Rate', value: `${stats.rate}%`, color: 'text-indigo-600' },
          ].map(t => (
            <div key={t.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${t.color}`}>{t.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{t.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
            <Mail className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium">No outreach emails sent yet</p>
          <p className="text-xs text-gray-400 mt-1">Sent emails will appear here, across every company</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-50 mt-4">
            {rows.map((r, i) => {
              const isOpen = expanded === i;
              return (
                <div key={i} className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${r.openedAt ? 'bg-indigo-500' : 'bg-green-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.subject}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">{r.companyName}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{r.email}</span>
                        {r.templateName && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.templateName}</span>
                        )}
                        {r.openedAt ? (
                          <span className="inline-flex items-center gap-1 text-xs text-indigo-600"><Eye className="w-3 h-3" /> Opened{r.openCount > 1 ? ` (${r.openCount}x)` : ''}</span>
                        ) : (
                          <span className="text-xs text-amber-600">Not opened yet</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">{fmtDate(r.sentAt)}</p>
                      <p className="text-xs text-gray-400">{fmtTime(r.sentAt)}</p>
                    </div>
                    <button onClick={() => setExpanded(isOpen ? null : i)} className="text-gray-400 hover:text-indigo-600 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="mt-3 ml-5 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                      <p><span className="text-gray-400">Sent by:</span> {r.sentBy || 'admin'}</p>
                      <p><span className="text-gray-400">Template:</span> {r.templateId || 'custom'}</p>
                      {r.openedAt && <p><span className="text-gray-400">First opened:</span> {fmtDate(r.openedAt)} {fmtTime(r.openedAt)}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-gray-100">
              <button disabled={page <= 1} onClick={() => load(page - 1)}
                className="text-xs text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
              <span className="text-xs text-gray-400">Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => load(page + 1)}
                className="text-xs text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
