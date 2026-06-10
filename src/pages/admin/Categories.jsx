import { useState, useEffect, useRef } from 'react';
import { get, post, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const emptyCat = { name: '', description: '', icon: '', displayOrder: 0, isActive: true, metaTitle: '', metaDescription: '' };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCat);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [subModal, setSubModal] = useState(null);
  const [subForm, setSubForm] = useState({ name: '', description: '', displayOrder: 0, isActive: true });
  const imgRef = useRef();

  const imgUrl = (val) => (typeof val === 'object' && val?.url ? val.url : val || '');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await get(API.ADMIN.CATEGORIES);
      setCategories(data.categories || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(emptyCat); setImageFile(null); setImagePreview(''); setModal('add'); };
  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description || '', icon: c.icon || '', displayOrder: c.displayOrder ?? 0, isActive: c.isActive ?? true, metaTitle: c.metaTitle || '', metaDescription: c.metaDescription || '' });
    setImagePreview(imgUrl(c.image));
    setImageFile(null);
    setModal({ id: c._id });
  };

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('files', file);
    const { data } = await post(API.UPLOAD.BASE, fd);
    const url = data.files?.[0]?.url;
    if (!url) throw new Error('Upload failed');
    return url;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const payload = { ...form };
      if (imageFile) payload.image = { url: await uploadFile(imageFile) };
      if (modal?.id) {
        await put(API.ADMIN.CATEGORY(modal.id), payload);
        toast.success('Category updated');
      } else {
        await post(API.ADMIN.CATEGORIES, payload);
        toast.success('Category created');
      }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (id, current) => {
    try { await put(API.ADMIN.CATEGORY(id), { isActive: !current }); toast.success(current ? 'Deactivated' : 'Activated'); load(); }
    catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this category? This will deactivate all subcategories.')) return;
    try { await del(API.ADMIN.CATEGORY(id)); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const openSub = (cat) => {
    setSubForm({ name: '', description: '', displayOrder: 0, isActive: true });
    setSubModal({ categoryId: cat._id, categoryName: cat.name, subs: cat.subCategories || [] });
  };

  const addSub = async () => {
    if (!subForm.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      await post(API.CATEGORIES.BASE + '/subcategories', { ...subForm, category: subModal.categoryId });
      toast.success('Subcategory created');
      setSubForm({ name: '', description: '', displayOrder: 0, isActive: true });
      const { data } = await get(API.ADMIN.CATEGORIES);
      const updated = data.categories?.find(c => c._id === subModal.categoryId);
      if (updated) setSubModal({ ...subModal, subs: updated.subCategories || [] });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleSubStatus = async (id, current) => {
    try { await put(API.CATEGORIES.BASE + `/subcategories/${id}`, { isActive: !current }); toast.success('Updated');
      const { data } = await get(API.ADMIN.CATEGORIES);
      const updated = data.categories?.find(c => c._id === subModal.categoryId);
      if (updated) setSubModal({ ...subModal, subs: updated.subCategories || [] });
    } catch { toast.error('Failed'); }
  };

  const removeSub = async (id) => {
    if (!confirm('Delete this subcategory?')) return;
    try { await del(API.CATEGORIES.BASE + `/subcategories/${id}`); toast.success('Deleted');
      const { data } = await get(API.ADMIN.CATEGORIES);
      const updated = data.categories?.find(c => c._id === subModal.categoryId);
      if (updated) setSubModal({ ...subModal, subs: updated.subCategories || [] });
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Categories</h1>
        <button onClick={openAdd} className="btn-primary text-xs sm:text-sm px-4 py-2 min-h-[44px]">Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className={`card-luxe p-4 ${!cat.isActive ? 'opacity-60' : ''}`}>
            {imgUrl(cat.image) && <div className="h-24 overflow-hidden -mx-4 -mt-4 mb-3"><img src={imgUrl(cat.image)} alt="" className="w-full h-full object-cover" /></div>}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {cat.icon && <span className="text-xl">{cat.icon}</span>}
                <div>
                  <h3 className="font-medium text-sm">{cat.name}</h3>
                  <p className="text-xs text-gray-400">/{cat.slug}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 ${cat.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="text-xs text-gray-500 mb-3">
              <span>Order: {cat.displayOrder ?? 0}</span>
              {cat.subCategories?.length > 0 && <span className="ml-3">Sub: {cat.subCategories.length}</span>}
            </div>
            {cat.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{cat.description}</p>}
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => openEdit(cat)} className="text-xs text-primary hover:underline min-h-[36px]">Edit</button>
              <button onClick={() => toggleStatus(cat._id, cat.isActive)} className="text-xs text-gray-500 hover:underline min-h-[36px]">{cat.isActive ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => openSub(cat)} className="text-xs text-purple-600 hover:underline min-h-[36px]">Subcategories</button>
              <button onClick={() => remove(cat._id)} className="text-xs text-danger hover:underline min-h-[36px]">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && <p className="text-center text-gray-500 py-12 text-sm">No categories yet</p>}

      {/* Category Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-lg mx-0 sm:mx-4 p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg sm:text-xl font-semibold mb-4">{modal.id ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Image (banner)</label>
                {imagePreview ? (
                  <div className="relative border border-border rounded overflow-hidden h-28">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover bg-gray-50" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} className="absolute top-1 right-1 bg-white/90 text-danger text-xs px-2 py-1 border border-border hover:bg-red-50 transition-colors min-h-[28px]">Remove</button>
                  </div>
                ) : (
                  <div onClick={() => imgRef.current?.click()} className="border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-gray-50/50 transition-colors h-20 sm:h-28">
                    <span className="text-xs text-gray-400">Click to upload</span>
                  </div>
                )}
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
                {!imagePreview && (
                  <input type="file" accept="image/*" className="mt-1.5 text-xs w-full" onChange={(e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
                )}
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Icon (emoji or class)</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" placeholder="e.g. 👕 or icon-class" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Display Order</label><input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Status</label><select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} className="input-luxe text-sm w-full min-h-[44px]"><option value="true">Active</option><option value="false">Inactive</option></select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Meta Title (SEO)</label><input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label><textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className="input-luxe text-sm w-full h-16 min-h-[44px]" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 min-h-[44px] flex-1 sm:flex-none">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px] flex-1 sm:flex-none">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategories Modal */}
      {subModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setSubModal(null)}>
          <div className="bg-white w-full max-w-lg mx-0 sm:mx-4 p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg sm:text-xl font-semibold mb-1">Subcategories</h2>
            <p className="text-sm text-gray-500 mb-4">{subModal.categoryName}</p>

            <div className="space-y-2 mb-4">
              {subModal.subs.length === 0 && <p className="text-xs text-gray-400">No subcategories yet</p>}
              {subModal.subs.map((s) => (
                <div key={s._id} className={`flex items-center justify-between p-2 border border-border ${!s.isActive ? 'opacity-50' : ''}`}>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-gray-400">/{s.slug} · Order: {s.displayOrder ?? 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleSubStatus(s._id, s.isActive)} className="text-xs text-gray-500 hover:underline min-h-[36px]">{s.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => removeSub(s._id)} className="text-xs text-danger hover:underline min-h-[36px]">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-medium uppercase tracking-wider mb-3">Add Subcategory</h3>
              <div className="space-y-2">
                <input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="Name" className="input-luxe text-sm w-full min-h-[44px]" />
                <div className="flex gap-2">
                  <input type="number" value={subForm.displayOrder} onChange={(e) => setSubForm({ ...subForm, displayOrder: Number(e.target.value) })} placeholder="Order" className="input-luxe text-sm w-24 min-h-[44px]" />
                  <button onClick={addSub} disabled={saving} className="btn-primary text-sm px-4 py-2 min-h-[44px] flex-1">{saving ? 'Adding...' : 'Add'}</button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button onClick={() => setSubModal(null)} className="w-full py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px]">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
