import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { get, post, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeCoupon } from '../../store/cartSlice';
import { formatPrice } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/product/ProductCard';

const COLOR_MAP = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', orange: '#f97316',
  purple: '#a855f7', pink: '#ec4899', brown: '#a16207', black: '#171717', white: '#f5f5f5',
  gray: '#6b7280', grey: '#6b7280', navy: '#1e3a5f', maroon: '#800000', teal: '#0d9488',
  indigo: '#4f46e5', violet: '#7c3aed', cyan: '#06b6d4', lime: '#84cc16', amber: '#d97706',
  rose: '#f43f5e', emerald: '#10b981', sky: '#0ea5e9', gold: '#d4a017', silver: '#c0c0c0',
};
function getColorHex(c) {
  const color = (c || '').trim().toLowerCase();
  if (COLOR_MAP[color]) return COLOR_MAP[color];
  if (/^#[0-9a-f]{3,6}$/i.test(color)) return color;
  return c || null;
}
const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, coupon, shippingInfo } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);

  useEffect(() => { if (isAuthenticated) dispatch(fetchCart()); }, [dispatch, isAuthenticated]);

  const fetchRecommended = useCallback(async () => {
    try {
      const { data } = await get(API.PRODUCTS.FEATURED, { limit: 4 });
      setRecommended(data.products?.slice(0, 4) || []);
    } catch {}
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await get(API.COUPONS.AVAILABLE);
      setAllCoupons(data.coupons || []);
    } catch {}
  }, []);

  useEffect(() => { fetchRecommended(); fetchCoupons(); }, [fetchRecommended, fetchCoupons]);

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const shipping = shippingInfo?.estimatedShipping ?? (subtotal >= 999 ? 0 : 99);
  const discount = coupon?.discount || 0;
  const total = subtotal - discount + shipping;
  const remainingForFree = shippingInfo?.remainingForFree || 0;
  const isFreeShippingEnabled = shippingInfo?.isFreeShippingEnabled ?? true;
  const freeThreshold = shippingInfo?.freeThreshold || 999;

  const updateQty = async (itemId, qty) => {
    try { await put(API.CART.ITEM(itemId), { quantity: qty }); dispatch(fetchCart()); }
    catch (err) { toast.error(err.response?.data?.message); }
  };

  const removeItem = async (itemId) => {
    try { await del(API.CART.ITEM(itemId)); dispatch(fetchCart()); }
    catch { toast.error('Failed to remove'); }
  };

  const applyCoupon = async (code) => {
    if (!code) return;
    setApplying(true);
    setCouponCode(code);
    try {
      const { data } = await post(API.CART.APPLY_COUPON, { code });
      dispatch(fetchCart());
      toast.success(data.message || 'Coupon applied');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally { setApplying(false); }
  };

  const removeCouponFn = async () => {
    try { await del(API.CART.COUPON(coupon.code)); dispatch(removeCoupon()); }
    catch { toast.error('Failed to remove coupon'); }
  };

  const clearCart = async () => {
    if (!confirm('Clear your entire cart?')) return;
    try { await del(API.CART.CLEAR); dispatch(fetchCart()); toast.success('Cart cleared'); }
    catch { toast.error('Failed to clear cart'); }
  };

  const formatCouponValue = (c) => {
    if (c.type === 'percentage') return `${c.value}% off${c.maxDiscount ? ` (up to ₹${c.maxDiscount})` : ''}`;
    if (c.type === 'fixed') return `₹${c.value} off`;
    if (c.type === 'free_shipping') return 'Free shipping';
    return '';
  };
  const getApplicableLabel = (c) => {
    if (c.isFirstOrderOnly) return 'First order only';
    if (c.applicableOn === 'all') return 'All items';
    if (c.applicableOn === 'category') return 'Specific categories';
    if (c.applicableOn === 'brand') return 'Specific brands';
    if (c.applicableOn === 'vendor') return 'Specific vendors';
    if (c.applicableOn === 'product') return 'Specific products';
    return '';
  };
  const isFullyRedeemed = (c) => c.usageLimit > 0 && c.usedCount >= c.usageLimit;
  const isExpired = (c) => new Date(c.endDate) < new Date();
  const isExpiringSoon = (c) => {
    const diff = new Date(c.endDate) - new Date();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  };
  const daysLeft = (c) => {
    const diff = new Date(c.endDate) - new Date();
    if (diff <= 0) return 'Expired';
    const d = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return `${d} day${d > 1 ? 's' : ''} left`;
  };
  const getCouponBadge = (type) => {
    if (type === 'percentage') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (type === 'fixed') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (type === 'free_shipping') return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const isCouponApplicableToItem = (coupon, item) => {
    if (coupon.applicableOn === 'all') return true;
    if (!coupon.applicableIds?.length) return true;
    const prod = item.product;
    if (!prod) return false;
    return coupon.applicableIds.some(id => {
      const idStr = id.toString();
      if (coupon.applicableOn === 'category') return prod.category?._id?.toString() === idStr || prod.category?.toString() === idStr;
      if (coupon.applicableOn === 'brand') return prod.brand?._id?.toString() === idStr || prod.brand?.toString() === idStr;
      if (coupon.applicableOn === 'vendor') return item.vendor?._id?.toString() === idStr || item.vendor?.toString() === idStr;
      if (coupon.applicableOn === 'product') return prod._id?.toString() === idStr;
      return false;
    });
  };

  const itemCoupons = useMemo(() => {
    return items.map(item => {
      const applicable = allCoupons.filter(c => isCouponApplicableToItem(c, item) && !isFullyRedeemed(c) && !isExpired(c));
      return { itemId: item._id, coupons: applicable };
    });
  }, [items, allCoupons]);

  if (!isAuthenticated) {
    return <div className="container-luxe min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 text-center"><p className="text-gray-500 mb-4">Please login to view your cart</p><Link to="/login" className="btn-primary">Login</Link></div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-luxe min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
        {recommended.length > 0 && (
          <section>
            <h2 className="text-base sm:text-xl font-display font-semibold mb-3 sm:mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {recommended.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-3 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 sm:mb-6 lg:mb-8">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-display font-semibold">Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h1>
        <button onClick={clearCart} className="text-xs text-danger hover:underline min-h-[44px]">Clear Cart</button>
      </div>
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-8">
        <div className="w-full lg:w-2/3 space-y-2 sm:space-y-4">
          {items.map((item) => {
            const isReturnable = item.product?.isReturnable && item.product?.returnPolicy !== 'no_return';
            const returnDays = item.product?.returnWindow || 7;
            const itemCouponList = itemCoupons.find(ic => ic.itemId === item._id)?.coupons || [];
            return (
            <motion.div key={item._id} layout className="flex flex-row gap-2 sm:gap-4 p-2 sm:p-4 border border-border bg-white">
              <Link to={`/product/${item.product?._id}`} className="w-20 sm:w-24 h-24 sm:h-28 flex-shrink-0 bg-gray-50 border border-border overflow-hidden rounded-sm">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <Link to={`/product/${item.product?._id}`} className="text-xs sm:text-sm font-medium hover:text-gray-600 line-clamp-2 leading-snug">{item.name}</Link>
                {item.vendor && <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{item.vendor.storeName}</p>}
                {(item.color || item.size) && (
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {item.color && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                        <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: getColorHex(item.color) }} />
                        {item.color}
                      </span>
                    )}
                    {item.size && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">Size: {item.size}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs sm:text-sm font-semibold">{formatPrice(item.price)}</span>
                  {item.mrp > item.price && <span className="text-[10px] text-gray-400 line-through">{formatPrice(item.mrp)}</span>}
                </div>
                {item.product && (
                  <span className={`inline-block text-[9px] mt-0.5 px-1.5 py-0.5 rounded w-fit ${isReturnable ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                    {isReturnable ? `Returnable ${returnDays}d` : 'No returns'}
                  </span>
                )}
                {itemCouponList.length > 0 && (
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="text-[9px] text-gray-400">Offers:</span>
                    {itemCouponList.slice(0, 2).map(c => (
                      <button
                        key={c._id}
                        onClick={() => applyCoupon(c.code)}
                        disabled={applying || coupon?.code === c.code}
                        className={`text-[9px] px-1.5 py-0.5 rounded-full border transition-colors leading-tight ${
                          coupon?.code === c.code
                            ? 'bg-green-50 border-green-300 text-green-700'
                            : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                        } disabled:opacity-50`}
                      >
                        {c.code}
                      </button>
                    ))}
                    {itemCouponList.length > 2 && (
                      <span className="text-[9px] text-gray-400">+{itemCouponList.length - 2}</span>
                    )}
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between pt-1.5">
                  <div className="flex border border-border">
                    <button onClick={() => updateQty(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs hover:bg-gray-50 disabled:opacity-50">-</button>
                    <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs border-x border-border">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)} disabled={item.quantity >= 10} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs hover:bg-gray-50 disabled:opacity-50">+</button>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap"><span className="hidden sm:inline">Total: </span>{formatPrice(item.totalPrice)}</span>
                    <button onClick={() => removeItem(item._id)} className="text-[10px] text-gray-400 hover:text-danger transition-colors px-1.5 py-1 min-h-[44px] sm:min-h-0">Remove</button>
                  </div>
                </div>
              </div>
            </motion.div>
          );})}
        </div>

        <div className="w-full lg:w-96">
          <div className="card-luxe p-3 sm:p-6 space-y-3 sm:space-y-4 sticky top-24">
            {remainingForFree > 0 && isFreeShippingEnabled && (
              <div className="bg-amber-50 border border-amber-200 rounded px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-amber-800 text-center leading-snug">
                Add <span className="font-semibold">{formatPrice(remainingForFree)}</span> more for <span className="font-semibold text-success">FREE SHIPPING</span>
                <div className="w-full bg-amber-200 h-1.5 mt-1 rounded-full overflow-hidden">
                  <div className="bg-success h-full rounded-full transition-all" style={{ width: Math.min(100, ((subtotal - discount) / freeThreshold) * 100) + '%' }} />
                </div>
              </div>
            )}
            <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider">Order Summary</h3>

            {coupon?.code ? (
              <div className="bg-green-50 border border-green-200 rounded p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-semibold text-green-800">{coupon.code}</span>
                  </div>
                  <button onClick={removeCouponFn} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Remove</button>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-green-700">{formatCouponValue(coupon)}</span>
                  {discount > 0 && <span className="font-semibold text-green-700">-{formatPrice(discount)}</span>}
                </div>
              </div>
            ) : (
              <div className="flex gap-1.5 sm:gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && applyCoupon(couponCode)} placeholder="Coupon code" className="input-luxe flex-1 text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]" />
                <Button onClick={() => applyCoupon(couponCode)} variant="outline" size="sm" loading={applying} disabled={applying} className="text-xs sm:text-sm whitespace-nowrap min-h-[40px] sm:min-h-[44px]">Apply</Button>
              </div>
            )}

            {allCoupons.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-600">{coupon?.code ? 'More Coupons' : 'Available Coupons'}</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {allCoupons.map((c, idx) => {
                    const isApplied = coupon?.code === c.code;
                    const expiring = isExpiringSoon(c);
                    const redeemed = isFullyRedeemed(c);
                    const expired = isExpired(c);
                    const unavailable = redeemed || expired;
                    return (
                      <div key={c._id} className={`relative border rounded p-2.5 transition-colors ${isApplied ? 'border-green-300 bg-green-50/60' : unavailable ? 'border-gray-100 bg-gray-50/50 opacity-60' : 'border-gray-200 hover:border-accent/40'}`}>
                        {isApplied && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full font-medium">Applied</span>
                        )}
                        {redeemed && !isApplied && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full font-medium">Fully redeemed</span>
                        )}
                        {expired && !isApplied && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full font-medium">Expired</span>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-xs font-bold tracking-wider ${unavailable ? 'text-gray-400' : 'text-gray-800'}`}>{c.code}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${getCouponBadge(c.type)}`}>
                                {c.type === 'free_shipping' ? 'FREE SHIPPING' : c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                              </span>
                            </div>
                            {c.description && (
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{c.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[9px] text-gray-400">
                              {c.minAmount > 0 && <span>Min. ₹{c.minAmount}</span>}
                              {c.maxDiscount && c.type === 'percentage' && <span>Max disc. ₹{c.maxDiscount}</span>}
                              {/* {c.usageLimit > 0 && <span>{c.usedCount || 0}/{c.usageLimit} used</span>} */}
                              <span className={expiring && !unavailable ? 'text-rose-500 font-medium' : ''}>{daysLeft(c)}</span>
                              {c.isFirstOrderOnly && <span className="text-amber-600">First order</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => isApplied ? removeCouponFn() : applyCoupon(c.code)}
                            disabled={applying || unavailable}
                            className={`flex-shrink-0 text-[10px] px-2.5 py-1.5 rounded font-medium min-h-[32px] transition-colors ${
                              isApplied
                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                : unavailable
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-accent text-white hover:bg-accent/90 disabled:opacity-50'
                            }`}
                          >
                            {isApplied ? 'Remove' : applying ? '...' : unavailable ? 'Unavailable' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm border-t border-border pt-3 sm:pt-4">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-success">-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between font-semibold text-sm sm:text-base pt-1.5 sm:pt-2 border-t border-border"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>

            <Button onClick={() => navigate('/checkout')} className="w-full text-xs sm:text-sm min-h-[40px] sm:min-h-[48px]">Proceed to Checkout</Button>
          </div>
        </div>
      </div>

      {recommended.length > 0 && (
        <section className="mt-6 sm:mt-12 lg:mt-16">
          <h2 className="text-sm sm:text-xl font-display font-semibold mb-2 sm:mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {recommended.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Cart;