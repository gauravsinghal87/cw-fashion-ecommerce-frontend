import { useState, useEffect } from 'react';
import { get, put, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const AdminReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [settings, setSettings] = useState({ referrerReward: 100, referredReward: 50, minOrderAmount: 0, rewardDelayDays: 7, isEnabled: true });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [fraudFilter, setFraudFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [reverseModal, setReverseModal] = useState(null);

  const load = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (fraudFilter) params.isFraud = fraudFilter;
      const [refRes, setRes, repRes] = await Promise.all([
        get(API.ADMIN.REFERRALS_LIST, params),
        get(API.ADMIN.REFERRAL_SETTINGS),
        get(API.ADMIN.REPORTS_REFERRALS).catch(() => ({ data: { report: { daily: [], totals: { total: 0, completed: 0, totalPayout: 0 } } } })),
      ]);
      setReferrals(refRes.data.referrals || []);
      setPagination(refRes.data.pagination);
      const s = setRes.data.settings || {};
      setSettings({ referrerReward: s.referrerReward || 100, referredReward: s.referredReward || 50, minOrderAmount: s.minOrderAmount || 0, rewardDelayDays: s.rewardDelayDays || 7, isEnabled: s.isEnabled !== false });
      setReport(repRes.data.report);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [statusFilter, fraudFilter]);

  const flagFraud = async (id) => {
    try { await put(API.ADMIN.REFERRAL_FLAG_FRAUD(id)); toast.success('Fraud flag toggled'); load(page); } catch { toast.error('Failed'); }
  };

  const updateSettings = async () => {
    try {
      await put(API.ADMIN.REFERRAL_SETTINGS, {
        referrerReward: Number(settings.referrerReward),
        referredReward: Number(settings.referredReward),
        minOrderAmount: Number(settings.minOrderAmount),
        rewardDelayDays: Number(settings.rewardDelayDays),
        isEnabled: settings.isEnabled,
      });
      toast.success('Settings updated');
    } catch { toast.error('Failed'); }
  };

  const releaseRewards = async () => {
    try {
      const { data } = await post(API.REFERRALS.RELEASE);
      const msg = data.skipped > 0 ? `${data.message} (${data.skipped} skipped — missing wallets, users, or already rewarded)` : data.message;
      toast.success(msg);
      load(page);
    } catch { toast.error('Failed to release rewards'); }
  };

  const reverseReward = async (id) => {
    try {
      await put(API.ADMIN.REFERRAL_REVERSE(id), { reason: reverseModal?.reason || '' });
      toast.success('Reward reversed');
      setReverseModal(null);
      load(page);
    } catch { toast.error('Failed to reverse'); }
  };

  if (loading && !referrals.length) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div><h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Referrals</h1><p className="text-xs text-gray-500 mt-0.5">{pagination?.total || 0} total</p></div>
      </div>

      {/* Analytics */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card-luxe p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-semibold">{report.totals.total}</p>
            <p className="text-xs text-gray-500">Total Referrals</p>
          </div>
          <div className="card-luxe p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-semibold">{report.totals.completed}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="card-luxe p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-semibold">₹{report.totals.totalPayout}</p>
            <p className="text-xs text-gray-500">Total Payout</p>
          </div>
          <div className="card-luxe p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-semibold">{pagination?.total - report.totals.completed}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="card-luxe p-4 mb-6">
        <h2 className="font-medium text-sm mb-3">Reward Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          <div><label className="block text-xs text-gray-600 mb-1">Referrer Reward (₹)</label><input type="number" value={settings.referrerReward} onChange={(e) => setSettings({ ...settings, referrerReward: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Referred Reward (₹)</label><input type="number" value={settings.referredReward} onChange={(e) => setSettings({ ...settings, referredReward: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Min Order (₹)</label><input type="number" value={settings.minOrderAmount} onChange={(e) => setSettings({ ...settings, minOrderAmount: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Reward Delay (Days)</label><input type="number" value={settings.rewardDelayDays} onChange={(e) => setSettings({ ...settings, rewardDelayDays: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input type="checkbox" checked={settings.isEnabled} onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })} className="w-4 h-4" />
              <span className="text-xs text-gray-600">Enabled</span>
            </label>
            <button onClick={updateSettings} className="btn-primary text-sm px-4 py-2 min-h-[44px]">Save</button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-luxe text-sm min-h-[44px]">
          <option value="">All Status</option>
          <option value="pending">Pending</option><option value="completed">Completed</option><option value="rejected">Rejected</option>
        </select>
        <select value={fraudFilter} onChange={(e) => setFraudFilter(e.target.value)} className="input-luxe text-sm min-h-[44px]">
          <option value="">All</option><option value="true">Fraud Flagged</option><option value="false">Clean</option>
        </select>
        <button onClick={releaseRewards} className="btn-primary text-xs px-4 py-2 min-h-[44px]">Release Rewards</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-border">
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Referrer</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Referred</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden md:table-cell">Reward</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden lg:table-cell">Order</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Fraud</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r._id} className={`border-b border-border/50 hover:bg-gray-50/50 ${r.isFraud ? 'bg-danger/5' : ''}`}>
                <td className="py-3 px-2 text-sm">{r.referrer?.name || '—'}</td>
                <td className="py-3 px-2 text-sm">{r.referred?.name || '—'}</td>
                <td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 ${r.status === 'completed' ? 'bg-success/10 text-success' : r.status === 'rejected' ? 'bg-danger/10 text-danger' : 'bg-amber-50 text-amber-700'}`}>{r.status}</span></td>
                <td className="py-3 px-2 hidden md:table-cell text-xs">₹{(r.rewardReferrer || 0) + (r.rewardReferred || 0)}</td>
                <td className="py-3 px-2 hidden lg:table-cell text-xs text-gray-500">{r.orderAmount ? `₹${r.orderAmount}` : '—'}</td>
                <td className="py-3 px-2">{r.isFraud ? <span className="text-xs text-danger font-medium">Flagged</span> : <span className="text-xs text-gray-400">—</span>}</td>
                <td className="py-3 px-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => flagFraud(r._id)} className={`text-xs hover:underline min-h-[36px] ${r.isFraud ? 'text-gray-500' : 'text-danger'}`}>{r.isFraud ? 'Clear' : 'Flag'}</button>
                    {r.status === 'completed' && (
                      <button onClick={() => setReverseModal({ id: r._id, name: r.referred?.name || 'User' })} className="text-xs text-danger hover:underline min-h-[36px]">Reverse</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!referrals.length && <p className="text-center text-gray-500 py-12 text-sm">No referrals found</p>}
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}

      {/* Reverse Modal */}
      {reverseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setReverseModal(null)}>
          <div className="bg-white p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-display font-bold mb-2">Reverse Reward</h3>
            <p className="text-sm text-gray-500 mb-4">Reverse reward for referral of <strong>{reverseModal.name}</strong>? This will deduct the reward amount from both wallets.</p>
            <input type="text" placeholder="Reason for reversal" className="input-luxe w-full text-sm mb-4 min-h-[44px]" onChange={e => setReverseModal({ ...reverseModal, reason: e.target.value })} />
            <div className="flex gap-3">
              <button onClick={() => reverseReward(reverseModal.id)} className="flex-1 bg-danger text-white py-2.5 text-sm font-medium min-h-[44px]">Reverse Reward</button>
              <button onClick={() => setReverseModal(null)} className="flex-1 border py-2.5 text-sm font-medium min-h-[44px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminReferrals;
