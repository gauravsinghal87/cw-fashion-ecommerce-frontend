import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { get } from "../../utils/apiMethods";
import { API } from "../../utils/apiPaths";
import { logout } from "../../store/authSlice";
import { fetchWishlist } from "../../store/wishlistSlice";
import { useSite } from "../../context/SiteContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const wishlistCount = useSelector((state) => state.wishlist.count);
  const { siteTitle, siteLogo } = useSite();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          const { data } = await get(API.SEARCH.SUGGESTIONS, {
            q: searchQuery,
          });
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } catch {
          setShowSuggestions(false);
        }
      }, 300);
    } else {
      setShowSuggestions(false);
      setSuggestions(null);
    }
    return () => clearTimeout(timerRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchWishlist());
  }, [isAuthenticated, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?q=${searchQuery}`);
    setSearchQuery("");
    setShowSuggestions(false);
    setMobileSearch(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const suggestionClick = (type, slug) => {
    setShowSuggestions(false);
    setSearchQuery("");
    if (type === "product") navigate(`/product/${slug}`);
    else navigate(`/products?${type}=${slug}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border h-14 sm:h-16 md:h-20">
      <div className="container-luxe h-full">
        <div className="flex items-center justify-between h-full px-2 sm:px-4 md:px-6">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink">
            <button
              onClick={() => setMobileNav(true)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink"
            >
              {siteLogo?.url ? (
                <img
                  src={siteLogo.url}
                  alt={siteTitle}
                  className="h-5 sm:h-7 md:h-9 w-auto object-contain shrink-0"
                />
              ) : null}
              <span className="text-xs sm:text-sm md:text-lg lg:text-xl font-display font-bold tracking-tight truncate">
                {siteTitle}
              </span>
            </Link>
          </div>

          <div
            ref={searchRef}
            className="hidden md:flex items-center flex-1 max-w-md mx-8 relative"
          >
            <form onSubmit={handleSearch} className="w-full flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions && setShowSuggestions(true)}
                placeholder="Search products..."
                className="w-full px-4 py-2 bg-gray-50 border border-border text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-sm min-h-[44px]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
            <AnimatePresence>
              {showSuggestions && suggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 bg-white border border-t-0 border-border shadow-sm z-50 max-h-80 overflow-y-auto"
                >
                  {suggestions.products?.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 px-2 mb-1">
                        Products
                      </p>
                      {suggestions.products.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => suggestionClick("product", p._id)}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          {p.images?.[0]?.url && (
                            <img
                              src={p.images[0].url}
                              alt=""
                              className="w-8 h-8 object-cover"
                            />
                          )}
                          <span className="truncate">{p.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.categories?.length > 0 && (
                    <div className="p-2 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 px-2 mb-1">
                        Categories
                      </p>
                      {suggestions.categories.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => suggestionClick("category", c.slug)}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-50"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.brands?.length > 0 && (
                    <div className="p-2 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 px-2 mb-1">
                        Brands
                      </p>
                      {suggestions.brands.map((b) => (
                        <button
                          key={b._id}
                          onClick={() => suggestionClick("brand", b.slug)}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-50"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <button
              onClick={() => setMobileSearch(true)}
              className="md:hidden min-w-[26px] p-2 md:p-0 md:min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <Link
              to="/wishlist"
              className="relative min-w-[26px] p-2 md:p-0 md:min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-primary text-white text-[9px] sm:text-[10px] flex items-center justify-center leading-none">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative min-w-[26px] p-2 md:p-0 md:min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {items.length > 0 && (
                <span className="absolute -top-1 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-primary text-white text-[9px] sm:text-[10px] flex items-center justify-center leading-none">
                  {items.length > 99 ? "99+" : items.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="min-w-[44px] min-h-[44px] bg-primary text-white text-xs font-medium flex items-center justify-center"
                >
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-10 w-48 bg-white border border-border shadow-sm"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          Orders
                        </Link>
                        <Link
                          to="/my-reviews"
                          className="block px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          My Reviews
                        </Link>
                        <Link
                          to="/wallet"
                          className="block px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          Wallet
                        </Link>
                        <Link
                          to="/referral"
                          className="block px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          Refer & Earn
                        </Link>
                        {user?.role === "customer" && (
                          <Link
                            to="/returns"
                            className="block px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setIsOpen(false)}
                          >
                            Returns & Exchanges
                          </Link>
                        )}
                        <Link
                          to="/help"
                          className="block px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          Help Center
                        </Link>
                        {user?.role === "vendor" && (
                          <Link
                            to="/vendor"
                            className="block px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setIsOpen(false)}
                          >
                            Vendor Dashboard
                          </Link>
                        )}
                        {user?.role === "admin" && (
                          <Link
                            to="/admin"
                            className="block px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setIsOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="min-w-[44px] min-h-[44px] flex items-center text-sm font-medium text-primary hover:underline"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-white"
          >
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 p-3"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 min-h-[44px] px-3 py-2 bg-gray-50 border border-border text-sm focus:outline-none focus:border-primary"
                autoFocus
              />
              <button
                type="submit"
                className="min-h-[44px] px-3 py-2 bg-primary text-white text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setMobileSearch(false)}
                className="text-xs text-gray-500"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMobileNav(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween" }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-xl md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border gap-2">
                <div className="flex items-center justify-start">
                  {siteLogo?.url && (
                  <img
                    src={siteLogo.url}
                    alt={siteTitle}
                    className="h-7 w-auto object-contain flex-shrink-0"
                  />
                )}
                <span className="text-base sm:text-lg font-display font-bold truncate min-w-0">
                  {siteTitle}
                </span>
                </div>
                <button
                  onClick={() => setMobileNav(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <nav className="p-4 space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileNav(false)}
                  className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileNav(false)}
                  className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                >
                  All Products
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileNav(false)}
                  className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                >
                  Wishlist
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileNav(false)}
                  className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                >
                  Cart ({items.length})
                </Link>
                <hr className="my-2 border-border" />
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileNav(false)}
                      className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileNav(false)}
                      className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                    >
                      Orders
                    </Link>
                    <Link
                      to="/my-reviews"
                      onClick={() => setMobileNav(false)}
                      className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                    >
                      My Reviews
                    </Link>
                    <Link
                      to="/wallet"
                      onClick={() => setMobileNav(false)}
                      className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                    >
                      Wallet
                    </Link>
                    <Link
                      to="/referral"
                      onClick={() => setMobileNav(false)}
                      className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                    >
                      Refer & Earn
                    </Link>
                    <Link
                      to="/help"
                      onClick={() => setMobileNav(false)}
                      className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                    >
                      Help Center
                    </Link>
                    {user?.role === "vendor" && (
                      <Link
                        to="/vendor"
                        onClick={() => setMobileNav(false)}
                        className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                      >
                        Vendor Dashboard
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileNav(false)}
                        className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-2 border-border" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileNav(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-gray-100 rounded-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileNav(false)}
                      className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileNav(false)}
                      className="block px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
