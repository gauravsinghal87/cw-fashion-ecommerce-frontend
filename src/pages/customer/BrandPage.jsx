import { useState, useEffect, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { get } from "../../utils/apiMethods";
import { API } from "../../utils/apiPaths";
import ProductCard from "../../components/product/ProductCard";

const BrandPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [id, q]);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      loadingRef.current = true;
      if (page === 1) setLoading(true);
      try {
        const [brandRes, prodRes] = await Promise.all([
          get(`${API.BRANDS.DETAIL}/${q}`),
          get(API.SEARCH.SEARCH, { brand: id, page, limit: "20" }),
        ]);
        if (cancelled) return;
        setBrand(brandRes.data.brand);
        setProducts(prev => page === 1 ? (prodRes.data.products || []) : [...prev, ...(prodRes.data.products || [])]);
        setHasMore(page < (prodRes.data.pagination?.totalPages || 1));
      } catch {}
      finally {
        if (!cancelled) { loadingRef.current = false; setLoading(false); }
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [id, q, page]);

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

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="h-48 skeleton mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Brand not found</p>
          <Link to="/" className="text-primary hover:underline text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden bg-gray-100">
          {brand.coverImage?.url ? (
            <img
              src={brand.coverImage.url}
              alt={brand.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-6xl font-bold text-primary/20">
                {brand.name?.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 flex items-center gap-3 sm:gap-4">
            {brand.logo?.url && (
              <img
                src={brand.logo.url}
                alt={brand.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-white object-contain"
              />
            )}
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">
                {brand.name}
              </h1>
              {brand.description && (
                <p className="text-sm text-white/80 mt-1 line-clamp-2">
                  {brand.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mb-6">
        <h2 className="text-lg font-medium">{products.length} Products</h2>
      </div>

      {products.length === 0 && !loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No products found for this brand</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          {loading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
          {hasMore && <div ref={sentinelRef} className="h-4" />}
          {!hasMore && products.length > 0 && <p className="text-center text-xs text-gray-400 py-6">All products loaded</p>}
        </>
      )}
    </div>
  );
};

export default BrandPage;
