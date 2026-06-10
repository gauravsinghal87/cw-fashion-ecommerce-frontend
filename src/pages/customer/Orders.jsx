import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';

const statusFilters = ['', 'pending', 'accepted', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setHasMore(true);
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    const fetchOrders = async () => {
      loadingRef.current = true;
      if (page === 1) setLoading(true);
      try {
        const { data } = await get(API.ORDERS.BASE || '/orders', { page, limit: 10, ...(status ? { status } : {}) });
        if (cancelled) return;
        setOrders(prev => page === 1 ? (data.orders || []) : [...prev, ...(data.orders || [])]);
        setHasMore(page < (data.pagination?.totalPages || 1));
      } catch (err) { console.error(err); }
      finally {
        if (!cancelled) { loadingRef.current = false; setLoading(false); }
      }
    };
    fetchOrders();
    return () => { cancelled = true; };
  }, [status, page]);

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

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">My Orders</h1>
        <Link to="/products" className="text-sm text-primary hover:underline min-h-[44px] flex items-center">Continue Shopping</Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0">
        {statusFilters.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 sm:px-4 py-2 text-xs border rounded-full whitespace-nowrap flex-shrink-0 transition-colors min-h-[40px] ${
              status === s ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary text-gray-600'
            }`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <p className="text-gray-500 mb-4">No orders found</p>
          <Link to="/products" className="inline-block px-6 py-2.5 text-sm bg-primary text-white hover:bg-primary-dark transition-colors min-h-[44px] leading-[44px]">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="block card-luxe p-3 sm:p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-gray-400">#{order.orderNumber}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 border rounded whitespace-nowrap ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {order.items?.map((item) => (
                    <div key={item._id} className="flex gap-3 py-2 first:pt-0 last:pb-0">
                      <img src={item.image || '/placeholder.png'} alt="" className="w-14 h-16 sm:w-16 sm:h-18 object-cover border border-border rounded flex-shrink-0" />
                      <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                        <p className="text-xs sm:text-sm font-medium truncate">{item.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] sm:text-xs text-gray-500">
                          {item.color && <span>Color: {item.color}</span>}
                          {item.size && <span>Size: {item.size}</span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-1.5 py-0.5 border rounded ${getStatusColor(item.status)}`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-medium">{formatPrice(item.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {order.shippingAddress?.city && (
                  <div className="mt-2 pt-2 border-t border-border text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                    <span>&#x1F4CD;</span> {order.shippingAddress.city}
                  </div>
                )}
              </Link>
            ))}
          </div>
          {loading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
          {hasMore && <div ref={sentinelRef} className="h-4" />}
          {!hasMore && orders.length > 0 && <p className="text-center text-xs text-gray-400 py-6">All orders loaded</p>}
        </>
      )}
    </div>
  );
};

export default Orders;
