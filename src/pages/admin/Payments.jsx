import { useState, useEffect } from 'react';
import { get, put, post as apiPost } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice, formatDate } from '../../utils/helpers';

const Payments = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [settlements, setSettlements] = useState([]);
  const [settlePage, setSettlePage] = useState(1);
  const [settlePagination, setSettlePagination] = useState(null);
  const [releasing, setReleasing] = useState(false);

  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [withdrawPagination, setWithdrawPagination] = useState(null);
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { if (tab === 'settlements') loadSettlements(1); }, [tab]);
  useEffect(() => { if (tab === 'settlements') loadSettlements(); }, [settlePage]);
  useEffect(() => { if (tab === 'withdrawals') loadWithdrawals(1); }, [tab, withdrawStatusFilter]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await get(API.ADMIN.DASHBOARD);
      setDashboard(data);
    } catch { toast.error('Failed to load payment data'); }
    finally { setLoading(false); }
  };

  const loadSettlements = async (p) => {
    setLoading(true);
    try {
      const { data } = await get(`${API.ADMIN.SETTLEMENTS}?page=${p || settlePage}&limit=20`);
      setSettlements(data.settlements || []);
      setSettlePagination(data.pagination);
    } catch { toast.error('Failed to load settlements'); }
    finally { setLoading(false); }
  };

  const loadWithdrawals = async (p) => {
    try {
      const params = { page: p || withdrawPage, limit: 20 };
      if (withdrawStatusFilter) params.status = withdrawStatusFilter;
      const { data } = await get(API.ADMIN.WITHDRAWALS, params);
      setWithdrawals(data.withdrawals || []);
      setWithdrawPagination(data.pagination);
    } catch { toast.error('Failed to load withdrawals'); }
  };

  const releaseSettlements = async () => {
    setReleasing(true);
    try {
      const { data } = await apiPost(API.ADMIN.SETTLEMENTS_RELEASE);
      toast.success(data.message);
      setSettlePage(1); loadSettlements(1);
    } catch { toast.error('Release failed'); }
    finally { setReleasing(false); }
  };

  const handleWithdrawal = async (action) => {
    try {
      await put(API.ADMIN.WITHDRAWAL_ACTION(actionModal.id, action), { reason: actionModal.reason || '' });
      toast.success('Withdrawal ' + (action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'held'));
      setActionModal(null);
      loadWithdrawals(withdrawPage);
    } catch { toast.error('Failed'); }
  };

  const statusColor = (s) => {
    const map = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-blue-50 text-blue-700', rejected: 'bg-danger/10 text-danger', completed: 'bg-success/10 text-success', cancelled: 'bg-gray-100 text-gray-500' };
    return map[s] || 'bg-gray-100';
  };

  if (loading && !settlements.length && !dashboard) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  const d = dashboard?.dashboard || dashboard || {};
  const totalRevenue = d.totalRevenue || 0;
  const totalOrders = d.totalOrders || 0;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Payments</h1>
        <button onClick={releaseSettlements} disabled={releasing} className="btn-primary text-xs px-4 py-2 min-h-[44px]">
          {releasing ? 'Releasing...' : 'Release Settlements'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card-luxe p-3"><p className="text-lg font-bold">{formatPrice(totalRevenue)}</p><p className="text-xs text-gray-500">Total Revenue</p></div>
        <div className="card-luxe p-3"><p className="text-lg font-bold">{totalOrders}</p><p className="text-xs text-gray-500">Total Orders</p></div>
        <div className="card-luxe p-3"><p className="text-lg font-bold text-green-600">{d.totalCommission ? formatPrice(d.totalCommission) : '\u2014'}</p><p className="text-xs text-gray-500">Commission</p></div>
        <div className="card-luxe p-3"><p className="text-lg font-bold text-orange-600">{d.pendingWithdrawals || 0}</p><p className="text-xs text-gray-500">Pending Withdrawals</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-border">
        {['overview', 'settlements', 'withdrawals'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm border-b-2 min-h-[44px] ${tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-gray-500'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'settlements' && (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-border">
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Order</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Item</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Vendor</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right">Amount</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right">Commission</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Status</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Date</th>
              </tr></thead>
              <tbody>
                {settlements.map(s => (
                  <tr key={s._id} className="border-b border-border/50">
                    <td className="py-3 px-2 text-xs font-mono">{s.order?.orderNumber?.slice(-8) || '\u2014'}</td>
                    <td className="py-3 px-2 text-xs">{s.itemName}</td>
                    <td className="py-3 px-2 text-xs">{s.vendor?.storeName || '\u2014'}</td>
                    <td className="py-3 px-2 text-xs text-right">{formatPrice(s.finalPrice)}</td>
                    <td className="py-3 px-2 text-xs text-right text-orange-600">{formatPrice(s.commissionAmount)}</td>
                    <td className="py-3 px-2"><span className={`text-xs px-1.5 py-0.5 ${s.status === 'released' ? 'text-green-600 bg-green-50' : s.status === 'pending' ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'}`}>{s.status}</span></td>
                    <td className="py-3 px-2 text-xs text-gray-500">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!settlements.length && <p className="text-center text-gray-500 py-8 text-sm">No settlements</p>}
          </div>
          {settlePagination?.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={settlePage <= 1} onClick={() => setSettlePage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{settlePage} / {settlePagination.totalPages}</span>
              <button disabled={settlePage >= settlePagination.totalPages} onClick={() => setSettlePage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
            </div>
          )}
        </div>
      )}

      {tab === 'withdrawals' && (
        <div>
          <div className="flex gap-3 mb-4">
            <select value={withdrawStatusFilter} onChange={(e) => setWithdrawStatusFilter(e.target.value)} className="input-luxe text-sm min-h-[44px]">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-border">
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Vendor</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right">Amount</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 hidden md:table-cell">Method</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Status</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 hidden lg:table-cell">Date</th>
                <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w._id} className="border-b border-border/50 hover:bg-gray-50/50">
                    <td className="py-3 px-2"><p className="text-sm font-medium">{w.vendor?.storeName || '\u2014'}</p></td>
                    <td className="py-3 px-2 text-right font-medium">{'\u20B9'}{w.amount?.toLocaleString()}</td>
                    <td className="py-3 px-2 hidden md:table-cell text-xs">{w.paymentMethod === 'upi' ? 'UPI' : w.paymentMethod || '\u2014'}</td>
                    <td className="py-3 px-2"><span className={'text-xs px-2 py-0.5 ' + statusColor(w.status)}>{w.status}</span></td>
                    <td className="py-3 px-2 hidden lg:table-cell text-xs text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex gap-1 justify-end flex-wrap text-xs">
                        <button onClick={() => setDetail(w)} className="text-primary hover:underline min-h-[36px]">View</button>
                        {w.status === 'pending' && <><button onClick={() => setActionModal({ id: w._id, action: 'approve' })} className="text-success hover:underline min-h-[36px]">Approve</button><button onClick={() => setActionModal({ id: w._id, action: 'reject' })} className="text-danger hover:underline min-h-[36px]">Reject</button></>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!withdrawals.length && <p className="text-center text-gray-500 py-8 text-sm">No withdrawals</p>}
          </div>

          {withdrawPagination?.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={withdrawPage <= 1} onClick={() => { setWithdrawPage(p => p - 1); loadWithdrawals(withdrawPage - 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{withdrawPage} / {withdrawPagination.totalPages}</span>
              <button disabled={withdrawPage >= withdrawPagination.totalPages} onClick={() => { setWithdrawPage(p => p + 1); loadWithdrawals(withdrawPage + 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
            </div>
          )}
        </div>
      )}

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="card-luxe p-4">
            <h3 className="font-medium mb-3">Revenue Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">Total Revenue:</span> <span className="font-medium">{formatPrice(totalRevenue)}</span></div>
              <div><span className="text-gray-500">Total Commission:</span> <span className="font-medium">{formatPrice(d.totalCommission || 0)}</span></div>
              <div><span className="text-gray-500">Average Order Value:</span> <span className="font-medium">{totalOrders > 0 ? formatPrice(totalRevenue / totalOrders) : '\u2014'}</span></div>
            </div>
          </div>
          <div className="card-luxe p-4">
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTab('settlements')} className="text-xs border px-3 py-2 min-h-[36px]">View Settlements</button>
              <button onClick={() => setTab('withdrawals')} className="text-xs border px-3 py-2 min-h-[36px]">View Withdrawals</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setDetail(null)}>
          <div className="bg-white w-full max-w-lg mx-0 sm:mx-4 rounded shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold">Withdrawal Details</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none min-h-[36px] min-w-[36px]">&times;</button>
            </div>
            <div className="p-5 space-y-5 text-sm">
              {/* Vendor Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Vendor Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div><span className="text-blue-600">Store</span><p className="font-medium">{detail.vendor?.storeName || '\u2014'}</p></div>
                  <div><span className="text-blue-600">Name</span><p className="font-medium">{detail.user?.name || '\u2014'}</p></div>
                  <div><span className="text-blue-600">Email</span><p className="font-medium">{detail.user?.email || '\u2014'}</p></div>
                  <div><span className="text-blue-600">Phone</span><p className="font-medium">{detail.user?.phone || '\u2014'}</p></div>
                </div>
              </div>

              {/* Withdrawal Info Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Withdrawal Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                  <div><span className="text-gray-500">Amount</span><p className="font-semibold text-lg">{'\u20B9'}{detail.amount?.toLocaleString()}</p></div>
                  <div><span className="text-gray-500">Fee</span><p className="font-medium">{'\u20B9'}{(detail.fee || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500">Net Amount</span><p className="font-medium text-green-700">{'\u20B9'}{(detail.netAmount || detail.amount || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500">Method</span><p className="font-medium">{detail.paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'}</p></div>
                  <div><span className="text-gray-500">Status</span><p><span className={'text-xs px-2 py-0.5 font-medium ' + statusColor(detail.status)}>{detail.status}</span></p></div>
                  <div><span className="text-gray-500">Requested</span><p className="font-medium">{new Date(detail.createdAt).toLocaleDateString()}</p></div>
                </div>
                {detail.processedAt && <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">Processed: {new Date(detail.processedAt).toLocaleString()}</div>}
              </div>

              {/* Bank Account Details Card */}
              {detail.accountDetails && (detail.accountDetails.accountHolderName || detail.accountDetails.bankName || detail.accountDetails.accountNumber || detail.accountDetails.ifscCode || detail.accountDetails.upiId) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    {detail.paymentMethod === 'upi' ? 'UPI Details' : 'Bank Account Details'}
                  </h3>
                  {detail.paymentMethod === 'upi' ? (
                    <div>
                      <div><span className="text-green-700 text-xs">UPI ID</span><p className="font-mono font-medium text-base">{detail.accountDetails.upiId}</p></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      <div><span className="text-green-700">Account Holder</span><p className="font-medium">{detail.accountDetails.accountHolderName || '\u2014'}</p></div>
                      <div><span className="text-green-700">Bank Name</span><p className="font-medium">{detail.accountDetails.bankName || '\u2014'}</p></div>
                      <div><span className="text-green-700">Account Number</span><p className="font-mono font-medium text-base">{detail.accountDetails.accountNumber}</p></div>
                      <div><span className="text-green-700">IFSC Code</span><p className="font-mono font-medium">{detail.accountDetails.ifscCode || '\u2014'}</p></div>
                    </div>
                  )}
                  {detail.vendor?.bankAccount?.isVerified && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Verified Account
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Reason */}
              {detail.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-700 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    Rejection Reason
                  </h3>
                  <p className="text-red-600 text-sm">{detail.rejectionReason}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Timeline
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-500">Requested</span>
                    <span className="text-xs text-gray-400">{new Date(detail.createdAt).toLocaleString()}</span>
                  </div>
                  {detail.processedAt && (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${detail.status === 'completed' ? 'bg-green-500' : detail.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs text-gray-500">{detail.status === 'completed' ? 'Completed' : detail.status === 'rejected' ? 'Rejected' : 'Processed'}</span>
                      <span className="text-xs text-gray-400">{new Date(detail.processedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {detail.completedAt && detail.completedAt !== detail.processedAt && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-500">Completed</span>
                      <span className="text-xs text-gray-400">{new Date(detail.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setActionModal(null)}>
          <div className="bg-white w-full max-w-md mx-auto rounded shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold capitalize">{actionModal.action} Withdrawal</h2>
              <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none min-h-[36px] min-w-[36px]">&times;</button>
            </div>
            {(() => {
              const w = withdrawals.find(w => w._id === actionModal.id);
              if (!w) return null;
              return (
                <div className="p-5 space-y-4">
                  {/* Vendor & Amount summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 text-sm">
                    <div className="grid grid-cols-2 gap-y-2">
                      <div><span className="text-blue-600 text-xs">Store</span><p className="font-medium">{w.vendor?.storeName || '\u2014'}</p></div>
                      <div><span className="text-blue-600 text-xs">Name</span><p className="font-medium">{w.user?.name || '\u2014'}</p></div>
                      <div><span className="text-blue-600 text-xs">Email</span><p className="font-medium break-all">{w.user?.email || '\u2014'}</p></div>
                      <div><span className="text-blue-600 text-xs">Phone</span><p className="font-medium">{w.user?.phone || '\u2014'}</p></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between">
                      <span className="text-blue-700 font-medium">Amount: {'\u20B9'}{w.amount?.toLocaleString()}</span>
                      <span className="text-xs text-blue-600">{w.paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'}</span>
                    </div>
                  </div>

                  {/* Account Details */}
                  {w.accountDetails && (w.accountDetails.accountHolderName || w.accountDetails.bankName || w.accountDetails.accountNumber || w.accountDetails.ifscCode || w.accountDetails.upiId) && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 text-sm">
                      <h4 className="font-semibold text-green-800 mb-2 text-xs uppercase tracking-wider">
                        {w.paymentMethod === 'upi' ? 'UPI Details' : 'Bank Details'}
                      </h4>
                      {w.paymentMethod === 'upi' ? (
                        <p className="font-mono font-medium">{w.accountDetails.upiId}</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          <div><span className="text-green-700 text-xs">Holder</span><p className="font-medium">{w.accountDetails.accountHolderName || '\u2014'}</p></div>
                          <div><span className="text-green-700 text-xs">Bank</span><p className="font-medium">{w.accountDetails.bankName || '\u2014'}</p></div>
                          <div><span className="text-green-700 text-xs">A/C No.</span><p className="font-mono font-medium">{w.accountDetails.accountNumber}</p></div>
                          <div><span className="text-green-700 text-xs">IFSC</span><p className="font-mono font-medium">{w.accountDetails.ifscCode || '\u2014'}</p></div>
                        </div>
                      )}
                    </div>
                  )}

                  <textarea placeholder={'Reason for ' + actionModal.action + '...'} value={actionModal.reason || ''} onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px]" />
                  <div className="flex gap-3">
                    <button onClick={() => handleWithdrawal(actionModal.action)} className={'text-sm px-6 py-2.5 min-h-[44px] flex-1 text-white font-medium rounded ' + (actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')}>Confirm {actionModal.action}</button>
                    <button onClick={() => setActionModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1 rounded">Cancel</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
