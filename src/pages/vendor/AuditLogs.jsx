import { useState, useEffect } from 'react';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { formatDateTime } from '../../utils/helpers';

const actionOptions = ['', 'create', 'update', 'delete', 'login', 'logout', 'export', 'import'];

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => { load(); }, [page, action]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (action) params.action = action;
      const { data } = await get(API.VENDORS.AUDIT_LOGS, params);
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Audit Logs</h1>

      <div className="flex-col sm:flex-row gap-3 mb-6 flex">
        <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="input-luxe text-sm w-full sm:w-auto min-h-[44px]">
          <option value="">All Actions</option>
          {actionOptions.slice(1).map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-[600px] lg:min-w-0 w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Action</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Resource</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Details</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">IP</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((l, i) => (
                <tr key={l._id || i} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                    <span className={`text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 ${l.action === 'create' ? 'bg-success/10 text-success' : l.action === 'update' ? 'bg-primary/10 text-primary' : l.action === 'delete' ? 'bg-danger/10 text-danger' : 'bg-gray-50 text-gray-600'}`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs font-mono">{l.resource}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500 max-w-[200px] truncate">{typeof l.details === 'string' ? l.details : JSON.stringify(l.details || '')}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-400 font-mono">{l.ip || '-'}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{formatDateTime(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && <p className="text-center text-gray-500 py-8 sm:py-12 text-xs sm:text-sm">No audit logs found</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 text-xs sm:text-sm border border-border hover:bg-gray-50 disabled:opacity-30 min-h-[44px]">Previous</button>
          <span className="text-xs sm:text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs sm:text-sm border border-border hover:bg-gray-50 disabled:opacity-30 min-h-[44px]">Next</button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
