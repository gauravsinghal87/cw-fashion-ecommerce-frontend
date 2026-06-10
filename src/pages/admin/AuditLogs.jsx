import { useState, useEffect } from 'react';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 50 };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;
      const { data } = await get(API.ADMIN.AUDIT_LOGS, params);
      setLogs(data.logs || []);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [actionFilter, resourceFilter]);

  if (loading && !logs.length) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(8)].map((_, i) => <div key={i} className="h-12 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="section-title">Audit Logs</h1><p className="text-xs text-gray-500 mt-0.5">{pagination?.total || 0} entries</p></div>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input-luxe text-sm min-h-[44px]">
          <option value="">All Actions</option>
          <option value="create">Create</option><option value="update">Update</option><option value="delete">Delete</option><option value="approve">Approve</option><option value="reject">Reject</option><option value="suspend">Suspend</option><option value="login">Login</option>
        </select>
        <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)} className="input-luxe text-sm min-h-[44px]">
          <option value="">All Resources</option>
          <option value="user">User</option><option value="vendor">Vendor</option><option value="product">Product</option><option value="order">Order</option><option value="coupon">Coupon</option><option value="category">Category</option><option value="brand">Brand</option><option value="banner">Banner</option><option value="withdrawal">Withdrawal</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-border">
            <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Admin</th>
            <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Action</th>
            <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Resource</th>
            <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 hidden md:table-cell">Details</th>
            <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Date</th>
            <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">IP</th>
          </tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-b border-border/50 hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpanded(expanded === log._id ? null : log._id)}>
                <td className="py-3 px-2 text-sm">{log.user?.name || log.user?.email || 'System'}</td>
                <td className="py-3 px-2"><span className={'text-xs px-2 py-0.5 ' + (log.action === 'create' || log.action === 'approve' ? 'bg-success/10 text-success' : log.action === 'delete' || log.action === 'reject' || log.action === 'suspend' ? 'bg-danger/10 text-danger' : 'bg-blue-50 text-blue-700')}>{log.action}</span></td>
                <td className="py-3 px-2 text-xs">{log.resource} <span className="text-gray-400">#{log.resourceId?.slice(-6)}</span></td>
                <td className="py-3 px-2 hidden md:table-cell text-xs text-gray-500 max-w-[200px] truncate">{log.description || '\u2014'}</td>
                <td className="py-3 px-2 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="py-3 px-2 text-xs text-gray-400">{log.ip || '\u2014'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs.length && <p className="text-center text-gray-500 py-12 text-sm">No logs found</p>}
      </div>

      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setExpanded(null)}>
          <div className="bg-white w-full max-w-lg mx-auto p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold">Log Detail</h3><button onClick={() => setExpanded(null)} className="text-gray-400 hover:text-gray-600 text-lg min-h-[36px] min-w-[36px]">&times;</button></div>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Admin:</span> {logs.find(l => l._id === expanded)?.user?.name || 'System'}</div>
              <div><span className="text-gray-500">Action:</span> {logs.find(l => l._id === expanded)?.action}</div>
              <div><span className="text-gray-500">Resource:</span> {logs.find(l => l._id === expanded)?.resource} ({logs.find(l => l._id === expanded)?.resourceId})</div>
              <div><span className="text-gray-500">Description:</span> {logs.find(l => l._id === expanded)?.description || '\u2014'}</div>
              <div><span className="text-gray-500">IP:</span> {logs.find(l => l._id === expanded)?.ip || '\u2014'}</div>
              <div><span className="text-gray-500">Date:</span> {new Date(logs.find(l => l._id === expanded)?.createdAt).toLocaleString()}</div>
              {logs.find(l => l._id === expanded)?.changes && <div className="mt-3"><span className="text-gray-500 font-medium">Changes:</span><pre className="text-xs bg-gray-50 p-2 mt-1 overflow-auto max-h-40">{JSON.stringify(logs.find(l => l._id === expanded)?.changes, null, 2)}</pre></div>}
            </div>
          </div>
        </div>
      )}

      {pagination?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}
    </div>
  );
};
export default AdminAuditLogs;
