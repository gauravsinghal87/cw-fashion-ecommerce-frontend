import { useState, useEffect } from 'react';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'released', label: 'Released' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Settlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async (status) => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      const { data } = await get(API.VENDORS.SETTLEMENTS, params);
      setSettlements(data.settlements || []);
      setSummary(data.summary || null);
    } catch {}
    finally { setLoading(false); }
  };

  const viewDetail = async (id) => {
    try { const { data } = await get(API.VENDORS.SETTLEMENT_DETAIL(id)); setDetail(data.settlement || data); }
    catch {}
  };

  const filtered = filter ? settlements.filter((s) => s.status === filter) : settlements;

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-14 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Settlements</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-border rounded p-3 sm:p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Earnings</p>
            <p className="text-lg sm:text-xl font-bold mt-1">{formatPrice(summary.totalEarnings || 0)}</p>
          </div>
          <div className="bg-white border border-border rounded p-3 sm:p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-lg sm:text-xl font-bold mt-1 text-amber-600">{formatPrice(summary.pending || 0)}</p>
          </div>
          <div className="bg-white border border-border rounded p-3 sm:p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Released</p>
            <p className="text-lg sm:text-xl font-bold mt-1 text-success">{formatPrice(summary.released || 0)}</p>
          </div>
          <div className="bg-white border border-border rounded p-3 sm:p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Cancelled</p>
            <p className="text-lg sm:text-xl font-bold mt-1 text-gray-400">{formatPrice(summary.cancelled || 0)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-6 items-stretch">
        {statusFilters.map((s) => (
          <button key={s.value} onClick={() => { setFilter(s.value); load(s.value); }}
            className={`text-xs sm:text-sm px-4 py-2 border whitespace-nowrap min-h-[44px] flex items-center justify-center w-full sm:w-auto ${
              filter === s.value ? 'border-primary bg-primary text-white' : 'border-border hover:bg-gray-50'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-[700px] lg:min-w-0 w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Item</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Order #</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Date</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Amount</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Commission</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Net Earnings</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Released</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => viewDetail(s._id)}>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs max-w-[160px] truncate">{s.itemName || '—'}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-mono text-xs">{s.order?.orderNumber || '—'}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{formatDate(s.createdAt)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(s.finalPrice || s.originalPrice || 0)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{formatPrice(s.commissionAmount || 0)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">{formatPrice(s.vendorEarnings || 0)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3"><span className={`text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 border ${getStatusColor(s.status)}`}>{s.status}</span></td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{s.releasedAt ? formatDate(s.releasedAt) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-500 py-8 sm:py-12 text-xs sm:text-sm">No settlements found</p>}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setDetail(null)}>
          <div className="bg-white w-full max-w-lg mx-0 sm:mx-4 p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Settlement Detail</h2>
              <button onClick={() => setDetail(null)} className="text-xs sm:text-sm text-gray-500 hover:underline min-h-[44px] flex items-center">Close</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="text-right max-w-[60%]">{detail.itemName || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Order #</span><span className="font-mono">{detail.order?.orderNumber || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Original Price</span><span>{formatPrice(detail.originalPrice || 0)}</span></div>
              {detail.couponDiscount > 0 && <div className="flex justify-between"><span className="text-gray-500">Coupon Discount</span><span className="text-danger">-{formatPrice(detail.couponDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Final Amount</span><span>{formatPrice(detail.finalPrice || detail.originalPrice || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Commission ({detail.commissionRate || 0}%)</span><span className="text-gray-500">{formatPrice(detail.commissionAmount || 0)}</span></div>
              <div className="flex justify-between border-t border-border pt-2"><span className="font-medium">Net Earnings</span><span className="font-bold">{formatPrice(detail.vendorEarnings || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`text-xs px-2 py-0.5 border ${getStatusColor(detail.status)}`}>{detail.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivered</span><span className="text-xs text-gray-500">{detail.deliveredAt ? formatDate(detail.deliveredAt) : '—'}</span></div>
              {detail.releasedAt && <div className="flex justify-between"><span className="text-gray-500">Released</span><span className="text-xs text-gray-500">{formatDate(detail.releasedAt)}</span></div>}
              {detail.returnWindowEnd && <div className="flex justify-between"><span className="text-gray-500">Return Window</span><span className="text-xs text-gray-500">{formatDate(detail.returnWindowEnd)}</span></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settlements;
