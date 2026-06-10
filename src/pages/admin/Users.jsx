import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selected, setSelected] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  const load = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter;
      const { data } = await get(API.ADMIN.USERS, params);
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [roleFilter, statusFilter]);

  const handleSearch = () => { setPage(1); load(1); };

  const toggleStatus = async (id) => {
    try { await put(API.ADMIN.USER_TOGGLE_STATUS(id)); toast.success('Status toggled'); load(page); } catch { toast.error('Failed'); }
  };

  const viewUser = async (u) => {
    try {
      const { data } = await get(API.ADMIN.USER(u._id));
      setSelected(data.user || u);
      const { data: od } = await get(API.ADMIN.USER_ORDERS(u._id), { limit: 5 });
      setUserOrders(od.orders || []);
    } catch { toast.error('Failed'); }
  };

  if (loading && !users.length) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(8)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div><h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Users</h1><p className="text-xs text-gray-500 mt-0.5">{pagination?.total || 0} total</p></div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4 items-stretch">
        <div className="flex gap-2 flex-1 min-w-0 w-full sm:w-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Search name, email, phone..." className="input-luxe text-sm flex-1 min-h-[44px]" />
          <button onClick={handleSearch} className="btn-primary text-sm px-4 min-h-[44px]">Search</button>
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-luxe text-sm min-h-[44px] w-full sm:w-auto sm:min-w-[130px]"><option value="">All Roles</option><option value="customer">Customer</option><option value="vendor">Vendor</option><option value="admin">Admin</option><option value="subadmin">Sub Admin</option></select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-luxe text-sm min-h-[44px] w-full sm:w-auto sm:min-w-[130px]"><option value="">All Status</option><option value="true">Active</option><option value="false">Inactive</option></select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-border">
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">User</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden md:table-cell">Email / Phone</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Role</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden lg:table-cell">Joined</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
            <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className={`border-b border-border/50 hover:bg-gray-50/50 ${!u.isActive ? 'opacity-60' : ''}`}>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{u.name?.[0]}</div>
                    <div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-gray-400 md:hidden">{u.email}<br />{u.phone}</p></div>
                  </div>
                </td>
                <td className="py-3 px-2 hidden md:table-cell"><p className="text-sm">{u.email}</p><p className="text-xs text-gray-400">{u.phone || '—'}</p></td>
                <td className="py-3 px-2"><span className="text-xs bg-gray-100 px-2 py-0.5">{u.role}</span></td>
                <td className="py-3 px-2 hidden lg:table-cell text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 ${u.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="py-3 px-2 text-right">
                  <div className="flex gap-1 justify-end flex-wrap">
                    <button onClick={() => viewUser(u)} className="text-xs text-primary hover:underline min-h-[36px]">View</button>
                    <button onClick={() => toggleStatus(u._id)} className={`text-xs hover:underline min-h-[36px] ${u.isActive ? 'text-danger' : 'text-success'}`}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="text-center text-gray-500 py-12 text-sm">No users found</p>}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}

      {/* User Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => { setSelected(null); setUserOrders([]); }}>
          <div className="bg-white w-full max-w-2xl mx-0 sm:mx-4 rounded shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between">
              <h2 className="font-semibold">{selected.name}</h2>
              <button onClick={() => { setSelected(null); setUserOrders([]); }} className="text-gray-400 hover:text-gray-600 text-lg min-h-[36px] min-w-[36px]">&times;</button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-luxe p-3 text-center"><p className="text-lg font-bold">{selected.orderCount ?? '—'}</p><p className="text-xs text-gray-500">Orders</p></div>
                <div className="card-luxe p-3 text-center"><p className="text-lg font-bold">₹{selected.totalSpent?.toLocaleString() || 0}</p><p className="text-xs text-gray-500">Spent</p></div>
                <div className="card-luxe p-3 text-center"><p className="text-lg font-bold">₹{selected.walletBalance?.toLocaleString() || 0}</p><p className="text-xs text-gray-500">Wallet</p></div>
                <div className="card-luxe p-3 text-center"><p className="text-lg font-bold">{selected.referralCount ?? 0}</p><p className="text-xs text-gray-500">Referrals</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm"><div><span className="text-gray-500">Email:</span> {selected.email}</div><div><span className="text-gray-500">Phone:</span> {selected.phone || '—'}</div><div><span className="text-gray-500">Role:</span> {selected.role}</div><div><span className="text-gray-500">Joined:</span> {new Date(selected.createdAt).toLocaleDateString()}</div></div>
              <div><h3 className="font-medium text-sm mb-2">Recent Orders</h3>
                {userOrders.length === 0 ? <p className="text-xs text-gray-400">No orders</p> : (
                  <div className="space-y-2">{
                    userOrders.map(o => <div key={o._id} className="flex justify-between items-center p-2 border border-border text-sm">
                      <span className="font-medium">#{o.orderNumber}</span>
                      <span className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs">₹{o.total}</span>
                      <span className={`text-xs px-1.5 py-0.5 ${o.status === 'delivered' ? 'bg-success/10 text-success' : o.status === 'cancelled' ? 'bg-danger/10 text-danger' : 'bg-gray-100'}`}>{o.status}</span>
                    </div>)
                  }</div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => toggleStatus(selected._id)} className={`px-4 py-2 text-sm min-h-[44px] ${selected.isActive ? 'bg-danger text-white' : 'btn-primary'}`}>{selected.isActive ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminUsers;
