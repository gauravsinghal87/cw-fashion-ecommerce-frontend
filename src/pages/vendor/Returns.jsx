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

const VendorReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [evidenceModal, setEvidenceModal] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const load = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await get(API.VENDORS.RETURNS, params);
      setReturns(data.returns || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [statusFilter]);

  const updateStatus = async (id, status, data = {}) => {
    try {
      await put(API.VENDORS.RETURN_STATUS(id), { status, ...data });
      toast.success('Status updated');
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const canApprove = (s) => s === 'return_requested';
  const canReject = (s) => s === 'return_requested';
  const canSchedulePickup = (s) => s === 'return_approved';
  const canConfirmPickup = (s) => s === 'pickup_scheduled';
  const canReceive = (s) => s === 'picked_up';

  if (loading && !returns.length) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Return Requests</h1>
          <p className="text-xs text-gray-500 mt-0.5">{pagination?.total || 0} total</p>
        </div>
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
          <option value="dispute_open">Dispute Open</option>
        </select>
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="min-w-[700px] lg:min-w-0 w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Product</th>
              <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Customer</th>
              <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Reason</th>
              <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Amount</th>
              <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
              <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {returns.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <div className="flex items-center gap-2">
                    {r.product?.images?.[0]?.url ? (
                      <img src={r.product.images[0].url} alt="" className="w-8 h-8 object-cover rounded" />
                    ) : r.product?.images?.[0] ? (
                      <img src={r.product.images[0]} alt="" className="w-8 h-8 object-cover rounded" />
                    ) : null}
                    <span className="text-xs truncate max-w-[120px]">{r.product?.title || '—'}</span>
                  </div>
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <p className="text-xs">{r.user?.name || '—'}</p>
                  <p className="text-[10px] text-gray-400">{r.user?.email}</p>
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <p className="text-xs text-gray-500 max-w-[150px] truncate">{r.reason}</p>
                  {r.images?.length > 0 && (
                    <button onClick={() => setEvidenceModal(r)} className="text-[10px] text-primary hover:underline mt-0.5">View evidence</button>
                  )}
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(r.refundAmount)}</td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <span className={`text-xs px-2 py-0.5 border ${getStatusColor(r.status)}`}>{statusLabels[r.status] || r.status}</span>
                  {r.rejectionReason && r.status === 'return_rejected' && (
                    <p className="text-[10px] text-red-500 mt-0.5 truncate max-w-[120px]">{r.rejectionReason}</p>
                  )}
                  {(() => {
                    const deliveryItem = r.order?.items?.find(i => i._id === r.orderItem);
                    if (deliveryItem?.tracking?.trackingNumber) {
                      return (
                        <p className="text-[10px] text-blue-600 mt-0.5">
                          Delivery: {deliveryItem.tracking.carrier || ''} {deliveryItem.tracking.trackingNumber}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <div className="flex flex-col gap-1">
                    {canApprove(r.status) && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(r._id, 'return_approved')} className="text-xs text-success hover:underline min-h-[36px]">Approve</button>
                        <button onClick={() => setRejectModal(r)} className="text-xs text-danger hover:underline min-h-[36px]">Reject</button>
                      </div>
                    )}
                    {canSchedulePickup(r.status) && (
                      <button onClick={() => updateStatus(r._id, 'pickup_scheduled')} className="text-xs text-indigo-600 hover:underline min-h-[36px]">Schedule Pickup</button>
                    )}
                    {canConfirmPickup(r.status) && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(r._id, 'picked_up', { trackingNumber: `TRACK${Date.now()}` })} className="text-xs text-purple-600 hover:underline min-h-[36px]">Confirm Pickup</button>
                      </div>
                    )}
                    {canReceive(r.status) && (
                      <button onClick={() => updateStatus(r._id, 'return_received')} className="text-xs text-violet-600 hover:underline min-h-[36px]">Mark Received</button>
                    )}
                    {r.pickupScheduled && (
                      <p className="text-[10px] text-gray-400">Pickup: {formatDate(r.pickupScheduled)}</p>
                    )}
                    {r.trackingNumber && (
                      <p className="text-[10px] text-gray-400">Tracking: {r.trackingNumber}</p>
                    )}
                    {r.status === 'dispute_open' && (
                      <span className="text-xs text-rose-600">Awaiting admin review</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!returns.length && <p className="text-center text-gray-500 py-12 text-sm">No return requests</p>}
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
            <textarea
              placeholder="Reason for rejection..."
              value={rejectModal.reason || ''}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              className="input-luxe text-sm w-full h-20 min-h-[44px] mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { updateStatus(rejectModal._id, 'return_rejected', { reason: rejectModal.reason }); setRejectModal(null); }}
                className="bg-danger text-white text-sm px-6 py-2.5 min-h-[44px] flex-1"
              >
                Reject
              </button>
              <button onClick={() => setRejectModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {evidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEvidenceModal(null)}>
          <div className="bg-white w-full max-w-lg mx-auto p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Evidence</h2>
              <button onClick={() => setEvidenceModal(null)} className="text-gray-400 hover:text-gray-600 min-h-[36px]">✕</button>
            </div>
            <p className="text-sm font-medium mb-2">Customer: {evidenceModal.user?.name}</p>
            <p className="text-xs text-gray-500 mb-3">Reason: {evidenceModal.reason}</p>
            {evidenceModal.details && <p className="text-xs text-gray-600 mb-3">{evidenceModal.details}</p>}
            {evidenceModal.images?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {evidenceModal.images.map((img, i) => (
                  <img key={i} src={img.url || img} alt="" className="w-full h-32 object-cover border border-border rounded" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No evidence images uploaded</p>
            )}
            {evidenceModal?.order && (
              <p className="text-xs text-gray-400 mt-3">Order: #{evidenceModal.order?.orderNumber || evidenceModal.order}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorReturns;
