import { useState, useEffect } from 'react';
import { get, post, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const initialForm = { name: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', contactName: '', contactPhone: '' };

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const { data } = await get(API.VENDORS.WAREHOUSES); setWarehouses(data.warehouses || []); }
    catch { toast.error('Failed to load warehouses'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(initialForm); setModal('add'); };
  const openEdit = (w) => { setForm({ name: w.name, addressLine1: w.addressLine1 || '', addressLine2: w.addressLine2 || '', city: w.city || '', state: w.state || '', pincode: w.pincode || '', contactName: w.contactName || '', contactPhone: w.contactPhone || '' }); setModal({ id: w._id }); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal?.id) {
        await put(API.VENDORS.WAREHOUSE_UPDATE(modal.id), form);
        toast.success('Warehouse updated');
      } else {
        await post(API.VENDORS.WAREHOUSE_CREATE, form);
        toast.success('Warehouse created');
      }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteWarehouse = async (id) => {
    if (!confirm('Delete this warehouse?')) return;
    try { await del(API.VENDORS.WAREHOUSE_DELETE(id)); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Warehouses</h1>
        <button onClick={openAdd} className="btn-primary text-xs sm:text-sm px-4 py-2 min-h-[44px] w-full sm:w-auto">Add Warehouse</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-[600px] lg:min-w-0 w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Name</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Address</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">City</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Contact</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {warehouses.map((w) => (
                <tr key={w._id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-sm">{w.name}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500 max-w-[200px] truncate">{w.addressLine1}{w.addressLine2 && ', ' + w.addressLine2}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{w.city}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{w.contactName} {w.contactPhone && <span className="text-gray-400">({w.contactPhone})</span>}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3"><div className="flex gap-2"><button onClick={() => openEdit(w)} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">Edit</button><button onClick={() => deleteWarehouse(w._id)} className="text-xs sm:text-sm text-danger hover:underline min-h-[44px] flex items-center">Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {warehouses.length === 0 && <p className="text-center text-gray-500 py-8 sm:py-12 text-xs sm:text-sm">No warehouses yet</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-lg mx-0 sm:mx-4 p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg sm:text-xl font-semibold mb-4">{modal.id ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
            <form onSubmit={save} className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Address Line 1 *</label><input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Address Line 2</label><input value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">City *</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">State *</label><input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Pincode *</label><input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Contact Name</label><input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label><input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              </div>
              <div className="flex-col sm:flex-row gap-2 sm:gap-3 pt-2 flex">
                <button type="submit" disabled={saving} className="w-full sm:w-auto btn-primary text-xs sm:text-sm px-6 py-2 min-h-[44px]">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="w-full sm:w-auto px-6 py-2 text-sm border border-border hover:bg-gray-50 min-h-[44px]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
