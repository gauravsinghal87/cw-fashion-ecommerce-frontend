import { useState, useEffect } from 'react';
import { get, post, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';

const emptyCoupon = {
  code: '', type: 'percentage', value: '', description: '',
  minAmount: '', maxDiscount: '', usageLimit: '', usagePerUser: '1',
  isActive: true, startDate: '', endDate: '',
  applicableOn: 'all', applicableIds: [],
  isFirstOrderOnly: false, shippingWaived: false,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('list');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { if (tab === 'list') load(); else loadAnalytics(); }, [tab, page]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await get(API.ADMIN.COUPONS, { page, limit: 20 });
      setCoupons(data.coupons || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try { const { data } = await get(API.ADMIN.COUPON_ANALYTICS); setAnalytics(data.analytics); } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const openAdd = () => { setForm(emptyCoupon); setModal('add'); };
  const openEdit = (c) => {
    setForm({
      code: c.code || '', type: c.type || 'percentage', value: c.value || '', description: c.description || '',
      minAmount: c.minAmount || '', maxDiscount: c.maxDiscount || '',
      usageLimit: c.usageLimit || '', usagePerUser: c.usagePerUser || '1',
      isActive: c.isActive ?? true,
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      applicableOn: c.applicableOn || 'all', applicableIds: c.applicableIds || [],
      isFirstOrderOnly: c.isFirstOrderOnly || false, shippingWaived: c.shippingWaived || false,
    });
    setModal({ id: c._id });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Code is required');
    if (form.type !== 'free_shipping' && !form.value) return toast.error('Discount value is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: form.value ? Number(form.value) : undefined,
        minAmount: form.minAmount ? Number(form.minAmount) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
      usagePerUser: form.usagePerUser > 0 ? Number(form.usagePerUser) : 0,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };
      if (payload.type === 'free_shipping') { delete payload.value; }
      if (modal?.id) { await put(API.ADMIN.COUPON(modal.id), payload); toast.success('Updated'); }
      else { await post(API.ADMIN.COUPONS, payload); toast.success('Created'); }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const toggleStatus = async (id, current) => {
    try { await put(API.ADMIN.COUPON(id), { isActive: !current }); toast.success('Toggled'); load(); } catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await del(API.ADMIN.COUPON(id)); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Coupons</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('list')} className={`px-4 py-2 text-sm border min-h-[44px] ${tab === 'list' ? 'bg-primary text-white border-primary' : 'border-border'}`}>Coupons</button>
          <button onClick={() => setTab('analytics')} className={`px-4 py-2 text-sm border min-h-[44px] ${tab === 'analytics' ? 'bg-primary text-white border-primary' : 'border-border'}`}>Analytics</button>
          {tab === 'list' && <button onClick={openAdd} className="btn-primary text-sm px-4 py-2 min-h-[44px]">Add Coupon</button>}
        </div>
      </div>

      {tab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-luxe p-4"><p className="text-xs text-gray-500">Total Usage</p><p className="text-2xl font-bold">{analytics.totalUsage}</p></div>
            <div className="card-luxe p-4"><p className="text-xs text-gray-500">Total Discount Given</p><p className="text-2xl font-bold">{formatPrice(analytics.totalDiscount)}</p></div>
            <div className="card-luxe p-4"><p className="text-xs text-gray-500">Active Coupons</p><p className="text-2xl font-bold">{analytics.activeCount}</p></div>
          </div>
          <div className="card-luxe overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-border">
                <th className="py-3 px-3 font-medium text-xs uppercase text-gray-500">Code</th>
                <th className="py-3 px-3 font-medium text-xs uppercase text-gray-500">Type</th>
                <th className="py-3 px-3 font-medium text-xs uppercase text-gray-500 text-right">Usage</th>
                <th className="py-3 px-3 font-medium text-xs uppercase text-gray-500 text-right">Discount Given</th>
                <th className="py-3 px-3 font-medium text-xs uppercase text-gray-500">Status</th>
              </tr></thead>
              <tbody>
                {analytics.coupons?.map(c => (
                  <tr key={c._id} className="border-b border-border/50">
                    <td className="py-3 px-3 font-mono font-bold">{c.code}</td>
                    <td className="py-3 px-3 text-xs capitalize">{c.type}</td>
                    <td className="py-3 px-3 text-right">{c.usedCount || 0}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                    <td className="py-3 px-3 text-right">{formatPrice(c.totalDiscountGiven || 0)}</td>
                    <td className="py-3 px-3"><span className={`text-xs px-2 py-0.5 ${c.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-border">
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Code</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Discount</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 hidden md:table-cell">Type / Scope</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 hidden md:table-cell">Min / Max</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 hidden lg:table-cell">Used</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Valid</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Status</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className={'border-b border-border/50 hover:bg-gray-50/50 ' + (!c.isActive ? 'opacity-60' : '')}>
                  <td className="py-3 px-2 font-mono font-bold text-sm">{c.code}</td>
                  <td className="py-3 px-2 text-sm">
                    {c.type === 'free_shipping' ? 'Free Shipping' :
                     c.type === 'percentage' ? c.value + '%' :
                     c.type === 'new_user' ? (c.value ? c.value + '%' : 'First Order') :
                     formatPrice(c.value)}
                  </td>
                  <td className="py-3 px-2 hidden md:table-cell text-xs">
                    <span className="capitalize">{c.type}</span>
                    {c.applicableOn !== 'all' && <span className="ml-1 text-gray-400">({c.applicableOn})</span>}
                    {c.isFirstOrderOnly && <span className="ml-1 text-amber-600">• New user</span>}
                    {c.shippingWaived && <span className="ml-1 text-blue-600">• Free ship</span>}
                  </td>
                  <td className="py-3 px-2 hidden md:table-cell text-xs">{formatPrice(c.minAmount || 0)} / {c.maxDiscount ? formatPrice(c.maxDiscount) : '∞'}</td>
                  <td className="py-3 px-2 hidden lg:table-cell text-xs">{c.usedCount || 0}{c.usageLimit ? '/' + c.usageLimit : ''}</td>
                  <td className="py-3 px-2 text-xs">
                    {new Date(c.endDate) < new Date() ? <span className="text-danger">Expired</span> : <span className="text-success">{new Date(c.startDate) > new Date() ? 'Upcoming' : 'Active'}</span>}
                  </td>
                  <td className="py-3 px-2">
                    <span className={'text-xs px-2 py-0.5 ' + (c.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500')}>{c.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex gap-1 justify-end flex-wrap text-xs">
                      <button onClick={() => openEdit(c)} className="text-primary hover:underline min-h-[36px]">Edit</button>
                      <button onClick={() => toggleStatus(c._id, c.isActive)} className="text-gray-500 hover:underline min-h-[36px]">{c.isActive ? 'Disable' : 'Enable'}</button>
                      <button onClick={() => remove(c._id)} className="text-danger hover:underline min-h-[36px]">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!coupons.length && <p className="text-center text-gray-500 py-12 text-sm">No coupons</p>}
        </div>
      )}

      {tab === 'list' && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-lg mx-0 sm:mx-4 p-4 sm:p-6 rounded shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-4">{modal.id ? 'Edit Coupon' : 'Add Coupon'}</h2>
            <form onSubmit={save} className="space-y-3">
              <div><label className="block text-xs text-gray-700 mb-1">Coupon Code *</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-luxe text-sm w-full min-h-[44px] uppercase" required /></div>
              <div><label className="block text-xs text-gray-700 mb-1">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-700 mb-1">Coupon Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                    <option value="new_user">New User</option>
                  </select></div>
                <div><label className="block text-xs text-gray-700 mb-1">{form.type === 'percentage' || form.type === 'new_user' ? 'Percentage (%)' : form.type === 'free_shipping' ? '—' : 'Amount (₹)'}</label>
                  <input type="number" value={form.type === 'free_shipping' ? '' : form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" disabled={form.type === 'free_shipping'} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-700 mb-1">Min Order Amount</label><input type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
                <div><label className="block text-xs text-gray-700 mb-1">Max Discount</label><input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-700 mb-1">Total Usage Limit (0 = unlim)</label><input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
                <div><label className="block text-xs text-gray-700 mb-1">Per User Limit</label><input type="number" value={form.usagePerUser} onChange={(e) => setForm({ ...form, usagePerUser: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              </div>

              <div><label className="block text-xs text-gray-700 mb-1">Applicable On</label>
                <select value={form.applicableOn} onChange={(e) => setForm({ ...form, applicableOn: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]">
                  <option value="all">All Products</option>
                  <option value="category">Specific Categories</option>
                  <option value="brand">Specific Brands</option>
                </select></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-700 mb-1">Start Date *</label><input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
                <div><label className="block text-xs text-gray-700 mb-1">Expiry Date *</label><input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" /> Active</label>
                <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.isFirstOrderOnly} onChange={(e) => setForm({ ...form, isFirstOrderOnly: e.target.checked })} className="w-4 h-4" /> First Order Only</label>
                <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.shippingWaived} onChange={(e) => setForm({ ...form, shippingWaived: e.target.checked })} className="w-4 h-4" /> Free Shipping</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 min-h-[44px] flex-1">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
