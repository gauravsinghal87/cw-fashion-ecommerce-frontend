import { Suspense, lazy, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import VendorSidebar from '../components/layout/VendorSidebar';
import Loading from '../components/routing/Loading';

const VendorDashboard = lazy(() => import('../pages/vendor/Dashboard'));
const VendorProducts = lazy(() => import('../pages/vendor/Products'));
const VendorOrders = lazy(() => import('../pages/vendor/Orders'));
const VendorReturns = lazy(() => import('../pages/vendor/Returns'));
const VendorEarnings = lazy(() => import('../pages/vendor/Earnings'));
const VendorAnalytics = lazy(() => import('../pages/vendor/Analytics'));
const VendorSettings = lazy(() => import('../pages/vendor/Settings'));
const VendorAddProduct = lazy(() => import('../pages/vendor/AddProduct'));
const VendorStoreProfile = lazy(() => import('../pages/vendor/StoreProfile'));
const VendorWarehouses = lazy(() => import('../pages/vendor/Warehouses'));
const VendorInventory = lazy(() => import('../pages/vendor/Inventory'));
const VendorBulkImport = lazy(() => import('../pages/vendor/BulkImport'));
const VendorCustomers = lazy(() => import('../pages/vendor/Customers'));
const VendorReviews = lazy(() => import('../pages/vendor/Reviews'));
const VendorInvoices = lazy(() => import('../pages/vendor/Invoices'));
const VendorSupport = lazy(() => import('../pages/vendor/Support'));
const VendorAuditLogs = lazy(() => import('../pages/vendor/AuditLogs'));
const VendorNotificationsPage = lazy(() => import('../pages/vendor/VendorNotifications'));
const VendorWithdrawals = lazy(() => import('../pages/vendor/Withdrawals'));
const VendorWallet = lazy(() => import('../pages/vendor/Wallet'));

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <VendorSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 lg:ml-64 min-w-0 p-3 sm:p-4 md:p-6 lg:p-8">
        <button onClick={() => setSidebarOpen(true)} className="fixed top-3 left-3 z-40 lg:hidden min-w-[44px] min-h-[44px] bg-white border border-border flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<VendorDashboard />} />
            <Route path="/store" element={<VendorStoreProfile />} />
            <Route path="/warehouses" element={<VendorWarehouses />} />
            <Route path="/products" element={<VendorProducts />} />
            <Route path="/products/add" element={<VendorAddProduct />} />
            <Route path="/products/edit/:id" element={<VendorAddProduct />} />
            <Route path="/inventory" element={<VendorInventory />} />
            <Route path="/bulk-import" element={<VendorBulkImport />} />
            <Route path="/orders" element={<VendorOrders />} />
            <Route path="/returns" element={<VendorReturns />} />
            <Route path="/invoices" element={<VendorInvoices />} />
            <Route path="/customers" element={<VendorCustomers />} />
            <Route path="/reviews" element={<VendorReviews />} />
            <Route path="/earnings" element={<VendorEarnings />} />
            <Route path="/analytics" element={<VendorAnalytics />} />
            <Route path="/notifications" element={<VendorNotificationsPage />} />
            <Route path="/support" element={<VendorSupport />} />
            <Route path="/settings" element={<VendorSettings />} />
            <Route path="/withdrawals" element={<VendorWithdrawals />} />
            <Route path="/wallet" element={<VendorWallet />} />
            <Route path="/audit-logs" element={<VendorAuditLogs />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default VendorLayout;
