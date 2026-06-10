import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';

const statusLabels = {
  return_requested: 'Return Requested',
  return_approved: 'Return Approved',
  return_rejected: 'Return Rejected',
  pickup_scheduled: 'Pickup Scheduled',
  picked_up: 'Picked Up',
  return_received: 'Item Received',
  qc_passed: 'QC Passed',
  qc_failed: 'QC Failed',
  refund_processed: 'Refund Processed',
  dispute_open: 'Dispute Open',
  dispute_resolved: 'Dispute Resolved',
};

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [qcFailModal, setQcFailModal] = useState(null);
  const [disputeModal, setDisputeModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await get(API.ADMIN.RETURNS, params);
      setReturns(data.returns || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [statusFilter]);

  const doAction = async (url, data = {}, successMsg = 'Done') => {
    setActionLoading(true);
    try {
      await put(url, data);
      toast.success(successMsg);
      setRejectModal(null);
      setQcFailModal(null);
      setDisputeModal(null);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = async (id) => {
    try {
      const { data } = await get(API.ADMIN.RETURN_DETAIL(id));
      setDetailModal(data.return);
    } catch { toast.error('Failed to load details'); }
  };

  if (loading && !returns.length) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div><h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Returns Management</h1><p className="text-xs text-gray-500 mt-0.5">{pagination?.total || 0} total</p></div>
      </div>

      <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-luxe text-sm min-h-[44px]">
          <option value="">All Status</option>
          <option value="return_requested">Return Requested</option>
          <option value="return_approved">Return Approved</option>
          <option value="return_rejected">Return Rejected</option>
          <option value="pickup_scheduled">Pickup Scheduled</option>
          <option value="picked_up">Picked Up</option>
          <option value="return_received">Item Received</option>
          <option value="qc_passed">QC Passed</option>
          <option value="qc_failed">QC Failed</option>
          <option value="refund_processed">Refund Processed</option>
          <option value="dispute_open">Dispute Open</option>
          <option value="dispute_resolved">Dispute Resolved</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-border">
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Product</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden md:table-cell">Customer</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden md:table-cell">Vendor</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 text-right">Amount</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Reason</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {returns.map((r) => (
              <tr key={r._id} className="border-b border-border/50 hover:bg-gray-50/50">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {r.product?.images?.[0]?.url ? (
                      <img src={r.product.images[0].url} alt="" className="w-8 h-8 object-cover rounded" />
                    ) : r.product?.images?.[0] ? (
                      <img src={r.product.images[0]} alt="" className="w-8 h-8 object-cover rounded" />
                    ) : null}
                    <span className="text-sm truncate max-w-[120px]">{r.product?.title || '—'}</span>
                  </div>
                </td>
                <td className="py-3 px-2 hidden md:table-cell text-sm">{r.user?.name || '—'}</td>
                <td className="py-3 px-2 hidden md:table-cell text-xs">{r.vendor?.storeName || '—'}</td>
                <td className="py-3 px-2 text-right text-sm">₹{r.refundAmount?.toLocaleString()}</td>
                <td className="py-3 px-2 text-xs max-w-[120px] truncate">{r.reason || '—'}</td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-2 py-0.5 border cursor-pointer ${getStatusColor(r.status)}`} onClick={() => openDetail(r._id)}>
                    {statusLabels[r.status] || r.status}
                  </span>
                  {r.rejectionReason && (r.status === 'return_rejected' || r.status === 'qc_failed') && (
                    <p className="text-[10px] text-red-500 mt-0.5 truncate max-w-[120px]">{r.rejectionReason}</p>
                  )}
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex gap-1 justify-end flex-wrap text-xs">
                    {r.status === 'return_requested' && (
                      <>
                        <button onClick={() => doAction(API.ADMIN.RETURN_APPROVE(r._id), {}, 'Approved')} className="text-success hover:underline min-h-[36px]">Approve</button>
                        <button onClick={() => setRejectModal(r)} className="text-danger hover:underline min-h-[36px]">Reject</button>
                      </>
                    )}
                    {r.status === 'return_approved' && (
                      <button onClick={() => doAction(API.ADMIN.RETURN_SCHEDULE_PICKUP(r._id), { pickupDate: new Date(Date.now() + 2*86400000).toISOString() }, 'Pickup scheduled')} className="text-indigo-600 hover:underline min-h-[36px]">Schedule Pickup</button>
                    )}
                    {r.status === 'pickup_scheduled' && (
                      <button onClick={() => doAction(API.ADMIN.RETURN_CONFIRM_PICKUP(r._id), {}, 'Pickup confirmed')} className="text-purple-600 hover:underline min-h-[36px]">Confirm Pickup</button>
                    )}
                    {r.status === 'picked_up' && (
                      <button onClick={() => doAction(API.ADMIN.RETURN_RECEIVE(r._id), {}, 'Received')} className="text-violet-600 hover:underline min-h-[36px]">Mark Received</button>
                    )}
                    {r.status === 'return_received' && (
                      <>
                        <button onClick={() => doAction(API.ADMIN.RETURN_QC_PASS(r._id), { notes: 'QC passed - item in good condition' }, 'QC Passed & Refunded')} className="text-teal-600 hover:underline min-h-[36px]">QC Pass</button>
                        <button onClick={() => setQcFailModal(r)} className="text-red-600 hover:underline min-h-[36px]">QC Fail</button>
                      </>
                    )}
                    {r.status === 'qc_passed' && (
                      <span className="text-[10px] text-gray-400">Refund auto-processed</span>
                    )}
                    {r.status === 'dispute_open' && (
                      <button onClick={() => setDisputeModal(r)} className="text-rose-600 hover:underline font-medium min-h-[36px]">Resolve Dispute</button>
                    )}
                    {r.status === 'return_rejected' && !r.dispute?.openedAt && (
                      <span className="text-[10px] text-gray-400">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!returns.length && <p className="text-center text-gray-500 py-12 text-sm">No returns</p>}
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRejectModal(null)}>
          <div className="bg-white w-full max-w-sm mx-auto p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-3">Reject Return</h2>
            <p className="text-xs text-gray-500 mb-3">Product: {rejectModal.product?.title}</p>
            <textarea placeholder="Reason..." value={rejectModal.reason || ''} onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px] mb-3" />
            <div className="flex gap-3">
              <button disabled={actionLoading} onClick={() => doAction(API.ADMIN.RETURN_REJECT(rejectModal._id), { reason: rejectModal.reason }, 'Return rejected')} className="bg-danger text-white text-sm px-6 py-2.5 min-h-[44px] flex-1">Reject</button>
              <button onClick={() => setRejectModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {qcFailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setQcFailModal(null)}>
          <div className="bg-white w-full max-w-sm mx-auto p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-3">QC Failed</h2>
            <p className="text-xs text-gray-500 mb-3">Product: {qcFailModal.product?.title}</p>
            <textarea placeholder="QC failure notes..." value={qcFailModal.notes || ''} onChange={(e) => setQcFailModal({ ...qcFailModal, notes: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px] mb-3" />
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" id="moveDamaged" checked={qcFailModal.moveToDamaged || false} onChange={(e) => setQcFailModal({ ...qcFailModal, moveToDamaged: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="moveDamaged" className="text-xs text-gray-600">Move to damaged inventory</label>
            </div>
            <div className="flex gap-3">
              <button disabled={actionLoading} onClick={() => doAction(API.ADMIN.RETURN_QC_FAIL(qcFailModal._id), { notes: qcFailModal.notes, moveToDamaged: qcFailModal.moveToDamaged }, 'QC Failed')} className="bg-danger text-white text-sm px-6 py-2.5 min-h-[44px] flex-1">Confirm QC Fail</button>
              <button onClick={() => setQcFailModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {disputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDisputeModal(null)}>
          <div className="bg-white w-full max-w-md mx-auto p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-4">Resolve Dispute</h2>
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium">Customer: {disputeModal.user?.name}</p>
              <p className="text-xs text-gray-500">Product: {disputeModal.product?.title}</p>
              <p className="text-xs text-gray-500">Return reason: {disputeModal.reason}</p>
              {disputeModal.rejectionReason && (
                <div className="p-2 bg-red-50 border border-red-100 rounded">
                  <p className="text-xs text-red-700 font-medium">Vendor rejection reason:</p>
                  <p className="text-xs text-red-600">{disputeModal.rejectionReason}</p>
                </div>
              )}
              {disputeModal.dispute?.reason && (
                <div className="p-2 bg-amber-50 border border-amber-100 rounded">
                  <p className="text-xs text-amber-700 font-medium">Customer dispute reason:</p>
                  <p className="text-xs text-amber-600">{disputeModal.dispute.reason}</p>
                </div>
              )}
              {disputeModal.dispute?.details && (
                <p className="text-xs text-gray-600">Details: {disputeModal.dispute.details}</p>
              )}
            </div>
            <div className="space-y-3">
              <textarea
                placeholder="Resolution notes..."
                value={disputeModal.resolution || ''}
                onChange={(e) => setDisputeModal({ ...disputeModal, resolution: e.target.value })}
                className="input-luxe text-sm w-full h-20 min-h-[44px]"
              />
              <div className="flex gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => doAction(API.ADMIN.RETURN_RESOLVE_DISPUTE(disputeModal._id), { resolution: disputeModal.resolution, approveReturn: true }, 'Dispute resolved - Return approved')}
                  className="bg-success text-white text-sm px-4 py-2.5 min-h-[44px] flex-1"
                >
                  Support Customer (Approve)
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => doAction(API.ADMIN.RETURN_RESOLVE_DISPUTE(disputeModal._id), { resolution: disputeModal.resolution, approveReturn: false }, 'Dispute resolved - Return rejected')}
                  className="bg-danger text-white text-sm px-4 py-2.5 min-h-[44px] flex-1"
                >
                  Support Vendor (Reject)
                </button>
              </div>
              <button onClick={() => setDisputeModal(null)} className="w-full text-center text-sm text-gray-500 border border-border py-2.5 hover:bg-gray-50 min-h-[44px]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white w-full max-w-lg mx-auto p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Return Details</h2>
              <button onClick={() => setDetailModal(null)} className="text-gray-400 hover:text-gray-600 min-h-[36px]">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-500 text-xs">Status:</span><p><span className={`text-xs px-2 py-0.5 border ${getStatusColor(detailModal.status)}`}>{statusLabels[detailModal.status] || detailModal.status}</span></p></div>
                <div><span className="text-gray-500 text-xs">Amount:</span><p className="font-medium">{formatPrice(detailModal.refundAmount)}</p></div>
              </div>
              <div><span className="text-gray-500 text-xs">Product:</span><p>{detailModal.product?.title || '—'}</p></div>
              <div><span className="text-gray-500 text-xs">Customer:</span><p>{detailModal.user?.name} ({detailModal.user?.email})</p></div>
              <div><span className="text-gray-500 text-xs">Vendor:</span><p>{detailModal.vendor?.storeName || '—'}</p></div>
              <div><span className="text-gray-500 text-xs">Reason:</span><p>{detailModal.reason}</p></div>
              {detailModal.details && <div><span className="text-gray-500 text-xs">Details:</span><p>{detailModal.details}</p></div>}
              {detailModal.rejectionReason && <div><span className="text-gray-500 text-xs">Rejection reason:</span><p className="text-red-600">{detailModal.rejectionReason}</p></div>}
              {detailModal.qcNotes && <div><span className="text-gray-500 text-xs">QC Notes:</span><p>{detailModal.qcNotes}</p></div>}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                {detailModal.createdAt && <div>Created: {formatDate(detailModal.createdAt)}</div>}
                {detailModal.approvedAt && <div>Approved: {formatDate(detailModal.approvedAt)}</div>}
                {detailModal.pickupScheduled && <div>Pickup: {formatDate(detailModal.pickupScheduled)}</div>}
                {detailModal.pickupCompleted && <div>Picked up: {formatDate(detailModal.pickupCompleted)}</div>}
                {detailModal.itemReceivedAt && <div>Received: {formatDate(detailModal.itemReceivedAt)}</div>}
                {detailModal.refundProcessedAt && <div>Refunded: {formatDate(detailModal.refundProcessedAt)}</div>}
              </div>
              {detailModal.trackingNumber && <div><span className="text-gray-500 text-xs">Return pickup tracking:</span><p>{detailModal.trackingNumber}</p></div>}
              {(() => {
                const deliveryItem = detailModal.order?.items?.find(i => i._id === detailModal.orderItem);
                if (deliveryItem?.tracking?.trackingNumber) {
                  return (
                    <div><span className="text-gray-500 text-xs">Delivery tracking:</span><p>{deliveryItem.tracking.carrier || 'Courier'} — {deliveryItem.tracking.trackingNumber}</p></div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
