import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import InvoiceModal from '../../components/order/InvoiceModal';

const STATUSES = ['All', 'pending', 'accepted', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [detailOrder, setDetailOrder] = useState(null);
  const [showTracking, setShowTracking] = useState(null);
  const [trackingForm, setTrackingForm] = useState({ courier: '', trackingNumber: '' });
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20 };
      if (activeTab !== 'All') params.status = activeTab;
      const { data } = await get(API.VENDORS.ORDERS, params);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(1); }, [activeTab]);

  useEffect(() => { loadOrders(); }, [page]);

  const updateStatus = async (orderId, itemId, status, tracking) => {
    try {
      await put(API.VENDORS.ORDER_ITEM_STATUS(orderId, itemId), { status, tracking });
      toast.success(`Order ${status}`);
      setOrders(prev => prev.map(o => o._id === orderId ? {
        ...o,
        items: o.items.map(it => it._id === itemId ? { ...it, status } : it),
      } : o));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleShip = async (orderId, itemId) => {
    await updateStatus(orderId, itemId, 'shipped', { courier: trackingForm.courier, trackingNumber: trackingForm.trackingNumber });
    setShowTracking(null);
    setTrackingForm({ courier: '', trackingNumber: '' });
  };

  const viewInvoice = async (orderId) => {
    setInvoiceLoading(true);
    try {
      const { data } = await get(API.VENDORS.INVOICE_GENERATE(orderId));
      setInvoiceData(data.invoice || data);
    } catch { toast.error('Failed to load invoice'); }
    finally { setInvoiceLoading(false); }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Orders</h1>

      {/* Status Tabs */}
      <div className="overflow-x-auto flex-nowrap gap-2 sm:gap-4 mb-6 flex">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setActiveTab(s); setPage(1); }} className={`text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-colors whitespace-nowrap min-h-[44px] flex items-center ${activeTab === s ? 'bg-primary text-white border-primary' : 'border-border hover:border-gray-300'}`}>
            {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 skeleton" />)}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="min-w-[600px] lg:min-w-0 w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Order</th>
                  <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Customer</th>
                  <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Product</th>
                  <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Qty</th>
                  <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Total</th>
                  <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
                  <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Tracking</th>
                  <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => order.items?.filter(i => i.vendor).map((item, idx) => (
                  <tr key={`${order._id}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs font-mono">{order.orderNumber}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{order.user?.name}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs line-clamp-1">{item.name}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{item.quantity}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(item.totalPrice)}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3"><span className={`text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 border ${getStatusColor(item.status)}`}>{item.status}</span></td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">
                      {item.tracking?.trackingNumber ? (
                        <div>
                          <p className="font-medium text-gray-700">{item.tracking.courier || 'Courier'}</p>
                          <p className="font-mono">{item.tracking.trackingNumber}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => setDetailOrder(order)} className="text-xs sm:text-sm text-gray-500 hover:underline min-h-[44px] flex items-center">View</button>
                        {!['cancelled', 'refunded', 'return_rejected', 'return_received', 'settled'].includes(item.status) && item.status === 'pending' && <button onClick={() => updateStatus(order._id, item._id, 'accepted')} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">Accept</button>}
                        {!['cancelled', 'refunded', 'return_rejected', 'return_received', 'settled'].includes(item.status) && item.status === 'accepted' && <button onClick={() => updateStatus(order._id, item._id, 'packed')} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">Pack</button>}
                        {!['cancelled', 'refunded', 'return_rejected', 'return_received', 'settled'].includes(item.status) && item.status === 'packed' && <button onClick={() => { setShowTracking({ orderId: order._id, itemId: item._id }); setTrackingForm({ courier: '', trackingNumber: '' }); }} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">Ship</button>}
                        {!['cancelled', 'refunded', 'return_rejected', 'return_received', 'settled'].includes(item.status) && item.status === 'shipped' && <button onClick={() => updateStatus(order._id, item._id, 'out_for_delivery')} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">Out for Delivery</button>}
                        {!['cancelled', 'refunded', 'return_rejected', 'return_received', 'settled'].includes(item.status) && item.status === 'out_for_delivery' && <button onClick={() => updateStatus(order._id, item._id, 'delivered')} className="text-xs sm:text-sm text-success hover:underline min-h-[44px] flex items-center">Mark Delivered</button>}
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && <p className="text-sm text-gray-500 text-center py-8 sm:py-12">No orders found</p>}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}

      {/* View Details Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setDetailOrder(null)}>
          <div className="bg-white rounded-none sm:rounded-xl max-w-lg w-full mx-0 sm:mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border sticky top-0 bg-white">
              <h3 className="text-sm sm:text-base font-medium">Order #{detailOrder.orderNumber}</h3>
              <button onClick={() => setDetailOrder(null)} className="text-lg leading-none text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center">&times;</button>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer</p>
                <p className="text-sm">{detailOrder.user?.name}</p>
                <p className="text-xs text-gray-500">{detailOrder.user?.email}</p>
                <p className="text-xs text-gray-500">{detailOrder.user?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Shipping Address</p>
                {detailOrder.shippingAddress ? (
                  <div className="text-sm">
                    <p>{detailOrder.shippingAddress.street || detailOrder.shippingAddress.addressLine1}</p>
                    <p>{detailOrder.shippingAddress.city}, {detailOrder.shippingAddress.state} - {detailOrder.shippingAddress.pincode}</p>
                  </div>
                ) : <p className="text-xs text-gray-400">N/A</p>}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Payment Method</p>
                <p className="text-sm capitalize">{detailOrder.payment?.method || detailOrder.paymentMethod || 'N/A'}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">Status: {detailOrder.payment?.status || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Invoice</p>
                <button onClick={() => viewInvoice(detailOrder._id)} className="text-primary text-xs underline hover:text-primary/80 min-h-[44px] flex items-center">Generate / View Invoice</button>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-2">
                  {detailOrder.items?.filter(i => i.vendor).map((item, i) => (
                    <div key={i} className="py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center justify-between text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm">{formatPrice(item.totalPrice)}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 border ${getStatusColor(item.status)}`}>{item.status}</span>
                        </div>
                      </div>
                      {item.tracking?.trackingNumber && (
                        <div className="mt-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          Tracking: {item.tracking.courier || ''} — <span className="font-mono">{item.tracking.trackingNumber}</span>
                        </div>
                      )}
                      {item.shippedAt && <p className="text-[10px] text-gray-400 mt-0.5">Shipped: {new Date(item.shippedAt).toLocaleString()}</p>}
                    </div>
                  ))}
                </div>
              </div>
              {detailOrder.subtotal > 0 && (
                <div className="border-t border-border pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(detailOrder.subtotal)}</span></div>
                  {detailOrder.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-{formatPrice(detailOrder.discount)}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{detailOrder.shippingCharge ? formatPrice(detailOrder.shippingCharge) : 'Free'}</span></div>
                  <div className="flex justify-between font-semibold text-base border-t border-border pt-1"><span>Total</span><span>{formatPrice(detailOrder.total)}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <InvoiceModal data={invoiceData} loading={invoiceLoading} onClose={() => setInvoiceData(null)} />

      {/* Tracking Modal */}
      {showTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setShowTracking(null)}>
          <div className="bg-white rounded-none sm:rounded-xl max-w-sm w-full mx-0 sm:mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
              <h3 className="text-sm sm:text-base font-medium">Shipping Details</h3>
              <button onClick={() => setShowTracking(null)} className="text-lg leading-none text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center">&times;</button>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Courier Name</label>
                <input value={trackingForm.courier} onChange={e => setTrackingForm({ ...trackingForm, courier: e.target.value })} placeholder="e.g. Delhivery, Blue Dart" className="input-luxe text-sm w-full min-h-[44px]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tracking Number</label>
                <input value={trackingForm.trackingNumber} onChange={e => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })} placeholder="Enter tracking number" className="input-luxe text-sm w-full min-h-[44px]" />
              </div>
              <div className="flex-col sm:flex-row gap-2 sm:gap-3 flex">
                <button onClick={() => handleShip(showTracking.orderId, showTracking.itemId)} disabled={!trackingForm.trackingNumber} className="w-full sm:flex-1 px-4 py-2 text-sm bg-primary text-white rounded-lg disabled:opacity-50 min-h-[44px]">Confirm Ship</button>
                <button onClick={() => setShowTracking(null)} className="w-full sm:w-auto px-4 py-2 text-sm border border-border rounded-lg hover:bg-gray-50 min-h-[44px]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
