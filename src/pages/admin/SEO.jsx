import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const SEO = () => {
  const [type, setType] = useState('product');
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [seo, setSeo] = useState({ metaTitle: '', metaDescription: '', ogImage: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

   useEffect(() => {
     const fetchItems = async () => {
       setLoading(true);
       try {
         const ep = type === 'product' ? API.ADMIN.PRODUCTS : type === 'category' ? API.ADMIN.CATEGORIES : API.ADMIN.BRANDS;
         const { data } = await get(ep);
         const list = data.products || data.categories || data.brands || [];
         setItems(list);
       } catch { setItems([]); }
       finally { setLoading(false); }
     };
     fetchItems();
   }, [type]);

   const loadSEO = async () => {
     if (!selectedId) return;
     try {
       const { data } = await get(`${API.ADMIN.SEO}?type=${type}&id=${selectedId}`);
       const s = data.seo || {};
       setSeo({ metaTitle: s.metaTitle || s.title || '', metaDescription: s.metaDescription || '', ogImage: s.ogImage?.url || '' });
     } catch { setSeo({ metaTitle: '', metaDescription: '', ogImage: '' }); }
   };

   const save = async (e) => {
     e.preventDefault();
     if (!selectedId) return;
     setSaving(true);
     try {
       await put(API.ADMIN.SEO, { type, id: selectedId, ...seo });
       toast.success('SEO updated');
     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
     finally { setSaving(false); }
   };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-2xl">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold mb-4 sm:mb-6">SEO Settings</h1>
      <div className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto flex-nowrap gap-1 sm:gap-2 flex">
          {['product', 'category', 'brand'].map(t => (
            <button key={t} onClick={() => { setType(t); setSelectedId(''); setSeo({ metaTitle: '', metaDescription: '', ogImage: '' }); }} className={`px-4 py-1.5 text-xs border capitalize whitespace-nowrap min-h-[36px] ${type === t ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'}`}>{t}</button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-end">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-600 mb-0.5">Select {type}</label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="input-luxe text-sm w-full min-h-[44px]">
              <option value="">Choose...</option>
              {items.map(i => <option key={i._id} value={i._id}>{i.title || i.name}</option>)}
            </select>
          </div>
          <button onClick={loadSEO} disabled={!selectedId} className="px-4 py-2 text-xs border border-border hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto min-h-[44px]">Load</button>
        </div>
        {selectedId && (
          <form onSubmit={save} className="space-y-3 sm:space-y-4 card-luxe p-4 sm:p-5 md:p-6">
            <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Meta Title</label><input value={seo.metaTitle} onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Meta Description</label><textarea value={seo.metaDescription} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} className="input-luxe text-sm h-20 w-full min-h-[44px]" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-0.5">OG Image URL</label><input value={seo.ogImage} onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" placeholder="https://..." /></div>
            <Button type="submit" loading={saving}>Save SEO</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SEO;
