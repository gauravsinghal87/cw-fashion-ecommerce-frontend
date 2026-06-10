import { useState, useEffect } from 'react';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice, formatDate } from '../../utils/helpers';
import InvoiceModal from '../../components/order/InvoiceModal';

const Invoices = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = async (p, q) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20, delivered: true };
      if (q || search) params.q = q || search;
      const { data } = await get(API.VENDORS.ORDERS, params);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadOrders(1, search);
  };

  const clearSearch = () => {
    setSearch('');
    setPage(1);
    loadOrders(1, '');
  };

  const viewInvoice = async (orderId) => {
    setInvoiceLoading(true);
    try {
      const { data } = await get(API.VENDORS.INVOICE_GENERATE(orderId));
      setInvoice(data.invoice || data);
    } catch { toast.error('Failed to generate invoice'); }
    finally { setInvoiceLoading(false); }
  };

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-14 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Invoices</h1>

      <form onSubmit={handleSearch} className="flex-col sm:flex-row gap-2 sm:gap-3 mb-6 max-w-md flex">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order number..." className="input-luxe text-sm flex-1 w-full min-h-[44px]" />
        <button type="submit" className="btn-primary text-xs sm:text-sm px-4 py-2 min-h-[44px] w-full sm:w-auto">Search</button>
        {search && <button type="button" onClick={clearSearch} className="text-xs sm:text-sm text-gray-500 hover:underline min-h-[44px] flex items-center">Clear</button>}
      </form>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-[600px] lg:min-w-0 w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Order #</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Customer</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Items</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Total</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Date</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-mono text-xs">{o.orderNumber}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{o.user?.name}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{o.items?.length || 0}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(o.total || 0)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                    <button onClick={() => viewInvoice(o._id)} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">Generate / View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <p className="text-center text-gray-500 py-8 sm:py-12 text-xs sm:text-sm">No delivered orders yet</p>}
      </div>

      <InvoiceModal data={invoice} loading={invoiceLoading} onClose={() => setInvoice(null)} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}
    </div>
  );
};

export default Invoices;
