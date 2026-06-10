import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { formatPrice } from '../../utils/helpers';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get(API.ADMIN.DASHBOARD).then(({ data: res }) => setData(res.dashboard)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-24 skeleton" />)}</div>;

  const stats = [
    { label: 'Total Users', value: data?.totalUsers || 0, to: '/admin/users', color: 'bg-primary' },
    { label: 'Total Vendors', value: data?.totalVendors || 0, to: '/admin/vendors', color: 'bg-accent' },
    { label: 'Total Orders', value: data?.totalOrders || 0, to: '/admin/orders', color: 'bg-success' },
    { label: 'Revenue', value: formatPrice(data?.totalRevenue || 0), to: '/admin/reports', color: 'bg-primary' },
    { label: 'Pending Vendors', value: data?.pendingVendors || 0, to: '/admin/vendors?status=pending', color: 'bg-yellow-600' },
    { label: 'Pending Withdrawals', value: data?.pendingWithdrawals || 0, to: '/admin/withdrawals?status=pending', color: 'bg-yellow-600' },
    { label: 'Return Requests', value: data?.pendingReturns || 0, to: '/admin/returns?status=requested', color: 'bg-danger' },
    { label: 'Commission Earned', value: formatPrice(data?.commissionEarned || 0), to: '/admin/commission', color: 'bg-accent' },
  ];

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Overview of your marketplace</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="card-luxe p-4 sm:p-5 md:p-6 hover:border-primary transition-colors group">
            <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-xl sm:text-2xl md:text-3xl font-bold mt-2 ${stat.color.includes('accent') ? 'text-accent' : stat.color.includes('danger') ? 'text-danger' : stat.color.includes('success') ? 'text-success' : 'text-primary'}`}>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="card-luxe p-4 sm:p-5 md:p-6">
          <h3 className="text-sm font-medium mb-4">Top Products</h3>
          {data?.topProducts?.slice(0, 5).map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                <p className="text-sm">{p.title}</p>
              </div>
              <span className="text-xs font-medium">{p.totalSold} sold</span>
            </div>
          ))}
        </div>
        <div className="card-luxe p-4 sm:p-5 md:p-6">
          <h3 className="text-sm font-medium mb-4">Top Vendors</h3>
          {data?.topVendors?.slice(0, 5).map((v, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <p className="text-sm">{v.storeName}</p>
              <span className="text-xs font-medium">{formatPrice(v.totalRevenue)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
