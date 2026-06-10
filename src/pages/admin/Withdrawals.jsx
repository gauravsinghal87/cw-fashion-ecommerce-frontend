import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [detail, setDetail] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const load = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await get(API.ADMIN.WITHDRAWALS, params);
      setWithdrawals(data.withdrawals || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(1); }, [statusFilter]);

  const doAction = async (action) => {
    try {
      await put(API.ADMIN.WITHDRAWAL_ACTION(actionModal.id, action), { reason: actionModal.reason || '' });
      toast.success('Withdrawal ' + (action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'held'));
      setActionModal(null); load(page);
    } catch { toast.error('Failed'); }
  };

  const statusColor = (s) => {
    const map = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-blue-50 text-blue-700', rejected: 'bg-danger/10 text-danger', completed: 'bg-success/10 text-success', cancelled: 'bg-gray-100 text-gray-500' };
    return map[s] || 'bg-gray-100';
  };

  if (loading && !withdrawals.length) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="section-title">Withdrawals</h1><p className="text-xs text-gray-500 mt-0.5">{pagination?.total || 0} total</p></div>
      </div>
      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-luxe text-sm min-h-[44px]">
          <option value="">All Status</option>
          <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="completed">Completed</option>
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
                <td className="py-3 px-2"><p className="text-sm font-medium">{w.vendor?.storeName || '\u2014'}</p><p className="text-xs text-gray-400">{w.vendor?.user?.name || ''}</p></td>
                <td className="py-3 px-2 text-right font-medium">{'\u20B9'}{w.amount?.toLocaleString()}</td>
                <td className="py-3 px-2 hidden md:table-cell text-xs">{w.paymentMethod || '\u2014'}</td>
                <td className="py-3 px-2"><span className={'text-xs px-2 py-0.5 ' + statusColor(w.status)}>{w.status}</span></td>
                <td className="py-3 px-2 hidden lg:table-cell text-xs text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-2 text-right">
                  <div className="flex gap-1 justify-end flex-wrap text-xs">
                    <button onClick={() => setDetail(w)} className="text-primary hover:underline min-h-[36px]">View</button>
                    {w.status === 'pending' && <><button onClick={() => setActionModal({ id: w._id, action: 'approve' })} className="text-success hover:underline min-h-[36px]">Approve</button><button onClick={() => setActionModal({ id: w._id, action: 'reject' })} className="text-danger hover:underline min-h-[36px]">Reject</button></>}
                    {w.status === 'approved' && <button onClick={() => { doAction('complete'); }} className="text-blue-600 hover:underline min-h-[36px]">Mark Complete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!withdrawals.length && <p className="text-center text-gray-500 py-12 text-sm">No withdrawals</p>}
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setDetail(null)}>
          <div className="bg-white w-full max-w-md mx-0 sm:mx-4 p-4 sm:p-6 rounded shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h2 className="font-semibold">Withdrawal Detail</h2><button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-lg min-h-[36px] min-w-[36px]">&times;</button></div>
            <div className="space-y-2 text-sm">
              <div className="border-b pb-2 mb-2"><span className="text-gray-500">Vendor:</span> <span className="font-medium">{detail.vendor?.storeName}</span></div>
              <div><span className="text-gray-500">Amount:</span> {'\u20B9'}{detail.amount?.toLocaleString()}</div>
              <div><span className="text-gray-500">Method:</span> {detail.paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'}</div>
              <div><span className="text-gray-500">Status:</span> <span className={'text-xs px-2 py-0.5 ' + statusColor(detail.status)}>{detail.status}</span></div>
              <div><span className="text-gray-500">Date:</span> {new Date(detail.createdAt).toLocaleString()}</div>
              {detail.accountDetails && (
                <div className="border-t pt-2 mt-2">
                  <p className="font-medium text-gray-700 mb-1">Account Details</p>
                  {detail.accountDetails.accountHolderName && <div><span className="text-gray-500">Holder:</span> {detail.accountDetails.accountHolderName}</div>}
                  {detail.accountDetails.bankName && <div><span className="text-gray-500">Bank:</span> {detail.accountDetails.bankName}</div>}
                  {detail.accountDetails.accountNumber && <div><span className="text-gray-500">A/C:</span> {detail.accountDetails.accountNumber}</div>}
                  {detail.accountDetails.ifscCode && <div><span className="text-gray-500">IFSC:</span> {detail.accountDetails.ifscCode}</div>}
                  {detail.accountDetails.upiId && <div><span className="text-gray-500">UPI:</span> {detail.accountDetails.upiId}</div>}
                </div>
              )}
              {detail.rejectionReason && <div className="mt-2 p-2 bg-red-50 text-red-700 rounded"><span className="text-gray-500">Rejection Reason:</span> {detail.rejectionReason}</div>}
            </div>
          </div>
        </div>
      )}

      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setActionModal(null)}>
          <div className="bg-white w-full max-w-sm mx-auto p-4 sm:p-6 rounded shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-3 capitalize">{actionModal.action} Withdrawal</h2>
            {(() => {
              const w = withdrawals.find(w => w._id === actionModal.id);
              if (!w) return null;
              return (
                <div className="text-sm space-y-1.5 mb-4 p-3 bg-gray-50 rounded border">
                  <div><span className="text-gray-500">Vendor:</span> <span className="font-medium">{w.vendor?.storeName}</span></div>
                  <div><span className="text-gray-500">Amount:</span> ₹{w.amount?.toLocaleString()}</div>
                  <div><span className="text-gray-500">Method:</span> {w.paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'}</div>
                  {w.accountDetails && <>
                    <div className="border-t pt-1.5 mt-1.5" />
                    {w.accountDetails.accountHolderName && <div><span className="text-gray-500">Holder:</span> {w.accountDetails.accountHolderName}</div>}
                    {w.accountDetails.bankName && <div><span className="text-gray-500">Bank:</span> {w.accountDetails.bankName}</div>}
                    {w.accountDetails.accountNumber && <div><span className="text-gray-500">A/C:</span> {w.accountDetails.accountNumber}</div>}
                    {w.accountDetails.ifscCode && <div><span className="text-gray-500">IFSC:</span> {w.accountDetails.ifscCode}</div>}
                    {w.accountDetails.upiId && <div><span className="text-gray-500">UPI:</span> {w.accountDetails.upiId}</div>}
                  </>}
                </div>
              );
            })()}
            <textarea placeholder={'Reason for ' + actionModal.action + '...'} value={actionModal.reason || ''} onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px] mb-3" />
            <div className="flex gap-3">
              <button onClick={() => doAction(actionModal.action)} className={'text-sm px-6 py-2.5 min-h-[44px] flex-1 text-white ' + (actionModal.action === 'approve' ? 'bg-success' : 'bg-danger')}>Confirm</button>
              <button onClick={() => setActionModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminWithdrawals;
