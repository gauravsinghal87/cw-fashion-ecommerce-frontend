import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../utils/helpers';

const VendorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const { data } = await get(API.VENDORS.NOTIFICATIONS); setNotifications(data.notifications || []); }
    catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await put(`${API.VENDORS.NOTIFICATIONS_MARK_READ}/${id}`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch { toast.error('Failed to mark as read'); }
  };

  const markAllRead = async () => {
    try {
      await put(API.VENDORS.NOTIFICATIONS_MARK_ALL_READ);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllRead} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">Mark All Read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-8 sm:p-12 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n._id} className={`bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 flex items-start gap-3 cursor-pointer transition ${n.read ? 'opacity-70' : 'border-l-4 border-l-primary'}`} onClick={() => !n.read && markRead(n._id)}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-gray-300' : 'bg-primary'}`} />
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm ${n.read ? 'font-normal' : 'font-medium'}`}>{n.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorNotifications;
