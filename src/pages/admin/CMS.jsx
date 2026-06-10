import { useState, useEffect } from 'react';
import { get, put, post, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const AdminCMS = () => {
  const [pages, setPages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', metaTitle: '', metaDescription: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [newPage, setNewPage] = useState({ page: '', title: '', content: '', metaTitle: '', metaDescription: '' });

  useEffect(() => {
    get(API.ADMIN.CMS).then(({ data }) => setPages(data.pages || [])).catch(() => {});
  }, []);

  const startEdit = (p) => {
    let content = p.content;
    try { const parsed = JSON.parse(p.content); content = parsed.content || p.content; } catch {}
    setEditing(p.page);
    setForm({ title: p.title || '', content, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '' });
  };

  const save = async (page) => {
    if (!form.content.trim()) { toast.error('Content is required'); return; }
    try {
      await put(API.ADMIN.CMS_PAGE(page), form);
      toast.success('Page updated');
      setEditing(null);
      const { data } = await get(API.ADMIN.CMS);
      setPages(data.pages || []);
    } catch { toast.error('Failed to save'); }
  };

  const deactivate = async (page) => {
    if (!confirm('Deactivate this page? It will be hidden from the public site.')) return;
    try {
      await del(API.ADMIN.CMS_DELETE(page));
      toast.success('Page deactivated');
      setPages(pages.filter(p => p.page !== page));
    } catch { toast.error('Failed to deactivate'); }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!newPage.page.trim() || !newPage.title.trim() || !newPage.content.trim()) {
      toast.error('Page name, title, and content are required');
      return;
    }
    try {
      await post(API.ADMIN.CMS_CREATE, newPage);
      toast.success('Page created');
      setShowCreate(false);
      setNewPage({ page: '', title: '', content: '', metaTitle: '', metaDescription: '' });
      const { data } = await get(API.ADMIN.CMS);
      setPages(data.pages || []);
    } catch { toast.error('Failed to create'); }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">CMS Pages</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-xs px-4 py-2 min-h-[44px] w-full sm:w-auto">
          {showCreate ? 'Cancel' : '+ New Page'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={create} className="card-luxe p-4 sm:p-5 mb-6 space-y-3 sm:space-y-4">
          <h2 className="text-sm font-semibold">Create New CMS Page</h2>
          <input value={newPage.page} onChange={(e) => setNewPage({ ...newPage, page: e.target.value.replace(/\s+/g, '-').toLowerCase() })} placeholder="Page slug (e.g., about-us)" className="input-luxe text-sm w-full min-h-[44px]" />
          <input value={newPage.title} onChange={(e) => setNewPage({ ...newPage, title: e.target.value })} placeholder="Page title" className="input-luxe text-sm w-full min-h-[44px]" />
          <textarea value={newPage.content} onChange={(e) => setNewPage({ ...newPage, content: e.target.value })} placeholder="Page content" className="input-luxe h-32 text-sm w-full min-h-[44px]" />
          <input value={newPage.metaTitle} onChange={(e) => setNewPage({ ...newPage, metaTitle: e.target.value })} placeholder="Meta title (optional)" className="input-luxe text-sm w-full min-h-[44px]" />
          <input value={newPage.metaDescription} onChange={(e) => setNewPage({ ...newPage, metaDescription: e.target.value })} placeholder="Meta description (optional)" className="input-luxe text-sm w-full min-h-[44px]" />
          <button type="submit" className="btn-primary text-xs px-4 py-2 min-h-[44px] w-full sm:w-auto">Create Page</button>
        </form>
      )}

      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {pages.map((p) => (
          <div key={p._id} className="card-luxe overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium capitalize">{p.page.replace(/_/g, ' ').replace(/-/g, ' ')}</h3>
                <p className="text-xs text-gray-500">v{p.version || 1} &middot; {p.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="text-xs text-primary hover:underline min-h-[36px] min-w-[36px]">Edit</button>
                <button onClick={() => deactivate(p.page)} className="text-xs text-danger hover:underline min-h-[36px] min-w-[36px]">Deactivate</button>
              </div>
            </div>
            {editing === p.page && (
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Page title" className="input-luxe text-sm w-full min-h-[44px]" />
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-luxe h-40 text-sm w-full min-h-[44px]" />
                <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="Meta title" className="input-luxe text-sm w-full min-h-[44px]" />
                <input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Meta description" className="input-luxe text-sm w-full min-h-[44px]" />
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button onClick={() => save(p.page)} className="btn-primary text-xs px-4 py-2 w-full sm:w-auto min-h-[44px]">Save</button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs border border-border w-full sm:w-auto min-h-[44px]">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {pages.length === 0 && <p className="text-center text-gray-500 py-8 sm:py-12 text-xs sm:text-sm">No CMS pages yet. Create one above.</p>}
      </div>
    </div>
  );
};

export default AdminCMS;