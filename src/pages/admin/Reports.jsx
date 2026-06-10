import { useState, useEffect } from 'react';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';

const AdminReports = () => {
  const [revenue, setRevenue] = useState({ daily: [], totals: {} });
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderReport, setOrderReport] = useState({ daily: [], statusBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('revenue');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [revRes, venRes, prodRes, ordRes] = await Promise.all([
          get(API.ADMIN.REPORTS_REVENUE, {}).catch(() => ({ data: { report: { daily: [], totals: {} } } })),
          get(API.ADMIN.REPORTS_VENDORS).catch(() => ({ data: { report: [] } })),
          get(API.ADMIN.REPORTS_PRODUCTS).catch(() => ({ data: { report: [] } })),
          get(API.ADMIN.REPORTS_ORDERS).catch(() => ({ data: { report: { daily: [], statusBreakdown: [] } } })),
        ]);
        setRevenue(revRes.data.report || { daily: [], totals: {} });
        setVendors(venRes.data.report || []);
        setProducts(prodRes.data.report || []);
        setOrderReport(ordRes.data.report || { daily: [], statusBreakdown: [] });
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const maxRev = Math.max(...(revenue.daily?.map(d => d.revenue) || [0]), 1);
  const maxOrd = Math.max(...(orderReport.daily?.map(d => d.count) || [0]), 1);

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-20 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-title">Reports</h1>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['revenue', 'vendors', 'products', 'orders'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 text-sm border min-h-[44px] capitalize ' + (tab === t ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-gray-50')}>{t}</button>
        ))}
      </div>

      {tab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-luxe p-4"><p className="text-xs text-gray-500">Total Revenue</p><p className="text-2xl sm:text-3xl font-bold">{'\u20B9'}{revenue.totals?.totalRevenue?.toLocaleString() || 0}</p></div>
            <div className="card-luxe p-4"><p className="text-xs text-gray-500">Total Orders</p><p className="text-2xl sm:text-3xl font-bold">{revenue.totals?.totalOrders || 0}</p></div>
            <div className="card-luxe p-4"><p className="text-xs text-gray-500">Avg Order Value</p><p className="text-2xl sm:text-3xl font-bold">{'\u20B9'}{Math.round(revenue.totals?.avgOrderValue || 0).toLocaleString()}</p></div>
          </div>
          <div className="card-luxe p-4">
            <h3 className="font-medium text-sm mb-4">Daily Revenue (Last 30 Days)</h3>
            <div className="flex items-end gap-1 h-32 sm:h-40 overflow-x-auto pb-2">
              {revenue.daily?.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[32px]">
                  <span className="text-[10px] text-gray-500">{'\u20B9'}{d.revenue}</span>
                  <div className="w-6 sm:w-8 bg-primary/70 hover:bg-primary transition-colors rounded-t" style={{ height: Math.max(4, (d.revenue / maxRev) * 100) + 'px' }} title={d._id + ': \u20B9' + d.revenue} />
                  <span className="text-[10px] text-gray-400">{d._id?.slice(-5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'vendors' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-border">
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Store</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right">Revenue</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right">Orders</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right hidden md:table-cell">Products</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right hidden lg:table-cell">Earnings</th>
            </tr></thead>
            <tbody>
              {vendors.map((v, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-gray-50/50">
                  <td className="py-3 px-2 font-medium">{v.storeName}</td>
                  <td className="py-3 px-2 text-right">{'\u20B9'}{v.totalRevenue?.toLocaleString() || 0}</td>
                  <td className="py-3 px-2 text-right">{v.totalOrders || 0}</td>
                  <td className="py-3 px-2 text-right hidden md:table-cell">{v.productCount || 0}</td>
                  <td className="py-3 px-2 text-right hidden lg:table-cell">{'\u20B9'}{v.totalEarnings?.toLocaleString() || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!vendors.length && <p className="text-center text-gray-500 py-8 text-sm">No vendor data</p>}
        </div>
      )}

      {tab === 'products' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-border">
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Product</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 hidden lg:table-cell">Vendor</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right">Sold</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right">Price</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right hidden md:table-cell">Rating</th>
            </tr></thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-gray-50/50">
                  <td className="py-3 px-2 max-w-[200px] truncate">{p.title}</td>
                  <td className="py-3 px-2 hidden lg:table-cell text-xs">{p.vendor?.storeName || '—'}</td>
                  <td className="py-3 px-2 text-right">{p.totalSold || 0}</td>
                  <td className="py-3 px-2 text-right">{'\u20B9'}{p.minPrice || 0} — {'\u20B9'}{p.maxPrice || 0}</td>
                  <td className="py-3 px-2 text-right hidden md:table-cell">\u2605 {p.rating?.toFixed(1) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && <p className="text-center text-gray-500 py-8 text-sm">No product data</p>}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => {
              const item = orderReport.statusBreakdown?.find(b => b._id === s);
              return item ? <div key={s} className="card-luxe p-3 text-center"><p className="text-lg font-bold">{item.count}</p><p className="text-xs text-gray-500 capitalize">{s}</p><p className="text-[10px] text-gray-400">{'\u20B9'}{item.total?.toLocaleString()}</p></div> : null;
            })}
          </div>
          <div className="card-luxe p-4">
            <h3 className="font-medium text-sm mb-4">Daily Orders</h3>
            <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
              {orderReport.daily?.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[32px]">
                  <span className="text-[10px] text-gray-500">{d.count}</span>
                  <div className="w-6 sm:w-8 bg-blue-500/70 hover:bg-blue-500 transition-colors rounded-t" style={{ height: Math.max(4, (d.count / maxOrd) * 100) + 'px' }} />
                  <span className="text-[10px] text-gray-400">{d._id?.slice(-5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminReports;
