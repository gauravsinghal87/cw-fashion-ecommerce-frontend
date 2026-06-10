import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await get(API.ADMIN.VENDORS, params);
      setVendors(data.vendors || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [statusFilter]);

  const approve = async (id) => { try { await put(API.ADMIN.VENDOR_APPROVE(id)); toast.success('Vendor approved'); load(page); } catch { toast.error('Failed'); } };
  const reject = async () => { try { await put(API.ADMIN.VENDOR_REJECT(rejectModal.id), { reason: rejectModal.reason }); toast.success('Vendor rejected'); setRejectModal(null); load(page); } catch { toast.error('Failed'); } };

  const viewDetail = async (v) => {
    try { const { data } = await get(API.ADMIN.VENDOR(v._id)); setDetail(data.vendor); } catch { toast.error('Failed'); }
  };

  if (loading && !vendors.length) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div><h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Vendors</h1><p className="text-xs text-gray-500 mt-0.5">{pagination?.total || 0} total</p></div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4 items-stretch">
        <div className="flex gap-2 flex-1 min-w-0 w-full sm:w-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(1)} placeholder="Search store..." className="input-luxe text-sm flex-1 min-h-[44px]" />
          <button onClick={() => load(1)} className="btn-primary text-sm px-4 min-h-[44px]">Search</button>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-luxe text-sm min-h-[44px] w-full sm:w-auto sm:min-w-[140px]">
          <option value="">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-border">
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Store</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden md:table-cell">Owner</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Revenue</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id} className="border-b border-border/50 hover:bg-gray-50/50">
                <td className="py-3 px-2"><div className="flex items-center gap-2">
                  {v.storeLogo && <img src={v.storeLogo || v.storeLogo?.url} alt="" className="w-8 h-8 object-contain rounded" />}
                  <div><p className="font-medium text-sm">{v.storeName}</p><p className="text-xs text-gray-400">{v.user?.name || '—'}</p></div>
                </div></td>
                <td className="py-3 px-2 hidden md:table-cell"><p className="text-sm">{v.user?.email}</p><p className="text-xs text-gray-400">{v.user?.phone || '—'}</p></td>
                <td className="py-3 px-2 text-sm">₹{v.totalRevenue?.toLocaleString() || 0}</td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-2 py-0.5 ${v.status === 'approved' ? 'bg-success/10 text-success' : v.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-danger/10 text-danger'}`}>{v.status}</span>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex gap-1 justify-end flex-wrap text-xs">
                    <button onClick={() => viewDetail(v)} className="text-primary hover:underline min-h-[36px]">View</button>
                    {v.status === 'pending' && <><button onClick={() => approve(v._id)} className="text-success hover:underline min-h-[36px]">Approve</button><button onClick={() => setRejectModal({ id: v._id })} className="text-danger hover:underline min-h-[36px]">Reject</button></>}
                    {v.status === 'approved' && <button onClick={() => setRejectModal({ id: v._id })} className="text-warning hover:underline min-h-[36px]">Deactivate</button>}
                    {v.status === 'rejected' && <button onClick={() => approve(v._id)} className="text-success hover:underline min-h-[36px]">Activate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!vendors.length && <p className="text-center text-gray-500 py-12 text-sm">No vendors found</p>}
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setDetail(null)}>
          <div className="bg-white w-full max-w-2xl mx-0 sm:mx-4 rounded shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between">
              <h2 className="font-semibold">{detail.storeName}</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-lg min-h-[36px] min-w-[36px]">&times;</button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-luxe p-3 text-center"><p className="text-lg font-bold">₹{detail.totalRevenue?.toLocaleString() || 0}</p><p className="text-xs text-gray-500">Revenue</p></div>
                <div className="card-luxe p-3 text-center"><p className="text-lg font-bold">{detail.totalOrders || 0}</p><p className="text-xs text-gray-500">Orders</p></div>
                <div className="card-luxe p-3 text-center"><p className="text-lg font-bold">{detail.totalProducts || 0}</p><p className="text-xs text-gray-500">Products</p></div>
                <div className="card-luxe p-3 text-center"><p className="text-lg font-bold">{detail.commissionRate || 0}%</p><p className="text-xs text-gray-500">Commission</p></div>
              </div>

              <div className="border rounded p-3">
                <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Store Info</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Store:</span> {detail.storeName}</div>
                  <div><span className="text-gray-400">Slug:</span> /{detail.storeSlug}</div>
                  <div><span className="text-gray-400">Status:</span> <span className={`px-1.5 py-0.5 ${detail.status === 'approved' ? 'bg-success/10 text-success' : detail.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-danger/10 text-danger'}`}>{detail.status}</span></div>
                  <div><span className="text-gray-400">Featured:</span> {detail.isFeatured ? 'Yes' : 'No'}</div>
                  <div><span className="text-gray-400">Joined:</span> {new Date(detail.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {detail.storeDescription && <div><span className="text-gray-500">Description:</span><p className="text-xs text-gray-600 mt-0.5">{detail.storeDescription}</p></div>}

              <div className="border rounded p-3">
                <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Owner Details</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Name:</span> {detail.user?.name || '—'}</div>
                  <div><span className="text-gray-400">Email:</span> {detail.user?.email || '—'}</div>
                  <div><span className="text-gray-400">Phone:</span> {detail.user?.phone || detail.phone || '—'}</div>
                  <div><span className="text-gray-400">PAN:</span> {detail.panNumber || '—'}</div>
                </div>
              </div>

              {detail.warehouseAddress && (
                <div className="border rounded p-3">
                  <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Warehouse Address</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {detail.warehouseAddress.street && <div><span className="text-gray-400">Street:</span> {detail.warehouseAddress.street}</div>}
                    {detail.warehouseAddress.city && <div><span className="text-gray-400">City:</span> {detail.warehouseAddress.city}</div>}
                    {detail.warehouseAddress.state && <div><span className="text-gray-400">State:</span> {detail.warehouseAddress.state}</div>}
                    {detail.warehouseAddress.pincode && <div><span className="text-gray-400">Pincode:</span> {detail.warehouseAddress.pincode}</div>}
                  </div>
                </div>
              )}

              {detail.bankAccount && (detail.bankAccount.accountNumber || detail.bankAccount.ifscCode) && (
                <div className="border rounded p-3">
                  <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-400">Bank:</span> {detail.bankAccount.bankName || '—'}</div>
                    <div><span className="text-gray-400">Account:</span> {detail.bankAccount.accountNumber || '—'}</div>
                    <div><span className="text-gray-400">IFSC:</span> {detail.bankAccount.ifscCode || '—'}</div>
                    <div><span className="text-gray-400">Holder:</span> {detail.bankAccount.accountHolderName || detail.bankAccount.holderName || '—'}</div>
                  </div>
                </div>
              )}

              {detail.returnPolicy && (
                <div className="border rounded p-3">
                  <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Return Policy</h3>
                  <p className="text-xs text-gray-600">{typeof detail.returnPolicy === 'string' ? detail.returnPolicy : (detail.returnPolicy.description || '—')}</p>
                </div>
              )}

              {detail.statusReason && (
                <div className="border rounded p-3 bg-red-50">
                  <h3 className="font-medium text-xs uppercase tracking-wider text-red-600 mb-1">Status Reason</h3>
                  <p className="text-xs text-red-700">{detail.statusReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRejectModal(null)}>
          <div className="bg-white w-full max-w-sm mx-auto p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-3">Reject Vendor</h2>
            <textarea placeholder="Reason for rejection..." value={rejectModal.reason || ''} onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px] mb-3" />
            <div className="flex gap-3"><button onClick={reject} className="bg-danger text-white text-sm px-6 py-2.5 min-h-[44px] flex-1">Reject</button><button onClick={() => setRejectModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1">Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminVendors;
