import { useState, useEffect } from 'react';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { formatPrice } from '../../utils/helpers';

const VendorAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get(API.VENDORS.ANALYTICS).then(({ data: res }) => setData(res.analytics)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="h-48 skeleton" /></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-5"><p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Revenue (30d)</p><p className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">{formatPrice(data?.revenueData?.reduce((s, d) => s + d.revenue, 0) || 0)}</p></div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-5"><p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Orders (30d)</p><p className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">{data?.revenueData?.reduce((s, d) => s + d.orders, 0) || 0}</p></div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-5"><p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Return Rate</p><p className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">{data?.returnRate || '0'}%</p></div>
      </div>

      <div className="flex-col lg:flex-row gap-4 lg:gap-6 flex">
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6">
          <h3 className="text-sm font-medium mb-4">Daily Revenue</h3>
          <div className="space-y-1">
            {data?.revenueData?.slice(-14).reverse().map((d, i) => (
              <div key={i} className="flex items-center justify-between py-1 text-xs border-b border-border last:border-0">
                <span className="text-gray-500">{d._id}</span>
                <span className="font-medium">{formatPrice(d.revenue)}</span>
                <span className="text-gray-400">{d.orders} orders</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6">
          <h3 className="text-sm font-medium mb-4">Top Selling Products</h3>
          <div className="space-y-2">
            {data?.topProducts?.slice(0, 10).map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1 text-xs border-b border-border last:border-0">
                <span className="line-clamp-1 flex-1">{p.title}</span>
                <span className="font-medium ml-2">{p.totalSold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 mt-4 sm:mt-6">
        <h3 className="text-sm font-medium mb-4">Order Status Distribution</h3>
        <div className="flex gap-4 flex-wrap">
          {data?.orderStats?.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 border capitalize">{s._id}</span>
              <span className="font-medium">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
