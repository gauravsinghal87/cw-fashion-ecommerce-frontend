import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { post, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { addWishlistItem, removeWishlistItem } from '../../store/wishlistSlice';
import { formatPrice, calculateDiscount } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ProductCard = ({ product, isWishlisted: initialWishlisted }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isWishlisted = initialWishlisted !== undefined
    ? !!initialWishlisted
    : wishlistItems.includes(product?._id);

  if (!product) return null;

  const image = product.images?.[0]?.url || product.defaultImage || '';
  const mrp = product.mrp || product.maxPrice;
  const price = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : (product.minPrice || product.price || 0);
  const discount = calculateDiscount(mrp, price);
  const isOutOfStock = product.totalStock <= 0;

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await del(API.USERS.WISHLIST_ITEM(product._id));
        dispatch(removeWishlistItem(product._id));
        toast.success('Removed from wishlist', { duration: 1500 });
      } else {
        await post(API.USERS.WISHLIST_ITEM(product._id), {});
        dispatch(addWishlistItem(product._id));
        toast.success('Added to wishlist', { duration: 1500 });
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="group block w-full">
      <motion.div className="space-y-2 sm:space-y-3" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden border border-border rounded-sm">
          {image ? (
            <img
              src={image}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {discount > 0 && !isOutOfStock && (
            <span className="absolute top-2 left-2 bg-danger text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-sm shadow-sm">
              -{discount}%
            </span>
          )}

          {product.isFlashSale && !isOutOfStock && (
            <span className="absolute top-2 right-8 bg-red-600 text-white text-[8px] px-1.5 py-0.5 uppercase tracking-wider font-bold animate-pulse">
              SALE
            </span>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 bg-white px-4 py-2 border border-border">Out of Stock</span>
            </div>
          )}

          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center transition-all duration-200 rounded-full min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 ${isWishlisted ? 'text-red-500 bg-white/90' : 'text-gray-400 bg-white/70 hover:bg-white hover:text-red-400 opacity-0 group-hover:opacity-100'} shadow-sm`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white text-xs font-medium">
              {isOutOfStock ? 'Out of Stock' : 'Quick View'}
            </span>
          </div>
        </div>

        <div className="space-y-1 px-0.5">
          <h3 className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 break-words group-hover:text-gray-600 transition-colors">{product.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-primary">{formatPrice(price)}</span>
            {mrp > price && <span className="text-[10px] sm:text-xs text-gray-400 line-through">{formatPrice(mrp)}</span>}
          </div>
          <div className="flex items-center justify-between">
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-yellow-500">★</span>
                <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
                {product.numRatings > 0 && <span className="text-[10px] text-gray-400">({product.numRatings})</span>}
              </div>
            )}
            {product.totalSold > 0 && (
              <span className="text-[10px] text-gray-400">{product.totalSold}+ sold</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
