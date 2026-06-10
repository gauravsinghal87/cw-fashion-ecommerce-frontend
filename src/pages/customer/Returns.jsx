import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
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

const stepOrder = [
  'return_requested', 'return_approved', 'pickup_scheduled',
  'picked_up', 'return_received', 'qc_passed', 'refund_processed',
];

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchReturns = async () => {
      loadingRef.current = true;
      if (page === 1) setLoading(true);
      try {
        const { data } = await get(API.RETURNS.LIST, { page, limit: 20 });
        if (cancelled) return;
        setReturns(prev => page === 1 ? (data.returns || []) : [...prev, ...(data.returns || [])]);
        setHasMore(page < (data.pagination?.totalPages || 1));
      } catch {}
      finally {
        if (!cancelled) { loadingRef.current = false; setLoading(false); }
      }
    };
    fetchReturns();
    return () => { cancelled = true; };
  }, [page]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          loadingRef.current = true;
          setPage(p => p + 1);
        }
      },
      { rootMargin: '200px' }
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  if (loading && returns.length === 0) {
    return (
      <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-6">My Returns</h1>
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-6">My Returns</h1>

      {returns.length === 0 && !loading ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-8 0v1m0 0a4 4 0 01-4-4V8a1 1 0 011-1h3.28M8 15v2m8-2v2" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No returns yet</p>
          <Link to="/orders" className="btn-primary inline-flex items-center mt-6 px-6 py-3 text-sm min-h-[44px]">View Orders</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {returns.map((r) => {
              const currentStepIndex = stepOrder.indexOf(r.status);
              const isRejected = r.status === 'return_rejected' || r.status === 'qc_failed';
              const isDispute = r.status === 'dispute_open' || r.status === 'dispute_resolved';
              const orderItem = r.order?.items?.find(item => item._id === r.orderItem);

              return (
                <div key={r._id} className="border border-border bg-white p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-16 h-20 bg-gray-50 border border-border flex-shrink-0 overflow-hidden">
                      {r.product?.images?.[0]?.url ? (
                        <img src={r.product.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : r.product?.images?.[0] ? (
                        <img src={r.product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{r.product?.title || 'Product'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Reason: {r.reason}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Requested {formatDate(r.createdAt)}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className={`text-xs px-2 py-0.5 border ${getStatusColor(r.status)}`}>
                            {statusLabels[r.status] || r.status}
                          </span>
                          <p className="text-xs font-semibold mt-1">{formatPrice(r.refundAmount)}</p>
                        </div>
                      </div>

                      {r.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded">
                          <p className="text-xs text-red-700 font-medium">Rejection reason:</p>
                          <p className="text-xs text-red-600">{r.rejectionReason}</p>
                        </div>
                      )}

                      {orderItem?.tracking?.trackingNumber && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                          <p className="text-[10px] text-blue-700 font-medium">Delivery tracking</p>
                          <p className="text-xs text-blue-600">{orderItem.tracking.carrier || 'Courier'}: <span className="font-mono">{orderItem.tracking.trackingNumber}</span></p>
                        </div>
                      )}

                      {r.trackingNumber && (
                        <div className="mt-1 p-2 bg-purple-50 border border-purple-100 rounded">
                          <p className="text-[10px] text-purple-700 font-medium">Return pickup tracking</p>
                          <p className="text-xs text-purple-600"><span className="font-mono">{r.trackingNumber}</span></p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Link to={`/orders/${r.order?._id || r.order}`} className="text-xs text-primary border border-primary px-2.5 py-1.5 min-h-[32px] rounded hover:bg-primary hover:text-white transition-colors">View Order</Link>
                        {(r.status === 'return_rejected' || r.status === 'qc_failed') && !isDispute && (
                          <Link to={`/returns/${r._id}/dispute`} className="text-xs text-rose-600 border border-rose-600 px-2.5 py-1.5 min-h-[32px] rounded hover:bg-rose-50 transition-colors">Dispute</Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isRejected && !isDispute && currentStepIndex >= 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-1 overflow-x-auto pb-1">
                        {stepOrder.slice(0, currentStepIndex + 1).map((step, idx) => (
                          <div key={step} className="flex items-center gap-1 flex-shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === currentStepIndex
                                ? 'bg-primary text-white'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {idx === currentStepIndex ? '●' : '✓'}
                            </div>
                            <span className={`text-[10px] whitespace-nowrap ${idx === currentStepIndex ? 'text-primary font-medium' : 'text-gray-500'}`}>
                              {statusLabels[step]}
                            </span>
                            {idx < stepOrder.length - 1 && idx < currentStepIndex && (
                              <div className="w-4 h-px bg-green-300 mx-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {r.status === 'refund_processed' && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded">
                      <p className="text-xs text-green-700 font-medium">Refund processed - Amount credited to wallet</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {loading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
          {hasMore && <div ref={sentinelRef} className="h-4" />}
          {!hasMore && returns.length > 0 && <p className="text-center text-xs text-gray-400 py-6">All returns loaded</p>}
        </>
      )}
    </div>
  );
};

export default Returns;
