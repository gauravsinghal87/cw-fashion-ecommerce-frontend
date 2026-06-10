import { useState, useEffect } from 'react';
import { get, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime, getInitials } from '../../utils/helpers';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reportedFilter, setReportedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);
  const [reportedCount, setReportedCount] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [hideReason, setHideReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { load(); }, [statusFilter, reportedFilter, page]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      if (reportedFilter) params.set('reported', 'true');
      const { data } = await get(`${API.REVIEWS.ADMIN_ALL}?${params}`);
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setPendingCount(data.pendingCount || 0);
      setReportedCount(data.reportedCount || 0);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  const handleAction = async (action, reviewId) => {
    setActionLoading(true);
    try {
      const actions = {
        approve: () => put(API.REVIEWS.ADMIN_APPROVE(reviewId)),
        reject: () => put(API.REVIEWS.ADMIN_REJECT(reviewId), { reason: rejectReason || 'Does not meet guidelines' }),
        hide: () => put(API.REVIEWS.ADMIN_HIDE(reviewId), { reason: hideReason || 'Hidden by admin' }),
        restore: () => put(API.REVIEWS.ADMIN_RESTORE(reviewId)),
        ban: () => put(API.REVIEWS.ADMIN_BAN_REVIEWER(reviewId)),
      };
      await actions[action]();
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} successful`);
      setSelectedReview(null);
      setRejectReason('');
      setHideReason('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(false); }
  };

  const handleResolveReport = async (reviewId, action) => {
    setActionLoading(true);
    try {
      await put(API.REVIEWS.ADMIN_RESOLVE_REPORT(reviewId), { action });
      toast.success('Report resolved');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>&#9733;</span>
  ));

  if (loading && reviews.length === 0) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Review Moderation</h1>
        <div className="flex gap-3 text-xs">
          <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">{pendingCount} Pending</span>
          <span className="text-red-600 bg-red-50 px-2 py-1 rounded">{reportedCount} Reported</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['', 'pending', 'approved', 'rejected', 'hidden'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-2 text-xs border min-h-[36px] ${statusFilter === s ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'}`}>
            {s || 'All'}
          </button>
        ))}
        <button onClick={() => { setReportedFilter(reportedFilter ? '' : 'true'); setPage(1); }} className={`px-3 py-2 text-xs border min-h-[36px] ${reportedFilter ? 'bg-danger text-white border-danger' : 'border-border hover:border-danger'}`}>
          Reported
        </button>
      </div>

      {reviews.length === 0 && <p className="text-center text-gray-500 py-8">No reviews found</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2">Product</th>
              <th className="text-left py-2 px-2">User</th>
              <th className="text-left py-2 px-2">Rating</th>
              <th className="text-left py-2 px-2">Review</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Report</th>
              <th className="text-left py-2 px-2">Date</th>
              <th className="text-left py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id} className="border-b border-border hover:bg-gray-50">
                <td className="py-2 px-2 max-w-[150px] truncate">{r.product?.title || 'N/A'}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1">
                    {getInitials(r.user?.name)}
                    <span className="truncate max-w-[100px] inline-block">{r.user?.name || 'Anonymous'}</span>
                  </div>
                </td>
                <td className="py-2 px-2">{renderStars(r.rating)}</td>
                <td className="py-2 px-2 max-w-[200px]">
                  <p className="truncate">{r.comment || r.title || '-'}</p>
                </td>
                <td className="py-2 px-2">
                  <span className={`px-1.5 py-0.5 rounded ${
                    r.status === 'approved' ? 'text-green-600 bg-green-50' :
                    r.status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                    r.status === 'rejected' ? 'text-red-600 bg-red-50' :
                    'text-gray-500 bg-gray-50'
                  }`}>{r.status}</span>
                </td>
                <td className="py-2 px-2">
                  {r.report?.isReported ? (
                    <span className={`px-1.5 py-0.5 rounded ${r.report.status === 'pending' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'}`}>
                      {r.report.reason}
                    </span>
                  ) : '-'}
                </td>
                <td className="py-2 px-2 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                <td className="py-2 px-2">
                  <button onClick={() => setSelectedReview(r)} className="text-primary hover:underline">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 text-xs border min-h-[36px] ${page === i + 1 ? 'bg-primary text-white' : ''}`}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedReview(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Review Details</h3>
              <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px]">&times;</button>
            </div>

            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Product:</span> {selectedReview.product?.title}</div>
              <div><span className="text-gray-500">User:</span> {selectedReview.user?.name} ({selectedReview.user?.email})</div>
              <div><span className="text-gray-500">Rating:</span> <span className="text-yellow-400">{'★'.repeat(selectedReview.rating)}</span></div>
              {selectedReview.title && <div><span className="text-gray-500">Title:</span> {selectedReview.title}</div>}
              {selectedReview.comment && <div><span className="text-gray-500">Comment:</span> {selectedReview.comment}</div>}
              {selectedReview.isVerifiedPurchase && <div className="text-green-600">Verified Purchase</div>}
              <div><span className="text-gray-500">Status:</span> {selectedReview.status}</div>
              <div><span className="text-gray-500">Date:</span> {formatDateTime(selectedReview.createdAt)}</div>
              {selectedReview.helpfulCount > 0 && <div><span className="text-gray-500">Helpful:</span> {selectedReview.helpfulCount}</div>}

              {selectedReview.images?.length > 0 && (
                <div>
                  <span className="text-gray-500">Images:</span>
                  <div className="flex gap-2 mt-1">
                    {selectedReview.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded border cursor-pointer" onClick={() => window.open(img, '_blank')} />
                    ))}
                  </div>
                </div>
              )}

              {selectedReview.vendorReply?.text && (
                <div className="border-l-2 border-primary/30 pl-3">
                  <span className="text-gray-500">Vendor Reply:</span> {selectedReview.vendorReply.text}
                </div>
              )}

              {selectedReview.report?.isReported && (
                <div className="bg-red-50 p-3 rounded">
                  <p className="font-medium text-red-700">Reported</p>
                  <p className="text-xs text-red-600">Reason: {selectedReview.report.reason}</p>
                  {selectedReview.report.details && <p className="text-xs text-red-600">Details: {selectedReview.report.details}</p>}
                  <p className="text-xs text-red-500">Status: {selectedReview.report.status}</p>
                  <div className="flex gap-2 mt-2">
                    {selectedReview.report.status === 'pending' && (
                      <>
                        <button onClick={() => handleResolveReport(selectedReview._id, 'hide')} disabled={actionLoading} className="btn-danger text-xs px-2 py-1 min-h-[32px]">Hide & Resolve</button>
                        <button onClick={() => handleResolveReport(selectedReview._id, 'resolve')} disabled={actionLoading} className="btn-primary text-xs px-2 py-1 min-h-[32px]">Keep & Resolve</button>
                        <button onClick={() => handleResolveReport(selectedReview._id, 'dismiss')} disabled={actionLoading} className="btn-secondary text-xs px-2 py-1 min-h-[32px]">Dismiss</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
              {selectedReview.status !== 'approved' && (
                <button onClick={() => handleAction('approve', selectedReview._id)} disabled={actionLoading} className="btn-primary text-xs px-3 py-2 min-h-[36px]">Approve</button>
              )}
              {selectedReview.status !== 'rejected' && (
                <>
                  <button onClick={() => handleAction('reject', selectedReview._id)} disabled={actionLoading && !rejectReason} className="btn-danger text-xs px-3 py-2 min-h-[36px]">Reject</button>
                  {selectedReview.status === 'pending' && (
                    <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason..." className="input-luxe text-xs flex-1 min-w-[150px]" />
                  )}
                </>
              )}
              {selectedReview.status !== 'hidden' && (
                <>
                  <button onClick={() => handleAction('hide', selectedReview._id)} disabled={actionLoading} className="text-xs border border-gray-300 px-3 py-2 min-h-[36px] rounded hover:bg-gray-50">Hide</button>
                  <input value={hideReason} onChange={e => setHideReason(e.target.value)} placeholder="Hide reason..." className="input-luxe text-xs flex-1 min-w-[150px]" />
                </>
              )}
              {(selectedReview.status === 'hidden' || selectedReview.status === 'rejected') && (
                <button onClick={() => handleAction('restore', selectedReview._id)} disabled={actionLoading} className="text-xs border border-green-300 text-green-600 px-3 py-2 min-h-[36px] rounded hover:bg-green-50">Restore</button>
              )}
              <button onClick={() => handleAction('ban', selectedReview._id)} disabled={actionLoading} className="text-xs border border-red-300 text-red-600 px-3 py-2 min-h-[36px] rounded hover:bg-red-50">
                {selectedReview.user?.isBanned ? 'Unban User' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
