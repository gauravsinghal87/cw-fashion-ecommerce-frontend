import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { get, post, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { addToCartThunk } from '../../store/cartSlice';
import { addWishlistItem, removeWishlistItem } from '../../store/wishlistSlice';
import toast from 'react-hot-toast';
import { formatPrice, calculateDiscount } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/product/ProductCard';
import ReviewCard from '../../components/review/ReviewCard';
import ReviewForm from '../../components/review/ReviewForm';

const COLOR_MAP = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', orange: '#f97316',
  purple: '#a855f7', pink: '#ec4899', brown: '#a16207', black: '#171717', white: '#f5f5f5',
  gray: '#6b7280', grey: '#6b7280', navy: '#1e3a5f', maroon: '#800000', teal: '#0d9488',
  indigo: '#4f46e5', violet: '#7c3aed', cyan: '#06b6d4', lime: '#84cc16', amber: '#d97706',
  rose: '#f43f5e', emerald: '#10b981', sky: '#0ea5e9', gold: '#d4a017', silver: '#c0c0c0',
};

function getColorHex(color) {
  const c = (color || '').trim().toLowerCase();
  if (COLOR_MAP[c]) return COLOR_MAP[c];
  if (/^#[0-9a-f]{3,6}$/i.test(c)) return c;
  return null;
}

function isLightColor(hex) {
  if (!hex) return false;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSort, setReviewSort] = useState('latest');
  const [reviewFilter, setReviewFilter] = useState({});
  const [purchasedItem, setPurchasedItem] = useState(null);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({ sort: reviewSort, ...reviewFilter });
      const { data } = await get(`${API.PRODUCTS.REVIEWS(id)}?${params}`);
      setReviews(data.reviews || []);
      setReviewStats(data.stats);
    } catch {}
  };

  const { colors, sizes, variantMap, sizeMap, selectedVariant } = useMemo(() => {
    const all = product?.variants?.filter(v => v.isActive) || [];
    const colorSet = new Set();
    const sizeSet = new Set();
    const colorMap = {};
    const sizeOnlyMap = {};
    all.forEach(v => {
      if (v.color) {
        if (!colorMap[v.color]) colorMap[v.color] = {};
        if (v.size) colorMap[v.color][v.size] = v;
        else colorMap[v.color]._base = v;
        colorSet.add(v.color);
      }
      if (v.size) {
        sizeSet.add(v.size);
        if (!v.color) sizeOnlyMap[v.size] = v;
      }
    });
    const cols = Array.from(colorSet);
    const sizs = Array.from(sizeSet);
    let variant = null;
    if (selectedColor && selectedSize && colorMap[selectedColor]?.[selectedSize]) {
      variant = colorMap[selectedColor][selectedSize];
    } else if (selectedColor && !sizs.length && colorMap[selectedColor]?._base) {
      variant = colorMap[selectedColor]._base;
    } else if (!cols.length && selectedSize && sizeOnlyMap[selectedSize]) {
      variant = sizeOnlyMap[selectedSize];
    }
    return { colors: cols, sizes: sizs, variantMap: colorMap, sizeMap: sizeOnlyMap, selectedVariant: variant };
  }, [product, selectedColor, selectedSize]);

  const allImages = useMemo(() => {
    const prodImgs = product?.images || [];
    if (!selectedColor) return prodImgs;
    const colorVariants = Object.values(variantMap[selectedColor] || {}).filter(v => typeof v === 'object' && v.images?.length > 0);
    const variantImgs = colorVariants.flatMap(v => v.images);
    if (variantImgs.length === 0) return prodImgs;
    const seen = new Set(variantImgs.map(i => i.url));
    return [...variantImgs, ...prodImgs.filter(i => !seen.has(i.url))];
  }, [product, selectedColor, variantMap]);

  useEffect(() => {
    if (allImages.length > 0 && activeImage >= allImages.length) setActiveImage(0);
  }, [allImages.length, activeImage]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await get(API.PRODUCTS.DETAIL(id));
        setProduct(data.product);
        const [rel] = await Promise.all([
          get(API.PRODUCTS.RELATED(id)),
          fetchReviews(),
        ]);
        setRelated(rel.data.products || []);
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    const findPurchase = async () => {
      try {
        const { data } = await get('/orders', { limit: 100 });
        for (const order of (data.orders || [])) {
          const item = order.items?.find(i => i.product?.toString() === id && i.status === 'delivered');
          if (item) { setPurchasedItem({ orderId: order._id, orderItemId: item._id }); break; }
        }
      } catch {}
    };
    findPurchase();
  }, [user, id]);

  useEffect(() => { fetchReviews(); }, [reviewSort, reviewFilter]);

  const submitReview = async (formData) => {
    if (!purchasedItem) { toast.error('You can only review purchased products'); return; }
    setSubmittingReview(true);
    try {
      await post(API.REVIEWS.CREATE, { productId: id, orderId: purchasedItem.orderId, orderItemId: purchasedItem.orderItemId, ...formData });
      toast.success('Review submitted');
      setShowReviewForm(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const addToCart = async () => {
    if (colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if ((selectedColor || selectedSize) && !selectedVariant) {
      toast.error('Selected combination is not available');
      return;
    }
    if (selectedVariant && quantity > (selectedVariant.stock ?? 0)) {
      toast.error(`Only ${selectedVariant.stock} units available`);
      return;
    }
    try {
      await dispatch(addToCartThunk({ productId: id, variantId: selectedVariant?._id, quantity, color: selectedColor, size: selectedSize })).unwrap();
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const isInWishlist = wishlistItems.some(wId => wId?.toString() === id);

  const toggleWishlist = async () => {
    try {
      if (isInWishlist) {
        const { data } = await del(API.USERS.WISHLIST_ITEM(id));
        dispatch(removeWishlistItem(id));
        toast.success('Removed from wishlist');
      } else {
        const { data } = await post(API.USERS.WISHLIST_ITEM(id));
        dispatch(addWishlistItem(id));
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-3 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          <div className="aspect-[4/5] skeleton w-full lg:w-2/5" />
          <div className="space-y-4 w-full lg:w-3/5">
            <div className="h-8 skeleton w-3/4" />
            <div className="h-4 skeleton w-1/2" />
            <div className="h-20 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto text-center"><p className="text-gray-500">Product not found</p></div>;
  }

  const displayPrice = (product.isFlashSale && product.flashSalePrice) ? product.flashSalePrice : (selectedVariant?.price || product.minPrice);
  const discount = calculateDiscount(product.mrp || product.maxPrice, displayPrice);
  const hasReviewed = reviews.some(r => r.user?._id?.toString() === user?._id?.toString());

  return (
    <div className="min-h-screen py-3 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
        {/* Image Gallery */}
        <div className="w-full lg:w-2/5">
          <div className="aspect-[4/5] bg-gray-50 border border-border overflow-hidden mb-2 sm:mb-3">
            <img src={allImages[activeImage]?.url || product.images?.[0]?.url || ''} alt={product.title} className="w-full h-full object-cover transition-all duration-300" />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-10 h-12 sm:w-14 sm:h-[60px] border flex-shrink-0 overflow-hidden ${activeImage === i ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4 sm:space-y-6 w-full lg:w-3/5">
          <div>
            {product.brand && <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.brand.name}</p>}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold leading-tight">{product.title}</h1>
            {reviewStats && reviewStats.numRatings > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-600 text-lg">{'★'.repeat(Math.round(reviewStats.averageRating))}</span>
                <span className="text-sm text-gray-500">{reviewStats.averageRating.toFixed(1)} ({reviewStats.numRatings} reviews)</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-semibold">{formatPrice(displayPrice)}</span>
            {(selectedVariant?.mrp || product.mrp || product.maxPrice) > displayPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(selectedVariant?.mrp || product.mrp || product.maxPrice)}</span>
            )}
            {discount > 0 && <span className="text-sm text-danger font-medium">{discount}% OFF</span>}
          </div>

          {/* Delivery & Returns */}
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <span className="text-xs font-medium text-gray-700">Delivery</span>
              </div>
              <p className="text-xs text-gray-500">Estimated delivery in 7-10 business days</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                <span className="text-xs font-medium text-gray-700">Returns</span>
              </div>
              {product.isReturnable && product.returnPolicy !== 'no_return' ? (
                <p className="text-xs text-green-600 font-medium">Returnable within {product.returnWindow || 7} days</p>
              ) : (
                <p className="text-xs text-red-500 font-medium">Not returnable</p>
              )}
            </div>
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2.5">Color: <span className="text-gray-500 font-normal">{selectedColor || 'Select'}</span></h3>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => {
                  const hex = getColorHex(c);
                  const isSelected = selectedColor === c;
                  const colorVariants = Object.values(variantMap[c] || {}).filter(v => typeof v === 'object');
                  const hasStock = colorVariants.length === 0 || colorVariants.some(v => (v.stock ?? 0) > 0);
                  return (
                    <button key={c} onClick={() => { if (hasStock) { setSelectedColor(c); setSelectedSize(null); setActiveImage(0); } }}
                      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-150 flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110' :
                        hasStock ? 'ring-1 ring-gray-200 hover:ring-gray-400' : 'ring-1 ring-gray-100 opacity-40 cursor-not-allowed'
                      }`}
                      title={hasStock ? c : `${c} (out of stock)`}>
                      {hex ? (
                        <span className="w-full h-full rounded-full" style={{ backgroundColor: hex }} />
                      ) : (
                        <span className="text-[9px] font-bold uppercase text-gray-600">{c.charAt(0)}</span>
                      )}
                      {isSelected && (
                        <span className={`absolute inset-0 flex items-center justify-center ${hex && isLightColor(hex) ? 'text-black' : 'text-white'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                      {!hasStock && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gray-300 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2.5">Size: <span className="text-gray-500 font-normal">{selectedSize || (colors.length > 0 && !selectedColor ? 'Select color first' : 'Select')}</span></h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const needsColor = colors.length > 0;
                  let variant = null;
                  if (needsColor) {
                    variant = selectedColor ? variantMap[selectedColor]?.[s] : null;
                  } else {
                    variant = sizeMap[s] || null;
                  }
                  const inStock = variant ? (variant.stock ?? 0) > 0 : false;
                  const exists = !!variant;
                  const canBeSelected = !needsColor || (selectedColor && exists && inStock);
                  const isSelected = selectedSize === s;
                  return (
                    <button key={s} disabled={!canBeSelected} onClick={() => { if (canBeSelected) setSelectedSize(s); }}
                      className={`px-4 py-2.5 text-sm border min-w-[48px] min-h-[44px] transition-all duration-150 relative ${
                        isSelected ? 'border-primary bg-primary text-white font-medium' :
                        canBeSelected ? 'border-border hover:border-primary hover:bg-gray-50' :
                        'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                      }`}>
                      {s}
                      {needsColor && selectedColor && variant && !inStock && <span className="absolute -top-1.5 -right-1.5 text-[7px] bg-gray-200 text-gray-400 px-1 rounded">0</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex border border-border min-h-[40px] sm:min-h-[44px]">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2.5 sm:px-4 py-2 sm:py-2 hover:bg-gray-50 text-sm min-w-[40px] sm:min-w-[44px] flex items-center justify-center">-</button>
              <span className="px-3 sm:px-4 py-2 text-sm border-x border-border min-w-[40px] sm:min-w-[44px] text-center flex items-center justify-center select-none">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="px-2.5 sm:px-4 py-2 sm:py-2 hover:bg-gray-50 text-sm min-w-[40px] sm:min-w-[44px] flex items-center justify-center">+</button>
            </div>
            <Button onClick={addToCart} size="lg" className="flex-1 min-h-[44px] sm:min-h-[48px] text-sm">Add to Cart</Button>
            <button onClick={toggleWishlist} className={`p-2.5 sm:p-4 border transition-colors min-h-[44px] sm:min-h-[48px] min-w-[44px] sm:min-w-[48px] flex items-center justify-center flex-shrink-0 ${isInWishlist ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100' : 'border-border hover:border-primary hover:text-primary'}`}>
              <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {(product.weight || selectedVariant?.weight) && (
            <div className="border-t border-border pt-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p className="text-gray-500">Weight: <span className="font-medium text-gray-700">{(selectedVariant?.weight || product.weight)} g</span></p>
                {selectedVariant?.sku && <p className="text-gray-500">SKU: <span className="font-medium text-gray-700">{selectedVariant.sku}</span></p>}
              </div>
            </div>
          )}

          {product.vendor && (
            <div className="border-t border-border pt-5">
              <p className="text-sm text-gray-500">Sold by <Link to={`/store/${product.vendor._id}`} className="text-primary font-medium hover:underline">{product.vendor.storeName}</Link></p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-8 sm:mt-12 lg:mt-16" id="reviews">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-display font-semibold">Customer Reviews</h2>
          {user && !hasReviewed && purchasedItem && (
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors min-h-[44px]">
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
          <div className="w-full lg:w-2/3">
            {reviewStats && reviewStats.total > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 p-4 bg-gray-50 rounded">
                <div className="text-center flex-shrink-0">
                  <div className="text-3xl font-bold">{reviewStats.averageRating.toFixed(1)}</div>
                  <div className="text-yellow-400 text-sm">{'★'.repeat(Math.round(reviewStats.averageRating))}</div>
                  <div className="text-xs text-gray-400">{reviewStats.numRatings} reviews</div>
                </div>
                <div className="flex-1 w-full space-y-1">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-right">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${reviewStats.total ? (reviewStats[star] || 0) / reviewStats.total * 100 : 0}%` }} />
                      </div>
                      <span className="w-8 text-gray-400">{reviewStats[star] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {['Latest', 'Highest Rating', 'Lowest Rating'].map(label => {
                const val = label === 'Latest' ? 'latest' : label === 'Highest Rating' ? 'highest' : 'lowest';
                return (
                  <button key={val} onClick={() => setReviewSort(val)} className={`text-xs px-3 py-1.5 min-h-[32px] rounded-full transition-colors ${reviewSort === val ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
                );
              })}
              <button onClick={() => setReviewFilter(prev => ({ ...prev, hasMedia: prev.hasMedia ? '' : 'true' }))} className={`text-xs px-3 py-1.5 min-h-[32px] rounded-full transition-colors ${reviewFilter.hasMedia === 'true' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>With Photos</button>
              <button onClick={() => setReviewFilter(prev => ({ ...prev, verified: prev.verified ? '' : 'true' }))} className={`text-xs px-3 py-1.5 min-h-[32px] rounded-full transition-colors ${reviewFilter.verified === 'true' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Verified</button>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <ReviewCard key={r._id} review={r} currentUserId={user?._id} onUpdate={() => fetchReviews()} />
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/3">
            {showReviewForm && (
              <div className="card-luxe p-4 sm:p-6 sticky top-20">
                <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Write a Review</h3>
                <ReviewForm onSubmit={submitReview} loading={submittingReview} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-6 sm:mt-10 lg:mt-12">
          <h2 className="text-base sm:text-xl font-display font-semibold mb-3 sm:mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
