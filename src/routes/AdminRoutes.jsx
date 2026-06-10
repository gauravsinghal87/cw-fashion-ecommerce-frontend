import { Suspense, lazy, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import Loading from '../components/routing/Loading';

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminVendors = lazy(() => import('../pages/admin/Vendors'));
const AdminProducts = lazy(() => import('../pages/admin/Products'));
const AdminOrders = lazy(() => import('../pages/admin/Orders'));
const AdminCategories = lazy(() => import('../pages/admin/Categories'));
const AdminBrands = lazy(() => import('../pages/admin/Brands'));
const AdminCoupons = lazy(() => import('../pages/admin/Coupons'));
const AdminReturns = lazy(() => import('../pages/admin/Returns'));
const AdminBanners = lazy(() => import('../pages/admin/Banners'));
const AdminCMS = lazy(() => import('../pages/admin/CMS'));
const AdminReports = lazy(() => import('../pages/admin/Reports'));
const AdminNotifications = lazy(() => import('../pages/admin/Notifications'));
const AdminCommission = lazy(() => import('../pages/admin/Commission'));
const AdminReferrals = lazy(() => import('../pages/admin/Referrals'));
const AdminSubAdmins = lazy(() => import('../pages/admin/SubAdmins'));
const AdminRoles = lazy(() => import('../pages/admin/Roles'));
const AdminSEO = lazy(() => import('../pages/admin/SEO'));
const AdminWallet = lazy(() => import('../pages/admin/Wallet'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const AdminShipping = lazy(() => import('../pages/admin/Shipping'));
const AdminReviews = lazy(() => import('../pages/admin/Reviews'));
const AdminPayments = lazy(() => import('../pages/admin/Payments'));
const AdminSupportTickets = lazy(() => import('../pages/admin/SupportTickets'));
const AdminWithdrawals = lazy(() => import('../pages/admin/Withdrawals'));
const AdminFooterSettings = lazy(() => import('../pages/admin/FooterSettings'));

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 lg:ml-64 min-w-0 p-3 sm:p-4 md:p-6 lg:p-8">
        <button onClick={() => setSidebarOpen(true)} className="fixed top-3 left-3 z-40 lg:hidden min-w-[44px] min-h-[44px] bg-white border border-border flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/vendors" element={<AdminVendors />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/brands" element={<AdminBrands />} />
            <Route path="/coupons" element={<AdminCoupons />} />
            <Route path="/returns" element={<AdminReturns />} />
            <Route path="/banners" element={<AdminBanners />} />
            <Route path="/cms" element={<AdminCMS />} />
            <Route path="/reports" element={<AdminReports />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/commission" element={<AdminCommission />} />
            <Route path="/referrals" element={<AdminReferrals />} />
            <Route path="/sub-admins" element={<AdminSubAdmins />} />
            <Route path="/roles" element={<AdminRoles />} />
            <Route path="/seo" element={<AdminSEO />} />
            <Route path="/wallet" element={<AdminWallet />} />
            <Route path="/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/shipping" element={<AdminShipping />} />
            <Route path="/reviews" element={<AdminReviews />} />
            <Route path="/payments" element={<AdminPayments />} />
            <Route path="/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/support" element={<AdminSupportTickets />} />
            <Route path="/footer" element={<AdminFooterSettings />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default AdminLayout;
