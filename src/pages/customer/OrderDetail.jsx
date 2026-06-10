import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get, post, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import ReviewForm from '../../components/review/ReviewForm';
import InvoiceModal from '../../components/order/InvoiceModal';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [returnForm, setReturnForm] = useState({ itemId: '', reason: '', details: '', images: [] });
  const [showReturn, setShowReturn] = useState(false);
  const [returning, setReturning] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [existingReviews, setExistingReviews] = useState([]);
  const [viewingReview, setViewingReview] = useState(null);

  useEffect(() => {
    get(API.ORDERS.DETAIL(id)).then(({ data }) => setOrder(data.order)).catch(() => {}).finally(() => setLoading(false));
    get(API.REVIEWS.MY, { orderId: id, limit: 50 }).then(({ data }) => setExistingReviews(data.reviews || [])).catch(() => {});
  }, [id]);

  const reviewMap = useMemo(() => {
    const map = {};
    existingReviews.forEach(r => { if (r.orderItem) map[r.orderItem.toString()] = r; });
    return map;
  }, [existingReviews]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await put(API.ORDERS.CANCEL(id), { reason: cancelReason });
      setOrder(data.order);
      setShowCancel(false);
      setCancelReason('');
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnRequest = async (e) => {
    e.preventDefault();
    if (!returnForm.reason) { toast.error('Please select a reason'); return; }
    setReturning(true);
    try {
      const payload = {
        orderId: id,
        orderItemId: returnForm.itemId,
        reason: returnForm.reason,
        details: returnForm.details,
        images: returnForm.images,
      };
      const { data } = await post(API.RETURNS.CREATE, payload);
      toast.success('Return requested');
      setShowReturn(false);
      setReturnForm({ itemId: '', reason: '', details: '', images: [] });
      setOrder(prev => ({
        ...prev,
        items: prev.items.map(i => i._id === returnForm.itemId ? { ...i, returnRequest: data.return } : i),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot request return');
    } finally {
      setReturning(false);
    }
  };

  const viewInvoice = async () => {
    setInvoiceLoading(true);
    try {
      const { data } = await get(API.ORDERS.INVOICE(id));
      setInvoiceData(data.invoice);
    } catch { toast.error('Failed to generate invoice'); }
    finally { setInvoiceLoading(false); }
  };

  const submitReview = async (formData) => {
    setSubmittingReview(true);
    try {
      const productId = reviewItem.product?._id || reviewItem.product;
      await post(API.REVIEWS.CREATE, { productId, orderId: id, orderItemId: reviewItem._id, ...formData });
      toast.success('Review submitted');
      setReviewItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-4xl mx-auto"><div className="h-8 skeleton w-48 mb-4" /><div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton" />)}</div></div>;
  if (!order) return <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-4xl mx-auto text-center"><p className="text-gray-500">Order not found</p></div>;

  const canCancel = ['pending', 'accepted'].includes(order.status);
  const terminalStatuses = ['cancelled', 'refunded', 'return_rejected', 'return_received', 'settled'];

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-3 py-1 text-xs font-medium border rounded ${getStatusColor(order.status)}`}>
            {order.status.replace(/_/g, ' ')}
          </span>
          <button onClick={viewInvoice} className="text-xs border border-primary text-primary px-3 py-1 min-h-[36px] rounded hover:bg-primary hover:text-white transition-colors">
            Invoice
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 sm:space-y-4">
        {order.items.map((item) => {
          const canReview = item.status === 'delivered' && !terminalStatuses.includes(item.status);
          const isReturnable = item.product?.isReturnable === true;
          const returnAlreadyRequested = item.returnRequest?.isRequested || ['return_requested', 'return_approved', 'pickup_scheduled', 'picked_up', 'return_received', 'qc_passed', 'refund_processed', 'dispute_open'].includes(item.status);
          const returnExpired = order.returnWindowEnd && new Date(order.returnWindowEnd) < new Date();
          const isDelivered = item.status === 'delivered';
          const isReturnRejected = item.status === 'return_rejected';
          const canRequestReturn = isDelivered && isReturnable && !returnAlreadyRequested && !returnExpired;

          return (
            <div key={item._id} className="card-luxe p-3 sm:p-4 flex gap-3 sm:gap-4">
              <img src={item.image || '/placeholder.png'} alt={item.name} className="w-16 h-20 sm:w-20 sm:h-24 object-cover border border-border flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product?._id}`} className="text-sm font-medium hover:text-primary line-clamp-1 block">{item.name}</Link>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                  {item.color && <span>Color: {item.color}</span>}
                  {item.size && <span>Size: {item.size}</span>}
                  {item.sku && <span>SKU: {item.sku}</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <p className="text-sm font-medium">{formatPrice(item.totalPrice)}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 border rounded ${getStatusColor(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {item.tracking?.trackingNumber && (
                  <div className="mt-2 bg-blue-50 border border-blue-100 rounded px-2.5 py-2 text-[10px] sm:text-xs text-blue-700">
                    <span className="font-medium">{item.tracking.courier || 'Courier'}:</span>{' '}
                    <span className="font-mono">{item.tracking.trackingNumber}</span>
                    {item.tracking.estimatedDelivery && <span className="ml-2">Est: {new Date(item.tracking.estimatedDelivery).toLocaleDateString()}</span>}
                  </div>
                )}
                {item.shippedAt && (
                  <p className="text-[10px] text-gray-400 mt-1">Shipped: {new Date(item.shippedAt).toLocaleString()}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {canReview && reviewMap[item._id] ? (
                    <button onClick={() => setViewingReview(reviewMap[item._id])} className="text-xs text-green-600 border border-green-600 px-2.5 py-1.5 min-h-[32px] rounded hover:bg-green-50 transition-colors">
                      View Review
                    </button>
                  ) : canReview && (
                    <button onClick={() => setReviewItem(item)} className="text-xs text-primary border border-primary px-2.5 py-1.5 min-h-[32px] rounded hover:bg-primary hover:text-white transition-colors">
                      Write Review
                    </button>
                  )}
                  {canRequestReturn && (
                    <button onClick={() => { setReturnForm({ itemId: item._id, reason: '', details: '', images: [] }); setShowReturn(true); }} className="text-xs text-orange-600 border border-orange-600 px-2.5 py-1.5 min-h-[32px] rounded hover:bg-orange-50 transition-colors">
                      Request Return
                    </button>
                  )}
                </div>
                {isReturnRejected ? (
                  <span className="text-[10px] text-red-500 mt-1 block">Return rejected</span>
                ) : !isReturnable || (!isDelivered && terminalStatuses.includes(item.status)) ? (
                  <span className="text-[10px] text-gray-400 mt-1 block">Not returnable</span>
                ) : !isDelivered ? (
                  <span className="text-[10px] text-gray-400 mt-1 block">Returnable after delivery</span>
                ) : returnAlreadyRequested ? (
                  <span className="text-[10px] text-blue-600 mt-1 block">Return already requested</span>
                ) : returnExpired ? (
                  <span className="text-[10px] text-red-500 mt-1 block">Return window expired</span>
                ) : (
                  <span className="text-[10px] text-green-600 mt-1 block">
                    Returnable{order.returnWindowEnd ? ` until ${new Date(order.returnWindowEnd).toLocaleDateString()}` : ''}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Info */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="card-luxe p-3 sm:p-4">
          <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p>{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>
        <div className="card-luxe p-3 sm:p-4">
          <h4 className="text-sm font-medium mb-2">Order Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-2"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.shipping > 0 && <div className="flex justify-between gap-2"><span className="text-gray-500">Shipping</span><span>{formatPrice(order.shipping)}</span></div>}
            {order.discount > 0 && <div className="flex justify-between gap-2"><span className="text-gray-500">Discount</span><span className="text-green-600">-{formatPrice(order.discount)}</span></div>}
            {order.tax > 0 && <div className="flex justify-between gap-2"><span className="text-gray-500">Tax</span><span>{formatPrice(order.tax)}</span></div>}
          <div className="flex justify-between gap-2 font-medium border-t border-border pt-1 mt-1"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
              <div className="mt-2 pt-2 border-t border-border text-xs text-gray-500">
                <p className="capitalize">Payment: {order.payment?.method || order.paymentMethod || 'N/A'} — {order.payment?.status || order.paymentStatus || 'N/A'}</p>
              </div>
            </div>
      </div>

      {/* Cancel Button */}
      {canCancel && (
        <div className="mt-6">
          {!showCancel ? (
            <button onClick={() => setShowCancel(true)} className="w-full sm:w-auto text-sm text-red-600 border border-red-600 px-4 py-2.5 min-h-[44px] rounded hover:bg-red-50 transition-colors">Cancel Order</button>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded">
              <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation" className="input-luxe text-sm flex-1 min-h-[44px]" autoFocus />
              <div className="flex gap-2">
                <button onClick={handleCancel} disabled={cancelling} className="btn-danger text-sm min-h-[44px] px-4 flex-1 sm:flex-none">{cancelling ? '...' : 'Confirm'}</button>
                <button onClick={() => setShowCancel(false)} className="text-sm text-gray-600 border border-border px-4 min-h-[44px] rounded hover:bg-white flex-1 sm:flex-none">Back</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal (write) */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4" onClick={() => setReviewItem(null)}>
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-2 sm:mx-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm sm:text-base truncate pr-2">Review: {reviewItem.name}</h3>
              <button onClick={() => setReviewItem(null)} className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center text-xl flex-shrink-0">&times;</button>
            </div>
            <ReviewForm onSubmit={submitReview} loading={submittingReview} />
          </div>
        </div>
      )}

      {/* Review Modal (view) */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4" onClick={() => setViewingReview(null)}>
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-2 sm:mx-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm sm:text-base truncate pr-2">{viewingReview.product?.title || 'Review'}</h3>
              <button onClick={() => setViewingReview(null)} className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center text-xl flex-shrink-0">&times;</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-5 h-5 ${s <= viewingReview.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              {viewingReview.title && <p className="font-semibold text-sm">{viewingReview.title}</p>}
              {viewingReview.comment && <p className="text-sm text-gray-600">{viewingReview.comment}</p>}
              {viewingReview.images?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {viewingReview.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-16 h-16 object-cover border border-border rounded" />
                  ))}
                </div>
              )}
              <p className="text-[10px] text-gray-400">{new Date(viewingReview.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturn && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowReturn(false)}>
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-2 sm:mx-0" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Request Return</h3>
            <form onSubmit={handleReturnRequest} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Reason *</label>
                <select value={returnForm.reason} onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required>
                  <option value="">Select reason</option>
                  <option value="size_issue">Size issue</option>
                  <option value="defective">Defective/Damaged</option>
                  <option value="not_as_described">Not as described</option>
                  <option value="wrong_item">Wrong item received</option>
                  <option value="quality_issue">Quality issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Details</label>
                <textarea value={returnForm.details} onChange={e => setReturnForm({ ...returnForm, details: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px]" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" loading={returning} className="w-full sm:w-auto">Submit Request</Button>
                <button type="button" onClick={() => setShowReturn(false)} className="w-full sm:w-auto px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <InvoiceModal data={invoiceData} loading={invoiceLoading} onClose={() => setInvoiceData(null)} />
    </div>
  );
};

export default OrderDetail;
