import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import ProductCard from '../../components/product/ProductCard';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ categories: [], brands: [] });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || '';
  const page = searchParams.get('page') || '1';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const searchParams = { page, limit: '20' };
        if (q) searchParams.q = q;
        if (category) searchParams.category = category;
        if (brand) searchParams.brand = brand;
        if (minPrice) searchParams.minPrice = minPrice;
        if (maxPrice) searchParams.maxPrice = maxPrice;
        if (sort) searchParams.sort = sort;

        const { data } = await get(API.SEARCH.SEARCH, searchParams);
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, total: 0, totalPages: 0 });
        setFilters(data.filters || { categories: [], brands: [] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [q, category, brand, minPrice, maxPrice, sort, page]);

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wider mb-3">Categories</h4>
        <div className="space-y-1">
          {filters.categories?.map((cat) => (
            <button key={cat.id} onClick={() => updateParams('category', cat.id === category ? '' : cat.id)}
              className={`block w-full text-left text-sm py-1.5 px-2 transition-colors ${cat.id === category ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}>
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium uppercase tracking-wider mb-3">Brands</h4>
        <div className="space-y-1">
          {filters.brands?.map((b) => (
            <button key={b.id} onClick={() => updateParams('brand', b.id === brand ? '' : b.id)}
              className={`block w-full text-left text-sm py-1.5 px-2 transition-colors ${b.id === brand ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}>
              {b.name} ({b.count})
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium uppercase tracking-wider mb-3">Price Range</h4>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParams('minPrice', e.target.value)} className="w-full px-2 py-1.5 border border-border text-xs" />
          <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParams('maxPrice', e.target.value)} className="w-full px-2 py-1.5 border border-border text-xs" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-luxe min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        <aside className="hidden lg:block w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterContent />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 z-40 w-full max-w-xs sm:w-72 bg-white shadow-xl lg:hidden overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-sm font-medium uppercase tracking-wider">Filters</span>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-4">
                <FilterContent />
              </div>
            </div>
          </>
        )}

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-xs border border-border px-3 py-2 hover:bg-gray-50 flex items-center gap-1.5 min-h-[44px]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Filters
              </button>
              <h1 className="text-base sm:text-xl md:text-2xl font-display font-semibold">
                {q ? `Results` : 'All Products'}
              </h1>
              <span className="text-xs text-gray-500">({pagination.total} items)</span>
            </div>
            <select value={sort} onChange={(e) => updateParams('sort', e.target.value)} className="text-sm border border-border px-3 py-2.5 sm:py-1.5 bg-white min-h-[44px] w-full sm:w-auto">
              <option value="">Sort by: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Best Selling</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2 sm:space-y-3">
                  <div className="aspect-[3/4] skeleton" /><div className="h-3 sm:h-4 skeleton w-3/4" /><div className="h-3 sm:h-4 skeleton w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 sm:py-20">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                {products.map((product) => (
                  <motion.div key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6 sm:mt-10 flex-wrap">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button key={i} onClick={() => updateParams('page', String(i + 1))}
                      className={`w-10 h-10 sm:w-8 sm:h-8 text-xs border flex items-center justify-center ${page === String(i + 1) ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
