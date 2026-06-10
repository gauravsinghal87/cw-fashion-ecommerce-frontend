import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import ProductCard from '../../components/product/ProductCard';

const StorePage = () => {
  const { vendorId } = useParams();
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [vendorId]);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      loadingRef.current = true;
      if (page === 1) setLoading(true);
      try {
        const { data } = await get(API.PRODUCTS.VENDOR(vendorId), { page, limit: 20 });
        if (cancelled) return;
        setProducts(prev => page === 1 ? (data.products || []) : [...prev, ...(data.products || [])]);
        setHasMore(page < (data.pagination?.totalPages || 1));
        if (page === 1 && data.products?.length) setVendor(data.products[0].vendor);
      } catch (err) { console.error(err); }
      finally {
        if (!cancelled) { loadingRef.current = false; setLoading(false); }
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [vendorId, page]);

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

  if (loading && products.length === 0) return <div className="container-luxe min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">{[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)}</div></div>;

  return (
    <div className="container-luxe min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8 lg:mb-10">
        {vendor && (
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 mb-2">
            {vendor.storeLogo?.url && <img src={vendor.storeLogo.url} alt="" className="w-14 h-14 rounded-full object-cover border border-border" />}
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">{vendor.storeName}</h1>
              {vendor.storeRating > 0 && <p className="text-sm text-gray-500">{vendor.storeRating.toFixed(1)} ★ ({vendor.totalRatings} ratings)</p>}
            </div>
          </div>
        )}
        {vendor?.storeDescription && <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xl text-center sm:text-left">{vendor.storeDescription}</p>}
      </div>

      {products.length === 0 && !loading ? (
        <p className="text-center text-gray-500 py-10 px-4">No products from this vendor yet</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          {loading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
          {hasMore && <div ref={sentinelRef} className="h-4" />}
          {!hasMore && products.length > 0 && <p className="text-center text-xs text-gray-400 py-6">All products loaded</p>}
        </>
      )}
    </div>
  );
};

export default StorePage;
