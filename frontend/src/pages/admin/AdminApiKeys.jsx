import { useState, useEffect, useCallback } from 'react';
import { Key, Loader2, CheckCircle, AlertCircle, ShieldOff } from 'lucide-react';
import { adminPanelAPI } from '../../services/adminApi';

export default function AdminApiKeys() {
  const [keys,    setKeys]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [busyId,  setBusyId]  = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminPanelAPI.getApiKeys();
      setKeys(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load API keys.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async (userId, email) => {
    setBusyId(userId);
    try {
      await adminPanelAPI.revokeApiKey(userId);
      showToast(`API key revoked for ${email}.`);
      setConfirmId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to revoke key.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Key className="w-6 h-6 text-indigo-600" />
          Public API Keys
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Customers on Pro or Enterprise who have generated a key for /api/v1 access. The actual key is never
          stored or shown here — only the prefix the user already saw once themselves.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-16">
            <Key className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No customer has generated an API key yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Key</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Usage Today</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {keys.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{k.name}</p>
                      <p className="text-xs text-gray-400">{k.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize">{k.plan}</span>
                    </td>
                    <td className="px-5 py-3">
                      <code className="text-xs font-mono text-gray-600">{k.keyPrefix}</code>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {k.usedToday} <span className="text-gray-400">/ {k.dailyLimit === -1 ? 'Unlimited' : k.dailyLimit}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {confirmId === k.id ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleRevoke(k.id, k.email)}
                            disabled={busyId === k.id}
                            className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {busyId === k.id ? 'Revoking…' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(k.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ShieldOff className="w-3.5 h-3.5" /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
