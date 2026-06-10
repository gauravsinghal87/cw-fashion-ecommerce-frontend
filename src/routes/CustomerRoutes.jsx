import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, GuestRoute, VerifyEmailAuthGuard } from '../components/routing/ProtectedRoute';
import Loading from '../components/routing/Loading';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Home = lazy(() => import('../pages/customer/Home'));
const ProductListing = lazy(() => import('../pages/customer/ProductListing'));
const ProductDetail = lazy(() => import('../pages/customer/ProductDetail'));
const Cart = lazy(() => import('../pages/customer/Cart'));
const Checkout = lazy(() => import('../pages/customer/Checkout'));
const Wishlist = lazy(() => import('../pages/customer/Wishlist'));
const Orders = lazy(() => import('../pages/customer/Orders'));
const OrderDetail = lazy(() => import('../pages/customer/OrderDetail'));
const CustomerReturns = lazy(() => import('../pages/customer/Returns'));
const Profile = lazy(() => import('../pages/customer/Profile'));
const Addresses = lazy(() => import('../pages/customer/Addresses'));
const Wallet = lazy(() => import('../pages/customer/Wallet'));
const Referral = lazy(() => import('../pages/customer/Referral'));
const MyReviews = lazy(() => import('../pages/customer/MyReviews'));
const HelpCenter = lazy(() => import('../pages/customer/HelpCenter'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'));
const CategoryPage = lazy(() => import('../pages/customer/CategoryPage'));
const StorePage = lazy(() => import('../pages/customer/StorePage'));
const BrandPage = lazy(() => import('../pages/customer/BrandPage'));
const FlashSale = lazy(() => import('../pages/customer/FlashSale'));
const CMSPage = lazy(() => import('../pages/customer/CMSPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

const CustomerRoutes = () => (
  <>
    <Header />
    <main className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flash-sale" element={<FlashSale />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/verify-email" element={<VerifyEmailAuthGuard />} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><CustomerReturns /></ProtectedRoute>} />
          <Route path="/returns/:id" element={<ProtectedRoute><CustomerReturns /></ProtectedRoute>} />
          <Route path="/returns/:id/dispute" element={<ProtectedRoute><CustomerReturns /></ProtectedRoute>} />
          <Route path="/my-reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/referral" element={<ProtectedRoute><Referral /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
          <Route path="/store/:vendorId" element={<StorePage />} />
          <Route path="/brand/:id" element={<BrandPage />} />
          <Route path="/about" element={<CMSPage />} />
          <Route path="/contact" element={<CMSPage />} />
          <Route path="/faq" element={<CMSPage />} />
          <Route path="/privacy" element={<CMSPage />} />
          <Route path="/terms" element={<CMSPage />} />
          <Route path="/shipping" element={<CMSPage />} />
          <Route path="/size-guide" element={<CMSPage />} />
          <Route path="/refund-policy" element={<CMSPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
    <Footer />
  </>
);

export default CustomerRoutes;
