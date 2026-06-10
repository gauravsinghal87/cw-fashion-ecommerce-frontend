import { useState, useEffect, Fragment } from 'react';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { formatPrice, formatDate } from '../../utils/helpers';

const statusLabels = {
  pending: 'Pending', accepted: 'Accepted', packed: 'Packed', shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
  return_requested: 'Return Requested', return_approved: 'Approved', return_rejected: 'Rejected',
  return_received: 'Received', refunded: 'Refunded',
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p) => {
    setLoading(true);
    try {
      const { data } = await get(API.VENDORS.CUSTOMERS, { page: p || page, limit: 20 });
      setCustomers(data.customers || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const toggleDetail = async (id) => {
    if (expanded === id) { setExpanded(null); setDetail(null); return; }
    setExpanded(id);
    try {
      const { data } = await get(API.VENDORS.CUSTOMER_DETAIL(id));
      setDetail(data);
    } catch { setDetail(null); }
  };

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-14 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Customers</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-[600px] lg:min-w-0 w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Name</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Email</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Phone</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Orders</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <Fragment key={c.user?._id || c._id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleDetail(c.user?._id || c._id)}>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-sm">{c.user?.name || 'Unknown'}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{c.user?.email || '—'}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{c.user?.phone || '—'}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{c.orderCount ?? 0}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(c.totalSpend ?? 0)}</td>
                  </tr>
                  {expanded === (c.user?._id || c._id) && detail && (
                    <tr key={`${c.user?._id || c._id}-detail`}>
                      <td colSpan={5} className="p-0">
                        <div className="bg-gray-50 border-t border-border p-4 sm:p-5 space-y-5">
                          {/* Customer Profile */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-border rounded p-3 sm:p-4">
                              <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Customer</h4>
                              <p className="text-sm font-medium">{detail.customer?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{detail.customer?.email}</p>
                              {detail.customer?.phone && <p className="text-xs text-gray-500">{detail.customer.phone}</p>}
                            </div>
                            <div className="bg-white border border-border rounded p-3 sm:p-4">
                              <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Orders</h4>
                              <p className="text-lg font-bold">{(detail.orders || []).length}</p>
                            </div>
                            <div className="bg-white border border-border rounded p-3 sm:p-4">
                              <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Returns</h4>
                              <p className="text-lg font-bold">{(detail.returns || []).length}</p>
                            </div>
                          </div>

                          {/* Order History */}
                          <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                              Order History
                              <span className="text-xs text-gray-400 font-normal">({(detail.orders || []).length})</span>
                            </h4>
                            {(detail.orders || []).length === 0 ? (
                              <p className="text-xs text-gray-400 py-4 text-center bg-white border border-dashed border-border rounded">No orders yet</p>
                            ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {(detail.orders || []).map((o) => (
                                  <div key={o._id} className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 border border-border rounded text-xs">
                                    <span className="font-mono font-medium">{o.orderNumber}</span>
                                    <span className="text-gray-500">{formatDate(o.createdAt)}</span>
                                    <span>{o.items?.length || 0} item(s)</span>
                                    <span className={`px-1.5 py-0.5 border ${o.status === 'delivered' ? 'text-success border-success' : o.status === 'cancelled' || o.status === 'refunded' ? 'text-danger border-danger' : 'text-amber-600 border-amber-600'}`}>
                                      {statusLabels[o.status] || o.status}
                                    </span>
                                    <span className="font-medium">{formatPrice(o.total || 0)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Returns */}
                          {detail.returns?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                Returns
                                <span className="text-xs text-gray-400 font-normal">({detail.returns.length})</span>
                              </h4>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {detail.returns.map((r) => (
                                  <div key={r._id} className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 border border-border rounded text-xs">
                                    <span className="font-mono text-gray-500">#{r.returnNumber || r._id.slice(-6)}</span>
                                    <span className="text-gray-500">{formatDate(r.createdAt)}</span>
                                    <span className={`px-1.5 py-0.5 border ${r.status === 'refunded' ? 'text-success border-success' : r.status === 'rejected' ? 'text-danger border-danger' : 'text-amber-600 border-amber-600'}`}>
                                      {r.status?.replace(/_/g, ' ') || '—'}
                                    </span>
                                    {r.refundAmount ? <span className="font-medium">{formatPrice(r.refundAmount)}</span> : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reviews */}
                          {detail.reviews?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                Reviews
                                <span className="text-xs text-gray-400 font-normal">({detail.reviews.length})</span>
                              </h4>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {detail.reviews.map((r) => (
                                  <div key={r._id} className="bg-white p-3 border border-border rounded text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{r.product?.title || 'Product'}</span>
                                      <span className="text-yellow-500">{'★'.repeat(r.rating || 0)}</span>
                                    </div>
                                    {r.comment && <p className="text-gray-600">{r.comment}</p>}
                                    <p className="text-gray-400">{formatDate(r.createdAt)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && !loading && <p className="text-center text-gray-500 py-8 sm:py-12 text-xs sm:text-sm">No customers yet</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}
    </div>
  );
};

export default Customers;
