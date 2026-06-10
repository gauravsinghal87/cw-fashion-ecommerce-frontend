import { useState, useEffect } from 'react';
import { get, post, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import InvoiceModal from '../../components/order/InvoiceModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [detail, setDetail] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [refundModal, setRefundModal] = useState(null);
  const [settling, setSettling] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const load = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await get(API.ADMIN.ORDERS, params);
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [statusFilter]);

  const viewDetail = async (o) => {
    try { const { data } = await get(API.ADMIN.ORDER(o._id)); setDetail(data.order); } catch { toast.error('Failed'); }
  };

  const cancelOrder = async () => {
    try { await put(API.ADMIN.ORDER_CANCEL(cancelModal.id), { reason: cancelModal.reason } || {}); toast.success('Order cancelled'); setCancelModal(null); load(page); } catch { toast.error('Failed'); }
  };

  const forceDeliver = async (id) => {
    if (!confirm('Mark this order as delivered?')) return;
    try { await put(API.ADMIN.ORDER_FORCE_DELIVER(id)); toast.success('Order delivered'); load(page); } catch { toast.error('Failed'); }
  };

  const forceRefund = async () => {
    try { await put(API.ADMIN.ORDER_FORCE_REFUND(refundModal.id), { amount: Number(refundModal.amount) }); toast.success('Refund processed'); setRefundModal(null); load(page); } catch { toast.error('Failed'); }
  };

  const viewInvoice = async () => {
    setInvoiceLoading(true);
    try {
      const { data } = await get(API.ADMIN.ORDER_INVOICE(detail._id));
      setInvoice(data.invoice);
    } catch { toast.error('Failed to load invoice'); }
    finally { setInvoiceLoading(false); }
  };

  const settleOrders = async () => {
    setSettling(true);
    try { const { data } = await post(API.ADMIN.ORDER_SETTLE); toast.success(data.message || 'Settled'); load(page); } catch { toast.error('Failed'); }
    finally { setSettling(false); }
  };

  if (loading && !orders.length) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div><h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Orders</h1><p className="text-xs text-gray-500 mt-0.5">{pagination?.total || 0} total</p></div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4 items-stretch">
        <div className="flex gap-2 flex-1 min-w-0 w-full sm:w-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(1)} placeholder="Search order #..." className="input-luxe text-sm flex-1 min-h-[44px]" />
          <button onClick={() => load(1)} className="btn-primary text-sm px-4 min-h-[44px]">Search</button>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-luxe text-sm min-h-[44px] w-full sm:w-auto sm:min-w-[140px]">
          <option value="">All Status</option>
          <option value="pending">Pending</option><option value="accepted">Accepted</option><option value="packed">Packed</option>
          <option value="shipped">Shipped</option><option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
          <option value="return_requested">Return Requested</option><option value="refunded">Refunded</option><option value="settled">Settled</option>
        </select>
        <button onClick={settleOrders} disabled={settling} className="btn-primary text-sm px-4 min-h-[44px] whitespace-nowrap w-full sm:w-auto">{settling ? 'Settling...' : 'Settle Orders'}</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-border">
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Order #</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Customer</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden md:table-cell">Items</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 text-right">Total</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden lg:table-cell">Payment</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-border/50 hover:bg-gray-50/50">
                <td className="py-3 px-2 font-medium text-xs">#{o.orderNumber}</td>
                <td className="py-3 px-2"><p className="text-sm">{o.user?.name}</p><p className="text-xs text-gray-400">{o.user?.email}</p></td>
                <td className="py-3 px-2 hidden md:table-cell text-sm">{o.items?.length || 0}</td>
                <td className="py-3 px-2 text-right text-sm">₹{o.total?.toLocaleString()}</td>
                <td className="py-3 px-2 hidden lg:table-cell text-xs">{o.paymentMethod || '—'}</td>
                <td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 ${getStatusColor(o.status)}`}>{o.status}</span></td>
                <td className="py-3 px-2 text-right">
                  <div className="flex gap-1 justify-end flex-wrap text-xs">
                    <button onClick={() => viewDetail(o)} className="text-primary hover:underline min-h-[36px]">View</button>
                    {!['cancelled', 'delivered', 'refunded', 'settled'].includes(o.status) && <button onClick={() => setCancelModal({ id: o._id })} className="text-danger hover:underline min-h-[36px]">Cancel</button>}
                    {['shipped', 'out_for_delivery'].includes(o.status) && <button onClick={() => forceDeliver(o._id)} className="text-success hover:underline min-h-[36px]">Deliver</button>}
                    {!['refunded', 'cancelled', 'settled'].includes(o.status) && <button onClick={() => setRefundModal({ id: o._id, amount: o.total })} className="text-amber-600 hover:underline min-h-[36px]">Force Refund</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className="text-center text-gray-500 py-12 text-sm">No orders found</p>}
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-0 sm:p-4 pt-12 sm:pt-4" onClick={() => setDetail(null)}>
          <div className="bg-white w-full max-w-4xl mx-0 sm:mx-4 rounded shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between z-10">
              <h2 className="font-semibold text-base sm:text-lg">Order #{detail.orderNumber}</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-lg min-h-[36px] min-w-[36px]">&times;</button>
            </div>
            <div className="p-4 sm:p-6 space-y-5 text-sm">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="card-luxe p-3"><span className="text-[10px] text-gray-500 uppercase tracking-wider">Total</span><p className="text-lg font-bold mt-0.5">₹{detail.total?.toLocaleString()}</p></div>
                <div className="card-luxe p-3"><span className="text-[10px] text-gray-500 uppercase tracking-wider">Status</span><p className={`text-sm font-bold mt-0.5 capitalize ${detail.status === 'delivered' ? 'text-success' : detail.status === 'cancelled' || detail.status === 'refunded' ? 'text-danger' : 'text-amber-600'}`}>{detail.status.replace(/_/g, ' ')}</p></div>
                <div className="card-luxe p-3"><span className="text-[10px] text-gray-500 uppercase tracking-wider">Payment</span><p className="text-sm font-medium mt-0.5 capitalize">{detail.payment?.method || '—'}</p></div>
                <div className="card-luxe p-3"><span className="text-[10px] text-gray-500 uppercase tracking-wider">Date</span><p className="text-sm font-medium mt-0.5">{new Date(detail.createdAt).toLocaleDateString()}</p></div>
              </div>

              {/* Price Breakdown */}
              <div className="card-luxe p-3 space-y-1.5">
                <div className="flex justify-between text-xs"><span>Subtotal</span><span>₹{detail.subtotal?.toLocaleString() || '0'}</span></div>
                {detail.shippingCharge > 0 && <div className="flex justify-between text-xs"><span>Shipping</span><span>₹{detail.shippingCharge?.toLocaleString()}</span></div>}
                {detail.discount > 0 && <div className="flex justify-between text-xs text-success"><span>Discount {detail.coupon?.code ? `(${detail.coupon.code})` : ''}</span><span>-₹{detail.discount?.toLocaleString()}</span></div>}
                <div className="flex justify-between text-sm font-bold border-t border-border pt-1.5"><span>Total</span><span>₹{detail.total?.toLocaleString()}</span></div>
              </div>

              {/* Customer & Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="card-luxe p-3">
                  <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Customer</h3>
                  <p className="text-sm">{detail.user?.name}</p>
                  <p className="text-xs text-gray-500">{detail.user?.email}</p>
                  {detail.user?.phone && <p className="text-xs text-gray-500">{detail.user?.phone}</p>}
                </div>
                <div className="card-luxe p-3">
                  <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Billing Address</h3>
                  {(detail.billingAddress || detail.shippingAddress) && (
                    <>
                      <p className="text-sm">{detail.billingAddress?.fullName || detail.shippingAddress?.fullName}</p>
                      <p className="text-xs text-gray-500">{detail.billingAddress?.addressLine1 || detail.shippingAddress?.addressLine1}</p>
                      {detail.billingAddress?.addressLine2 && <p className="text-xs text-gray-500">{detail.billingAddress.addressLine2}</p>}
                      <p className="text-xs text-gray-500">{detail.billingAddress?.city || detail.shippingAddress?.city}, {detail.billingAddress?.state || detail.shippingAddress?.state} {detail.billingAddress?.pincode || detail.shippingAddress?.pincode}</p>
                      {detail.billingAddress?.phone && <p className="text-xs text-gray-500">Phone: {detail.billingAddress.phone}</p>}
                    </>
                  )}
                  {!detail.billingAddress && !detail.shippingAddress && <p className="text-xs text-gray-400">—</p>}
                </div>
              </div>

              {detail.shippingAddress && (
                <div className="card-luxe p-3">
                  <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Shipping Address</h3>
                  <p className="text-sm">{detail.shippingAddress.fullName}</p>
                  <p className="text-xs text-gray-500">{detail.shippingAddress.addressLine1}{detail.shippingAddress.addressLine2 ? `, ${detail.shippingAddress.addressLine2}` : ''}</p>
                  {detail.shippingAddress.landmark && <p className="text-xs text-gray-500">Landmark: {detail.shippingAddress.landmark}</p>}
                  <p className="text-xs text-gray-500">{detail.shippingAddress.city}, {detail.shippingAddress.state} {detail.shippingAddress.pincode}</p>
                  <p className="text-xs text-gray-500">Phone: {detail.shippingAddress.phone}</p>
                </div>
              )}

              {/* Payment Details */}
              <div className="card-luxe p-3">
                <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Payment Details</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Method</span><p className="font-medium capitalize">{detail.payment?.method || '—'}</p></div>
                  <div><span className="text-gray-400">Status</span><p className={`font-medium ${detail.payment?.status === 'completed' ? 'text-success' : detail.payment?.status === 'failed' ? 'text-danger' : ''}`}>{detail.payment?.status || '—'}</p></div>
                  {detail.payment?.transactionId && <div className="col-span-2"><span className="text-gray-400">Transaction ID</span><p className="font-medium text-xs break-all">{detail.payment.transactionId}</p></div>}
                  {detail.payment?.razorpayPaymentId && <div className="col-span-2"><span className="text-gray-400">Razorpay Payment ID</span><p className="font-medium text-xs break-all">{detail.payment.razorpayPaymentId}</p></div>}
                  {detail.payment?.paidAt && <div><span className="text-gray-400">Paid At</span><p className="font-medium">{new Date(detail.payment.paidAt).toLocaleString()}</p></div>}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium mb-2">Items ({detail.items?.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {detail.items?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 border border-border rounded">
                      {item.product?.images?.[0]?.url && <img src={item.product.images[0].url} alt="" className="w-14 h-14 object-cover rounded mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate font-medium">{item.product?.title || 'Product'}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                          {item.size && <span>Size: {item.size}</span>}
                          <span>Qty: {item.quantity}</span>
                          <span>₹{item.price} each</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 border ${getStatusColor(item.status)}`}>{item.status?.replace(/_/g, ' ')}</span>
                          {item.isReturnable !== undefined && <span className={`text-[10px] ${item.isReturnable ? 'text-success' : 'text-gray-400'}`}>{item.isReturnable ? 'Returnable' : 'Non-returnable'}</span>}
                        </div>
                        {item.tracking?.trackingNumber && <p className="text-[10px] text-gray-400 mt-0.5">Tracking: {item.tracking.trackingNumber} ({item.tracking.carrier || '—'})</p>}
                      </div>
                      <p className="font-medium text-sm whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Timeline */}
              {detail.deliveredAt && <div className="card-luxe p-3"><h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-1">Delivered</h3><p className="text-xs">{new Date(detail.deliveredAt).toLocaleString()}</p></div>}
              {detail.estimatedDelivery && <div className="card-luxe p-3"><h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-1">Est. Delivery</h3><p className="text-xs">{new Date(detail.estimatedDelivery).toLocaleDateString()}</p></div>}
              {detail.returnWindowEnd && <div className="card-luxe p-3"><h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-1">Return Window Ends</h3><p className="text-xs">{new Date(detail.returnWindowEnd).toLocaleDateString()}</p></div>}
              {detail.settlementDate && <div className="card-luxe p-3"><h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-1">Settled On</h3><p className="text-xs">{new Date(detail.settlementDate).toLocaleDateString()}</p></div>}
            

              {detail.notes && <div className="card-luxe p-3"><h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-1">Order Notes</h3><p className="text-xs">{detail.notes}</p></div>}

              {detail.cancellation?.isRequested && <div className="bg-danger/5 p-3 rounded text-xs"><span className="font-medium">Cancellation:</span> {detail.cancellation.reason || 'No reason'} — {detail.cancellation.cancelledAt ? new Date(detail.cancellation.cancelledAt).toLocaleString() : ''}</div>}
              {detail.refund?.amount > 0 && <div className="bg-amber-50 p-3 rounded text-xs"><span className="font-medium">Refund:</span> ₹{detail.refund.amount} — {detail.refund.processedAt ? new Date(detail.refund.processedAt).toLocaleString() : ''}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setCancelModal(null)}>
          <div className="bg-white w-full max-w-sm mx-auto p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-3">Cancel Order</h2>
            <textarea placeholder="Reason (optional)" value={cancelModal.reason || ''} onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px] mb-3" />
            <div className="flex gap-3"><button onClick={cancelOrder} className="bg-danger text-white text-sm px-6 py-2.5 min-h-[44px] flex-1">Cancel Order</button><button onClick={() => setCancelModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1">Keep</button></div>
          </div>
        </div>
      )}

      <InvoiceModal data={invoice} loading={invoiceLoading} onClose={() => setInvoice(null)} />

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRefundModal(null)}>
          <div className="bg-white w-full max-w-sm mx-auto p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-3">Force Refund</h2>
            <input type="number" value={refundModal.amount || ''} onChange={(e) => setRefundModal({ ...refundModal, amount: e.target.value })} className="input-luxe text-sm w-full min-h-[44px] mb-3" />
            <div className="flex gap-3"><button onClick={forceRefund} className="bg-amber-600 text-white text-sm px-6 py-2.5 min-h-[44px] flex-1">Refund ₹{refundModal.amount || 0}</button><button onClick={() => setRefundModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1">Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminOrders;
