import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { get, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { fetchWishlist, removeWishlistItem, clearWishlist } from '../../store/wishlistSlice';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';

const Wishlist = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get(API.USERS.WISHLIST).then(({ data }) => {
      const items = data.products || data.wishlist || [];
      setProducts(items);
      dispatch(fetchWishlist());
    }).catch(() => {}).finally(() => setLoading(false));
  }, [dispatch]);

  const removeItem = async (productId) => {
    try {
      await del(API.USERS.WISHLIST_ITEM(productId));
      setProducts(prev => prev.filter(p => (p._id || p) !== productId));
      dispatch(removeWishlistItem(productId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const clearAll = async () => {
    if (!confirm('Clear your entire wishlist?')) return;
    try {
      await del(API.USERS.WISHLIST_CLEAR);
      setProducts([]);
      dispatch(clearWishlist());
      toast.success('Wishlist cleared');
    } catch { toast.error('Failed to clear wishlist'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-6">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3"><div className="aspect-[3/4] skeleton" /><div className="h-4 skeleton w-3/4" /><div className="h-4 skeleton w-1/2" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">My Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} {products.length === 1 ? 'item' : 'items'}</p>
        </div>
        {products.length > 0 && (
          <button onClick={clearAll} className="text-xs text-danger border border-danger px-3 py-2 min-h-[44px] rounded hover:bg-red-50 transition-colors flex-shrink-0">Clear All</button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Your wishlist is empty</p>
          <p className="text-gray-400 text-xs mt-1">Save your favorite items here</p>
          <Link to="/products" className="btn-primary inline-flex items-center mt-6 px-6 py-3 text-sm min-h-[44px]">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => {
            const pid = product._id || product;
            const p = product._id ? product : null;
            return (
              <div key={pid} className="relative group">
                <button onClick={() => removeItem(pid)} className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-h-[36px] min-w-[36px]" title="Remove from wishlist">
                  <svg className="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <Link to={`/product/${pid}`} className="block">
                  <div className="aspect-[3/4] bg-gray-50 border border-border overflow-hidden">
                    <img src={p?.images?.[0]?.url || ''} alt={p?.title || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-2 space-y-1">
                    {p?.brand && <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{p.brand.name}</p>}
                    <p className="text-xs font-medium line-clamp-2">{p?.title || 'Product'}</p>
                    <p className="text-sm font-semibold">{formatPrice(p?.minPrice || 0)}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
