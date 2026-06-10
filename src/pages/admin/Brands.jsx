import { useState, useEffect, useRef } from 'react';
import { get, post, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const emptyBrand = { name: '', description: '', displayOrder: 0, isActive: true, isFeatured: false, metaTitle: '', metaDescription: '' };

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyBrand);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const logoRef = useRef();
  const coverRef = useRef();

  useEffect(() => { load(); }, []);

  const imgUrl = (val) => (typeof val === 'object' && val?.url ? val.url : val || '');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await get(API.ADMIN.BRANDS);
      setBrands(data.brands || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm(emptyBrand);
    setLogoFile(null); setCoverFile(null);
    setLogoPreview(''); setCoverPreview('');
    setModal('add');
  };

  const openEdit = (b) => {
    setForm({
      name: b.name || '', description: b.description || '',
      displayOrder: b.displayOrder ?? 0, isActive: b.isActive ?? true,
      isFeatured: b.isFeatured ?? false,
      metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || ''
    });
    setLogoPreview(imgUrl(b.logo));
    setCoverPreview(imgUrl(b.coverImage));
    setLogoFile(null); setCoverFile(null);
    setModal({ id: b._id });
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
      if (logoFile) payload.logo = { url: await uploadFile(logoFile) };
      if (coverFile) payload.coverImage = { url: await uploadFile(coverFile) };
      if (modal?.id) {
        await put(API.ADMIN.BRAND(modal.id), payload);
        toast.success('Brand updated');
      } else {
        await post(API.ADMIN.BRANDS, payload);
        toast.success('Brand created');
      }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (id, current) => {
    try { await put(API.ADMIN.BRAND(id), { isActive: !current }); toast.success(current ? 'Deactivated' : 'Activated'); load(); }
    catch { toast.error('Failed'); }
  };

  const toggleFeatured = async (id, current) => {
    try { await put(API.ADMIN.BRAND(id), { isFeatured: !current }); toast.success(current ? 'Unfeatured' : 'Featured'); load(); }
    catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this brand?')) return;
    try { await del(API.ADMIN.BRAND(id)); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const DropZone = ({ label, preview, onFile, onClear, height }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      {preview ? (
        <div className="relative border border-border rounded overflow-hidden" style={{ height: height || 120 }}>
          <img src={preview} alt="" className="w-full h-full object-contain bg-gray-50" />
          <button type="button" onClick={() => { onClear(); }} className="absolute top-1 right-1 bg-white/90 text-danger text-xs px-2 py-1 border border-border hover:bg-red-50 transition-colors min-h-[28px]">Remove</button>
        </div>
      ) : (
        <div onClick={() => logoRef.current?.click()} className="border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-gray-50/50 transition-colors" style={{ height: height || 120 }}>
          <span className="text-xs text-gray-400">Click to upload</span>
        </div>
      )}
      <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) onFile(f); }} />
      {!preview && (
        <input type="file" accept="image/*" className="mt-1.5 text-xs w-full" onChange={(e) => { const f = e.target.files[0]; if (f) onFile(f); }} />
      )}
    </div>
  );

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Brands</h1>
          <p className="text-xs text-gray-500 mt-0.5">{brands.length} brand{brands.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs sm:text-sm px-4 py-2 min-h-[44px]">Add Brand</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {brands.map((b) => (
          <div key={b._id} className={`card-luxe overflow-hidden ${!b.isActive ? 'opacity-60' : ''}`}>
            {imgUrl(b.coverImage) && <div className="h-20 overflow-hidden"><img src={imgUrl(b.coverImage)} alt="" className="w-full h-full object-cover" /></div>}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {imgUrl(b.logo) ? (
                  <img src={imgUrl(b.logo)} alt="" className="w-10 h-10 object-contain rounded border border-border" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-lg font-bold text-gray-400">{b.name?.[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{b.name}</h3>
                  <p className="text-xs text-gray-400">/{b.slug}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap text-xs mb-3">
                <span className={`px-2 py-0.5 ${b.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
                {b.isFeatured && <span className="bg-primary/10 text-primary px-2 py-0.5">Featured</span>}
                <span className="text-gray-400">Order: {b.displayOrder ?? 0}</span>
              </div>
              {b.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{b.description}</p>}
              <div className="flex gap-2 flex-wrap border-t border-border pt-3">
                <button onClick={() => openEdit(b)} className="text-xs text-primary hover:underline min-h-[36px]">Edit</button>
                <button onClick={() => toggleFeatured(b._id, b.isFeatured)} className="text-xs text-amber-600 hover:underline min-h-[36px]">{b.isFeatured ? 'Unfeature' : 'Feature'}</button>
                <button onClick={() => toggleStatus(b._id, b.isActive)} className="text-xs text-gray-500 hover:underline min-h-[36px]">{b.isActive ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => remove(b._id)} className="text-xs text-danger hover:underline min-h-[36px]">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {brands.length === 0 && <p className="text-center text-gray-500 py-12 text-sm">No brands yet. Click "Add Brand" to create one.</p>}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-2xl mx-0 sm:mx-4 rounded shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between z-10">
              <h2 className="text-base sm:text-lg font-semibold">{modal.id ? 'Edit Brand' : 'Add Brand'}</h2>
              <button type="button" onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 min-h-[36px] min-w-[36px] text-lg">&times;</button>
            </div>

            <form onSubmit={save} className="p-4 sm:p-6 space-y-5">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Branding</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DropZone label="Logo (square preferred)" preview={logoPreview} onFile={(f) => { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }} onClear={() => { setLogoFile(null); setLogoPreview(''); }} height={100} />
                  <DropZone label="Cover Image (banner)" preview={coverPreview} onFile={(f) => { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }} onClear={() => { setCoverFile(null); setCoverPreview(''); }} height={100} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Basic Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Brand Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" placeholder="e.g. Nike" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px]" placeholder="Brief description of the brand..." />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Display Order</label>
                      <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="input-luxe text-sm w-full min-h-[44px]" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} className="input-luxe text-sm w-full min-h-[44px]">
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 accent-primary" />
                        <span className="text-sm text-gray-700">Featured on homepage</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">SEO</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Meta Title</label>
                    <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" placeholder="Title for search engines" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className="input-luxe text-sm w-full h-16 min-h-[44px]" placeholder="Description for search results" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button type="submit" disabled={saving} className="btn-primary text-sm px-8 py-2.5 min-h-[44px]">{saving ? 'Saving...' : modal.id ? 'Update Brand' : 'Create Brand'}</button>
                <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 rounded min-h-[44px] transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
