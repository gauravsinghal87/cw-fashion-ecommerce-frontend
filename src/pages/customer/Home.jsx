import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { get } from "../../utils/apiMethods";
import { API } from "../../utils/apiPaths";
import ProductCard from "../../components/product/ProductCard";
import { formatPrice } from "../../utils/helpers";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          featRes,
          newRes,
          bestRes,
          trendRes,
          flashRes,
          catRes,
          brandRes,
          banRes,
        ] = await Promise.all([
          get(API.PRODUCTS.FEATURED).catch(() => ({ data: { products: [] } })),
          get(API.PRODUCTS.NEW_ARRIVALS).catch(() => ({
            data: { products: [] },
          })),
          get(API.PRODUCTS.BEST_SELLERS).catch(() => ({
            data: { products: [] },
          })),
          get(API.PRODUCTS.TRENDING).catch(() => ({ data: { products: [] } })),
          get(API.PRODUCTS.FLASH_SALE).catch(() => ({
            data: { products: [] },
          })),
          get(API.CATEGORIES.BASE).catch(() => ({ data: { categories: [] } })),
          get(API.BRANDS.BASE).catch(() => ({ data: { brands: [] } })),
          get(API.BANNERS.BASE).catch(() => ({ data: { banners: [] } })),
        ]);
        setFeatured(featRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
        setBestSellers(bestRes.data.products || []);
        setTrending(trendRes.data.products || []);
        setFlashSales(flashRes.data.products || []);
        setCategories(catRes.data.categories || []);
        setBrands(brandRes.data.brands || []);
        setBanners(banRes.data.banners || []);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!flashSales.length || !flashSales[0].flashSaleEnd) return;
    const end = new Date(flashSales[0].flashSaleEnd).getTime();
    if (isNaN(end)) return;
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, end - now);
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [flashSales]);

  const nextBanner = useCallback(() => {
    if (banners.length > 1) setBannerIdx((i) => (i + 1) % banners.length);
  }, [banners.length]);

  const prevBanner = useCallback(() => {
    if (banners.length > 1)
      setBannerIdx((i) => (i - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(nextBanner, 5000);
    return () => clearInterval(id);
  }, [banners.length, nextBanner]);

  if (loading) {
    return (
      <div className="container-luxe min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] skeleton" />
              <div className="h-4 skeleton w-3/4" />
              <div className="h-4 skeleton w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  return (
    <div>
      {/* Banners Carousel — full width */}
      {banners.length > 0 && (
        <section className="w-full">
          <div className="relative overflow-hidden" style={{ height: "clamp(200px, 40vw, 450px)" }}>
            <AnimatePresence mode="wait">
              {banners.map((b, i) =>
                i === bannerIdx ? (
                  <motion.a
                    key={b._id}
                    href={b.link || "#"}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="block absolute inset-0 w-full h-full"
                  >
                    <img
                      src={b.image?.url || b.image}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                      <div className="px-4 sm:px-8 md:px-12 max-w-6xl mx-auto w-full">
                        <h3 className="text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold">
                          {b.title}
                        </h3>
                        {b.subtitle && (
                          <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-md">
                            {b.subtitle}
                          </p>
                        )}
                        {b.link && (
                          <span className="inline-block text-xs text-white border border-white px-4 py-2 hover:bg-white hover:text-primary transition-colors min-h-[36px]">
                            Shop Now
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.a>
                ) : null,
              )}
            </AnimatePresence>
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 z-10"
                >
                  &lsaquo;
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 z-10"
                >
                  &rsaquo;
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setBannerIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === bannerIdx ? "bg-white" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Flash Sale */}
      {flashSales.length > 0 && (
        <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-r from-red-50 via-red-100 to-red-50">
          <div className="container-luxe">
            <motion.div
              {...fadeUp}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4"
            >
              <div>
                <span className="text-red-600 text-sm tracking-[0.2em] uppercase font-semibold">
                  Flash Sale
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold">
                  Limited Time Offers
                </h2>
              </div>
              <Link 
                to="/flash-sale"
                className="text-sm font-medium text-red-600 hover:underline whitespace-nowrap flex sm:flex-col-reverse  items-center gap-2"

              >
                 {timeLeft.h !== undefined && (
              <div className="flex items-center gap-3 mb-6 bg-red-600/10 rounded-lg px-4 py-2 sm:px-5 sm:py-2.5 w-fit">
                <span className="text-xs sm:text-sm font-semibold text-red-700 uppercase tracking-wider">Ends in</span>
                <div className="flex gap-1.5 sm:gap-2">
                  {[
                    { label: "Hrs", val: timeLeft.h },
                    { label: "Min", val: timeLeft.m },
                    { label: "Sec", val: timeLeft.s },
                  ].map((t) => (
                    <div key={t.label} className="text-center">
                      <div className="bg-red-600 text-white text-sm sm:text-base font-bold px-2 py-0.5 min-w-[36px] sm:min-w-[40px] rounded">
                        {String(t.val).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] text-red-500 mt-0.5">
                        {t.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
                <div className="flex"><span>View All</span>
                <span>&rarr;</span></div>
              </Link>
            </motion.div>
           
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              {flashSales.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories — Marquee */}
      {categories.length > 0 && (
        <section className="py-6 sm:py-8 md:py-12 overflow-hidden">
          <motion.div
            {...fadeUp}
            className="container-luxe flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6 sm:mb-8"
          >
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <div className="divider" />
            </div>
            <Link to="/products" className="text-xs text-primary hover:underline font-medium shrink-0 min-h-[36px] flex items-center">
              View All Categories &rarr;
            </Link>
          </motion.div>
          <div className="relative">
            <div className="flex gap-4 sm:gap-6 animate-marquee hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
              {[...categories, ...categories].map((cat, i) => (
                <Link
                  key={`${cat._id}-${i}`}
                  to={`/category/${cat.slug}`}
                  className="group block card-luxe p-3 sm:p-4 text-center hover:border-primary transition-colors flex-shrink-0 w-[120px] sm:w-[140px]"
                >
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-50 mx-auto mb-2 sm:mb-3 flex items-center justify-center overflow-hidden rounded-full">
                    {cat.image?.url ? (
                      <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-base sm:text-xl font-display text-gray-400">{cat.name[0]}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-[10px] sm:text-xs truncate">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-6 sm:py-8 md:py-12 bg-white">
          <div className="container-luxe">
            <motion.div
              {...fadeUp}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6 sm:mb-8"
            >
              <div>
                <h2 className="section-title">Featured Products</h2>
                <div className="divider" />
              </div>
              <Link
                to="/products?sort=popular"
                className="text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              {featured.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Trending */}
      {trending.length > 0 && (
        <section className="py-6 sm:py-8 md:py-12 bg-white">
          <div className="container-luxe">
            <motion.div
              {...fadeUp}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6 sm:mb-8"
            >
              <div>
                <h2 className="section-title">Trending Now</h2>
                <div className="divider" />
              </div>
              <Link
                to="/products?sort=trending"
                className="text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              {trending.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Flash Sale Banner */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-r from-red-600 via-red-700 to-rose-800 text-white">
        <motion.div {...fadeUp} className="container-luxe text-center">
          <span className="text-yellow-300 text-sm tracking-[0.2em] uppercase font-semibold">
            ⚡ Flash Sale
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4">
            Up to 60% Off
          </h2>
          <p className="text-white/80 mt-4 text-sm sm:text-base max-w-lg mx-auto">
            Limited time deals on premium fashion. Grab the best offers before
            they're gone!
          </p>
          <Link
            to="/flash-sale"
            className="inline-block mt-6 sm:mt-8 bg-white text-red-700 px-10 py-4 text-sm font-bold tracking-wider uppercase hover:bg-gray-100 transition-colors min-h-[48px] flex items-center justify-center rounded"
          >
            Shop Flash Sale →
          </Link>
        </motion.div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-6 sm:py-8 md:py-12">
          <div className="container-luxe">
            <motion.div
              {...fadeUp}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6 sm:mb-8"
            >
              <div>
                <h2 className="section-title">New Arrivals</h2>
                <div className="divider" />
              </div>
              <Link
                to="/products?sort=newest"
                className="text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              {newArrivals.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-6 sm:py-8 md:py-12 bg-white">
          <div className="container-luxe">
            <motion.div
              {...fadeUp}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6 sm:mb-8"
            >
              <div>
                <h2 className="section-title">Best Sellers</h2>
                <div className="divider" />
              </div>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              {bestSellers.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Brands */}
      {brands.length > 0 && (
        <section className="py-6 sm:py-8 md:py-12">
          <div className="container-luxe">
            <motion.div
              {...fadeUp}
              className="text-center mb-6 sm:mb-8 md:mb-10"
            >
              <h2 className="section-title">Top Brands</h2>
              <div className="divider mx-auto" />
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {brands.map((brand, i) => (
                <motion.div
                  key={brand._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/brand/${brand._id}?q=${brand.slug}`}
                    className="group block card-luxe overflow-hidden hover:border-primary transition-colors"
                  >
                    {brand.coverImage?.url && (
                      <div className="h-14 sm:h-20 overflow-hidden">
                        <img
                          src={brand.coverImage.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4 sm:p-6 text-center">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 flex items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm ${brand.coverImage?.url ? "-mt-10 sm:-mt-12" : ""} bg-white`}
                      >
                        {brand.logo?.url ? (
                          <img
                            src={brand.logo.url}
                            alt={brand.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xl sm:text-2xl font-display text-gray-400">
                            {brand.name[0]}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-xs sm:text-sm">
                        {brand.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-6 sm:py-8 md:py-12 border-t border-border">
        <div className="container-luxe">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {[
              { title: "Free Shipping", desc: "On orders above ₹999" },
              { title: "Easy Returns", desc: "7-day return policy" },
              { title: "Secure Payment", desc: "100% secure checkout" },
              { title: "24/7 Support", desc: "Dedicated customer service" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h4 className="text-sm font-medium uppercase tracking-wider">
                  {f.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
