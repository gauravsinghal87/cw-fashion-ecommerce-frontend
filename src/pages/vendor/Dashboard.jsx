import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { formatPrice, formatDate } from '../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { setVendorStats } from '../../store/vendorSlice';

const VendorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [vendorStatus, setVendorStatus] = useState(null);
  const dispatch = useDispatch();
  const vendorUser = useSelector((state) => state.vendor?.user);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        // Check vendor status from profile
        const profileResp = await get(API.VENDORS.PROFILE);
        const profile = profileResp.data.vendor || profileResp.data;
        const status = profile?.status || vendorUser?.vendorInfo?.status;
        setVendorStatus(status);
        if (status !== 'approved') { setLoading(false); return; }

        const { data } = await get(API.VENDORS.DASHBOARD);
        const dashboardData = data.dashboard || data;
        
        // Set individual state variables for better reactivity
        setStats(dashboardData);
        setRecentOrders(dashboardData.recentOrders || []);
        setLowStockProducts(dashboardData.lowStockProducts || []);
        setMonthlySales(dashboardData.monthlySales || []);
        setTopProducts(dashboardData.topProducts || []);
        dispatch(setVendorStats(dashboardData));
      } catch (err) {
        // Try to load individual endpoints if dashboard fails
        try {
          const [
            profileResp,
            productsResp,
            ordersResp,
            walletResp
          ] = await Promise.all([
            get(API.VENDORS.PROFILE),
            get(`${API.VENDORS.PRODUCTS}?limit=5`),
            get(`${API.VENDORS.ORDERS}?limit=5`),
            get(API.VENDORS.WALLET)
          ]);
          
          setStats({
            totalProducts: productsResp.data.products?.length || 0,
            activeProducts: productsResp.data.products?.filter(p => p.isActive).length || 0,
            totalOrders: ordersResp.data.orders?.length || 0,
            pendingOrders: ordersResp.data.orders?.filter(o => o.status === 'pending').length || 0,
            totalRevenue: walletResp.data.wallet?.balance || 0,
            totalEarnings: profileResp.data.vendor?.totalEarnings || profileResp.data?.totalEarnings || 0,
            totalWithdrawn: walletResp.data.wallet?.totalWithdrawn || 0,
            pendingWithdrawal: walletResp.data.wallet?.pendingWithdrawal || 0,
          });
          
          setRecentOrders(ordersResp.data.orders || []);
          setLowStockProducts(productsResp.data.products?.filter(p => p.totalStock <= 10).slice(0, 5) || []);
          setMonthlySales([]); // Would need separate analytics call
          setTopProducts(productsResp.data.products?.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 5) || []);
        } catch (error) {
          console.error('Dashboard load error:', error);
        } finally {
          setLoading(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    get(API.VENDORS.NOTIFICATIONS).then(({ data }) => {
      setNotifications(data.notifications?.slice(0, 5) || []);
    }).catch(() => {});
  }, [dispatch]);

  if (vendorStatus && vendorStatus !== 'approved') {
    const configs = {
      pending: { title: 'Approval Pending', desc: 'Your vendor account is under review. We will notify you once it is approved.', icon: '⏳' },
      rejected: { title: 'Application Rejected', desc: 'Your vendor application has been rejected. Please contact support for more information.', icon: '❌' },
      suspended: { title: 'Account Suspended', desc: 'Your vendor account has been suspended. Contact support for details.', icon: '🚫' },
      banned: { title: 'Account Banned', desc: 'Your vendor account has been banned.', icon: '⛔' },
    };
    const c = configs[vendorStatus] || configs.pending;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">{c.icon}</div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">{c.title}</h1>
          <p className="text-sm text-gray-500 mb-6">{c.desc}</p>
          <Link to="/vendor/login" onClick={() => localStorage.clear()} className="inline-block btn-primary px-6 py-2.5 text-sm min-h-[44px]">Back to Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Vendor Dashboard</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Manage your store and products</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats && [
          { label: 'Total Products', value: stats.totalProducts || 0, to: '/vendor/products' },
          { label: 'Active Products', value: stats.activeProducts || 0, to: '/vendor/products' },
          { label: 'Total Orders', value: stats.totalOrders || 0, to: '/vendor/orders' },
          { label: 'Revenue', value: formatPrice(stats.totalRevenue || 0), to: '/vendor/analytics' },
          { label: 'Earnings', value: formatPrice(stats.totalEarnings || 0), to: '/vendor/analytics' },
          { label: 'Withdrawn', value: formatPrice(stats.totalWithdrawn || 0), to: '/vendor/withdrawals' },
          { label: 'Pending Orders', value: stats.pendingOrders || 0, to: '/vendor/orders?status=pending' },
          { label: 'Shipped Orders', value: stats.shippedOrders || 0, to: '/vendor/orders?status=shipped' },
          { label: 'Delivered Orders', value: stats.deliveredOrders || 0, to: '/vendor/orders?status=delivered' },
          { label: 'Return Requests', value: stats.returnRequests || 0, to: '/vendor/returns' },
          { label: 'Wallet Balance', value: formatPrice(stats.walletBalance || 0), to: '/vendor/wallet' },
          { label: 'Pending Withdrawals', value: formatPrice(stats.pendingWithdrawal || 0), to: '/vendor/withdrawals' },
        ].map((stat) => (
          <Link key={stat.label} to={stat.to} className="card-luxe p-3 sm:p-4 md:p-5 hover:border-primary transition-colors">
            <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="flex-col lg:flex-row gap-4 lg:gap-6 flex">
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6">
          <h3 className="text-sm font-medium mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="min-w-[600px] lg:min-w-0 w-full text-sm">
                <tbody>
                  {recentOrders.slice(0, 5).map((order, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-sm">#{order.orderNumber}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{order.user?.name || 'Customer'}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 capitalize">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No orders yet</p>
          )}
        </div>
        
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6">
          <h3 className="text-sm font-medium mb-4">Low Stock Products</h3>
          {lowStockProducts.length > 0 ? (
            lowStockProducts.slice(0, 5).map((product, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <p className="text-sm line-clamp-1">{product.title}</p>
                <span className="text-xs text-danger">{product.totalStock} left</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">All products well stocked</p>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 mt-4 sm:mt-6">
        <h3 className="text-sm font-medium mb-4">Notifications</h3>
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-gray-300' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-400">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No notifications</p>
        )}
      </div>

      {/* Monthly Sales Chart Placeholder */}
      {monthlySales.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-sm font-medium mb-4">Monthly Sales Trend</h3>
          <div className="h-40 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center h-full text-gray-500 text-xs sm:text-sm">
              Monthly sales chart would go here
            </div>
          </div>
        </div>
      )}

      {/* Top Selling Products */}
      {topProducts.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-sm font-medium mb-4">Top Selling Products</h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-border">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="text-xs text-gray-400 w-5 shrink-0">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">{product.totalSold || 0} units sold</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-primary font-medium shrink-0 ml-2">{formatPrice((product.minPrice || 0) * (product.totalSold || 0))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversion Analytics */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-5">
          <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Conversion Rate</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{(stats?.conversionRate || 3.2).toFixed(1)}%</p>
          <p className="text-xs text-green-600 mt-1">+0.8% this month</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-5">
          <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Avg. Order Value</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{formatPrice(stats?.avgOrderValue || 1250)}</p>
          <p className="text-xs text-green-600 mt-1">+5.2% this month</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-5">
          <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Return Rate</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{(stats?.returnRate || 1.8).toFixed(1)}%</p>
          <p className="text-xs text-amber-600 mt-1">-0.3% this month</p>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;