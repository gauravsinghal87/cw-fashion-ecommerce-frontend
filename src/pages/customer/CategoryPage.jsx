import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import ProductCard from '../../components/product/ProductCard';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      loadingRef.current = true;
      if (page === 1) setLoading(true);
      try {
        const { data: catData } = await get(API.CATEGORIES.BASE);
        if (cancelled) return;
        const cat = catData.categories?.find(c => c.slug === slug);
        setCategory(cat);
        if (cat) {
          const { data: prodData } = await get(API.PRODUCTS.BASE + `/category/${cat._id}`, { page, limit: 20 });
          if (cancelled) return;
          setProducts(prev => page === 1 ? (prodData.products || []) : [...prev, ...(prodData.products || [])]);
          setHasMore(page < (prodData.pagination?.totalPages || 1));
        } else {
          setHasMore(false);
        }
      } catch (err) { console.error(err); }
      finally {
        if (!cancelled) { loadingRef.current = false; setLoading(false); }
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [slug, page]);

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

  let filtered = [...products];
  if (priceRange.min !== '') filtered = filtered.filter(p => (p.variants?.[0]?.price ?? p.price ?? 0) >= Number(priceRange.min));
  if (priceRange.max !== '') filtered = filtered.filter(p => (p.variants?.[0]?.price ?? p.price ?? 0) <= Number(priceRange.max));
  if (sortBy === 'price-asc') filtered.sort((a, b) => (a.variants?.[0]?.price ?? a.price ?? 0) - (b.variants?.[0]?.price ?? b.price ?? 0));
  else if (sortBy === 'price-desc') filtered.sort((a, b) => (b.variants?.[0]?.price ?? b.price ?? 0) - (a.variants?.[0]?.price ?? a.price ?? 0));
  else if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen">
      {category?.image?.url && (
        <div className="w-full h-32 sm:h-48 md:h-64 overflow-hidden relative">
          <img src={category.image.url} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-8 left-3 sm:left-8">
            <h1 className="text-white text-2xl sm:text-4xl md:text-5xl font-display font-bold">{category.name}</h1>
            {category.description && <p className="text-white/80 text-sm mt-1 max-w-lg">{category.description}</p>}
          </div>
        </div>
      )}

      <div className="container-luxe py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {category && (
          <>
            {!category?.image?.url && <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-semibold">{category.name}</h1>}

            {category.subCategories?.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                {category.subCategories.map((sub) => (
                  <Link key={sub._id} to={`/products?category=${sub._id}`} className="shrink-0 px-4 py-2 text-xs border border-border hover:border-primary hover:bg-primary/5 transition-colors min-h-[44px] flex items-center">{sub.name}</Link>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6 mb-4">
              <p className="text-xs sm:text-sm text-gray-500">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-1 items-center">
                  <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))} className="input-luxe text-xs w-full sm:w-20 min-h-[44px]" />
                  <span className="text-gray-400">-</span>
                  <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))} className="input-luxe text-xs w-full sm:w-20 min-h-[44px]" />
                  {priceRange.min !== '' || priceRange.max !== '' ? <button onClick={() => setPriceRange({ min: '', max: '' })} className="text-xs text-primary hover:underline min-h-[44px] shrink-0">Clear</button> : null}
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-luxe text-xs min-h-[44px] w-full sm:w-auto">
                  <option value="">Sort by</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </>
        )}

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">{[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)}</div>
        ) : filtered.length === 0 && !loading ? (
          <div className="text-center py-16 sm:py-24">
            <p className="text-gray-500 text-sm">No products found</p>
            {(priceRange.min !== '' || priceRange.max !== '') && <p className="text-xs text-gray-400 mt-1">Try adjusting your price range</p>}
            <Link to="/products" className="inline-block mt-4 btn-primary px-6 py-2 text-sm min-h-[44px]">Browse All Products</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
              {filtered.map((p, i) => (
                <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
            {loading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
            {hasMore && <div ref={sentinelRef} className="h-4" />}
            {!hasMore && products.length > 0 && <p className="text-center text-xs text-gray-400 py-6">All products loaded</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
