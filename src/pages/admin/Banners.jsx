import { useState, useEffect } from 'react';
import { get, post, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const BANNER_TYPES = ['hero', 'festival', 'sale', 'promotional'];

const emptyBanner = { title: '', subtitle: '', link: '', type: 'hero', priority: 1, isActive: true, startDate: '', endDate: '' };

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyBanner);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const { data } = await get(API.ADMIN.BANNERS); setBanners(data.banners || []); } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const uploadFile = async (file) => {
    const fd = new FormData(); fd.append('files', file);
    const { data } = await post(API.UPLOAD.BASE, fd);
    return data.files?.[0]?.url;
  };

  const openAdd = () => { setForm(emptyBanner); setImageFile(null); setImagePreview(''); setModal('add'); };
  const openEdit = (b) => {
    setForm({ title: b.title || '', subtitle: b.subtitle || '', link: b.link || '', type: b.type || 'hero', priority: b.priority ?? 1, isActive: b.isActive ?? true, startDate: b.startDate ? b.startDate.slice(0, 10) : '', endDate: b.endDate ? b.endDate.slice(0, 10) : '' });
    setImagePreview(b.image?.url || b.image || ''); setImageFile(null); setModal({ id: b._id });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = { ...form };
      if (imageFile) payload.image = { url: await uploadFile(imageFile) };
      if (modal?.id) { await put(API.ADMIN.BANNER_UPDATE(modal.id), payload); toast.success('Updated'); }
      else { await post(API.ADMIN.BANNER_CREATE, payload); toast.success('Created'); }
      setModal(null); load();
    } catch (err) { toast.error('Failed'); } finally { setSaving(false); }
  };

  const toggleStatus = async (id, current) => {
    try { await put(API.ADMIN.BANNER_UPDATE(id), { isActive: !current }); toast.success('Toggled'); load(); } catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try { await del(API.ADMIN.BANNER_DELETE(id)); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-title">Banners</h1><button onClick={openAdd} className="btn-primary text-sm px-4 py-2 min-h-[44px]">Add Banner</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b) => (
          <div key={b._id} className={'card-luxe overflow-hidden ' + (!b.isActive ? 'opacity-60' : '')}>
            {b.image && <div className="h-32 overflow-hidden"><img src={b.image?.url || b.image} alt={b.title} className="w-full h-full object-cover" /></div>}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div><h3 className="font-medium text-sm">{b.title}</h3><p className="text-xs text-gray-400">{b.subtitle || ''}</p></div>
                <span className="text-xs bg-gray-100 px-2 py-0.5 capitalize">{b.type}</span>
              </div>
              <div className="flex gap-2 flex-wrap text-xs mb-3">
                <span className="text-gray-400">Priority: {b.priority}</span>
                <span className={'px-2 py-0.5 ' + (b.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500')}>{b.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              {b.link && <p className="text-xs text-gray-400 truncate mb-3">{b.link}</p>}
              <div className="flex gap-2 flex-wrap border-t border-border pt-3 text-xs">
                <button onClick={() => openEdit(b)} className="text-primary hover:underline min-h-[36px]">Edit</button>
                <button onClick={() => toggleStatus(b._id, b.isActive)} className="text-gray-500 hover:underline min-h-[36px]">{b.isActive ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => remove(b._id)} className="text-danger hover:underline min-h-[36px]">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!banners.length && <p className="text-center text-gray-500 py-12 text-sm">No banners yet</p>}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-lg mx-0 sm:mx-4 p-4 sm:p-6 rounded shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-4">{modal.id ? 'Edit Banner' : 'Add Banner'}</h2>
            <form onSubmit={save} className="space-y-3">
              <div><label className="block text-xs text-gray-700 mb-1">Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              <div><label className="block text-xs text-gray-700 mb-1">Subtitle</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              <div><label className="block text-xs text-gray-700 mb-1">Link URL</label><input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" placeholder="/flash-sale" /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]">
                    {BANNER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select></div>
                <div><label className="block text-xs text-gray-700 mb-1">Priority</label>
                  <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              </div>

              <div><label className="block text-xs text-gray-700 mb-1">Banner Image</label>
                {imagePreview && <img src={imagePreview} alt="" className="w-full h-24 object-cover mb-2 rounded" />}
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} className="text-sm w-full" /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
                <div><label className="block text-xs text-gray-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="banner-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="banner-active" className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 min-h-[44px] flex-1 sm:flex-none">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1 sm:flex-none">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminBanners;
