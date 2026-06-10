import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import ProductCard from '../../components/product/ProductCard';

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    let cancelled = false;
    const intervalRef = { current: null };
    get(API.PRODUCTS.FLASH_SALE, { limit: 50 }).then(({ data }) => {
      if (cancelled) return;
      const all = data.products || [];
      setProducts(all);
      if (all.length > 0 && all[0].flashSaleEnd) {
        const end = new Date(all[0].flashSaleEnd).getTime();
        if (!isNaN(end)) {
          const tick = () => {
            const diff = Math.max(0, end - Date.now());
            setTimeLeft({
              d: Math.floor(diff / 86400000),
              h: Math.floor((diff % 86400000) / 3600000),
              m: Math.floor((diff % 3600000) / 60000),
              s: Math.floor((diff % 60000) / 1000),
            });
          };
          tick();
          intervalRef.current = setInterval(tick, 1000);
        }
      }
    }).catch(err => console.error(err)).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (loading) {
    return (
      <div className="container-luxe min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxe min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 md:mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-red-600 text-sm tracking-[0.2em] uppercase font-semibold">Limited Time</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-1">Flash Sale</h1>
            <p className="text-sm text-gray-500 mt-2">Hurry! These deals won't last long.</p>
          </div>
          {timeLeft.d !== undefined && (
            <div className="flex gap-2 sm:gap-3">
              {[
                { label: 'Days', val: timeLeft.d },
                { label: 'Hours', val: timeLeft.h },
                { label: 'Minutes', val: timeLeft.m },
                { label: 'Seconds', val: timeLeft.s },
              ].map((t) => (
                <div key={t.label} className="text-center">
                  <div className="bg-primary text-white text-xl sm:text-2xl font-bold px-3 py-2 min-w-[52px]">{String(t.val).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{t.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {products.length === 0 ? (
        <div className="text-center py-16 sm:py-24">
          <p className="text-gray-400 text-sm sm:text-base">No flash sale products available right now.</p>
          <p className="text-xs text-gray-400 mt-2">Check back soon for new deals!</p>
          <Link to="/products" className="inline-block mt-6 btn-primary px-8 py-3 text-sm min-h-[48px]">Browse Products</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{products.length} products on sale</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {products.map((product, i) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FlashSale;
