import { useState, useEffect } from 'react';
import { get, post, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const emptyAddress = { fullName: '', phone: '', alternatePhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', label: 'Home', isDefault: false };

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyAddress });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    get(API.USERS.ADDRESSES).then(({ data }) => setAddresses(data.addresses || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm({ ...emptyAddress }); setEditingId(null); setShowForm(true); };

  const openEdit = (addr) => {
    setForm({ fullName: addr.fullName, phone: addr.phone, alternatePhone: addr.alternatePhone || '', addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || '', landmark: addr.landmark || '', city: addr.city, state: addr.state, pincode: addr.pincode, label: addr.label || 'Home', isDefault: addr.isDefault });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await put(API.USERS.ADDRESS(editingId), form);
        setAddresses(data.addresses);
        toast.success('Address updated');
      } else {
        const { data } = await post(API.USERS.ADDRESSES, form);
        setAddresses(data.addresses);
        toast.success('Address added');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (id) => {
    try { const { data } = await put(API.USERS.ADDRESS_DEFAULT(id)); setAddresses(data.addresses); toast.success('Default address updated'); }
    catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this address?')) return;
    try { const { data } = await del(API.USERS.ADDRESS(id)); setAddresses(data.addresses); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">My Addresses</h1>
        <Button onClick={openAdd} size="sm">+ Add Address</Button>
      </div>

      {loading ? <div className="h-32 skeleton" /> : addresses.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No addresses saved</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="card-luxe p-4 flex flex-col gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium truncate">{addr.fullName}</p>
                  {addr.isDefault && <span className="text-[10px] bg-primary text-white px-2 py-0.5 uppercase tracking-wider flex-shrink-0">Default</span>}
                  {addr.label && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 uppercase tracking-wider flex-shrink-0">{addr.label}</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1 break-words">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                <p className="text-xs text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => openEdit(addr)} className="text-xs text-primary border border-primary px-3 py-1.5 min-h-[32px] rounded hover:bg-primary hover:text-white transition-colors">Edit</button>
                {!addr.isDefault && <button onClick={() => setDefault(addr._id)} className="text-xs text-primary border border-primary px-3 py-1.5 min-h-[32px] rounded hover:bg-primary hover:text-white transition-colors">Set Default</button>}
                <button onClick={() => remove(addr._id)} className="text-xs text-red-600 border border-red-600 px-3 py-1.5 min-h-[32px] rounded hover:bg-red-50 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-t-xl sm:rounded-xl mx-0 sm:mx-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Address' : 'Add Address'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl min-h-[44px] min-w-[44px] flex items-center justify-center sm:hidden">&times;</button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Full Name *</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Phone *</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Alt. Phone</label><input type="tel" value={form.alternatePhone} onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Label</label><select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]"><option>Home</option><option>Work</option><option>Other</option></select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Address Line 1 *</label><input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Address Line 2</label><input value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Landmark</label><input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">City *</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">State *</label><input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
                <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Pincode *</label><input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              </div>
              <label className="flex items-center gap-2 text-sm min-h-[44px] cursor-pointer select-none py-1"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4 accent-primary" /> <span>Set as default</span></label>
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                <Button type="submit" loading={saving} className="w-full sm:flex-1">Save</Button>
                <button type="button" onClick={() => setShowForm(false)} className="w-full sm:flex-1 px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
