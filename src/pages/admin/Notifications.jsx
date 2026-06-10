import { useState, useEffect } from 'react';
import { get, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const AdminNotifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', recipientRole: 'all' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    get(API.ADMIN.NOTIFICATIONS, { page, limit: 20 }).then(({ data }) => {
      setNotifs(data.notifications || []);
      setTotalPages(data.pagination?.totalPages || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  const send = async (e) => {
    e.preventDefault();
    try { await post(API.ADMIN.NOTIFICATIONS_SEND, form); toast.success('Sent!'); setForm({ title: '', message: '', recipientRole: 'all' }); window.location.reload(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold mb-4 sm:mb-6">Notifications</h1>
      <form onSubmit={send} className="card-luxe p-4 sm:p-5 md:p-6 mb-6 space-y-3 sm:space-y-4 max-w-xl">
        <h3 className="text-sm font-medium">Send Notification</h3>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="input-luxe text-sm w-full min-h-[44px]" required />
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message" className="input-luxe text-sm h-20 w-full min-h-[44px]" required />
        <select value={form.recipientRole} onChange={(e) => setForm({ ...form, recipientRole: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]">
          <option value="all">All Users</option><option value="customer">Customers</option><option value="vendor">Vendors</option><option value="admin">Admins</option>
        </select>
        <button type="submit" className="btn-primary text-xs px-4 py-2 w-full sm:w-auto min-h-[44px]">Send</button>
      </form>
      <div className="space-y-2">
        {notifs.map((n) => (
          <div key={n._id} className="p-4 border border-border bg-white flex flex-col sm:flex-row items-start justify-between gap-2">
            <div className="flex-1 min-w-0"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-gray-500">{n.message}</p></div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(n.createdAt)}</span>
          </div>
        ))}
      </div>
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

export default AdminNotifications;
