import { useState, useEffect } from 'react';
import { get, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [flashModal, setFlashModal] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (status === 'hidden') params.showHidden = 'true';
        else if (status) params.approvalStatus = status;
        const { data } = await get(API.ADMIN.PRODUCTS, params);
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [status, page]);

  const approve = async (id) => {
    try { await put(API.ADMIN.PRODUCT_APPROVE(id)); toast.success('Product approved'); setProducts(products.map(p => p._id === id ? { ...p, approvalStatus: 'approved', status: 'approved' } : p)); }
    catch { toast.error('Failed to approve'); }
  };

  const reject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try { await put(API.ADMIN.PRODUCT_REJECT(id), { reason }); toast.success('Product rejected'); setProducts(products.map(p => p._id === id ? { ...p, approvalStatus: 'rejected', status: 'rejected' } : p)); }
    catch { toast.error('Failed to reject'); }
  };

  const toggleFeatured = async (id) => {
    try { const { data } = await put(API.ADMIN.PRODUCT_TOGGLE_FEATURED(id)); toast.success(data.product.isFeatured ? 'Featured' : 'Unfeatured'); setProducts(products.map(p => p._id === id ? { ...p, isFeatured: data.product.isFeatured } : p)); }
    catch { toast.error('Failed'); }
  };

  const hide = async (id) => {
    const reason = prompt('Hide reason:');
    if (!reason) return;
    try { await put(API.ADMIN.PRODUCT_HIDE(id), { reason }); toast.success('Product hidden'); setProducts(products.filter(p => p._id !== id)); }
    catch { toast.error('Failed to hide'); }
  };

  const unhide = async (id) => {
    try {
      const { data } = await put(API.ADMIN.PRODUCT_UNHIDE(id));
      toast.success('Product restored');
      setProducts(products.map(p => p._id === id ? { ...p, isActive: true } : p));
    }
    catch { toast.error('Failed'); }
  };

  const refreshProducts = async () => {
    try {
      const params = { page, limit: 20 };
      if (status) params.approvalStatus = status;
      const { data } = await get(API.ADMIN.PRODUCTS, params);
      setProducts(data.products || []);
    } catch {}
  };

  const toDatetimeLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const saveFlashSale = async (id) => {
    try {
      const body = {
        flashSalePrice: flashModal.flashSalePrice,
        flashSaleStart: flashModal.flashSaleStart ? new Date(flashModal.flashSaleStart).toISOString() : undefined,
        flashSaleEnd: flashModal.flashSaleEnd ? new Date(flashModal.flashSaleEnd).toISOString() : undefined,
      };
      await put(API.ADMIN.PRODUCT_FLASH_SALE(id), body);
      toast.success('Flash sale set');
      setFlashModal(null);
      setProducts(products.map(p => p._id === id ? { ...p, isFlashSale: true, flashSalePrice: flashModal.flashSalePrice } : p));
    } catch { toast.error('Failed'); }
  };

  const removeFlashSale = async (id) => {
    try { await del(API.ADMIN.PRODUCT_FLASH_SALE(id)); toast.success('Flash sale removed'); setProducts(products.map(p => p._id === id ? { ...p, isFlashSale: false } : p)); }
    catch { toast.error('Failed'); }
  };

  const toggleReturnable = async (id) => {
    try {
      const { data } = await put(API.ADMIN.PRODUCT_TOGGLE_RETURNABLE(id));
      toast.success(`Product ${data.product.isReturnable ? 'returnable' : 'non-returnable'}`);
      setProducts(products.map(p => p._id === id ? { ...p, isReturnable: data.product.isReturnable } : p));
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Products</h1>
        <div className="overflow-x-auto flex-nowrap gap-1 sm:gap-2 flex">
          {['', 'pending', 'approved', 'rejected', 'hidden'].map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-3 py-1.5 text-xs border whitespace-nowrap min-h-[36px] ${status === s ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'}`}>{s === 'hidden' ? 'Hidden' : s || 'All'}</button>
          ))}
        </div>
      </div>

      <div className="card-luxe overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0 rounded-lg shadow">
          <table className="w-full text-sm min-w-[800px] lg:min-w-0">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm uppercase tracking-wider text-gray-500">Product</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm uppercase tracking-wider text-gray-500">Vendor</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm uppercase tracking-wider text-gray-500">Price</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm uppercase tracking-wider text-gray-500">Approval</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm uppercase tracking-wider text-gray-500">Badges</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gray-50 border border-border overflow-hidden flex-shrink-0">
                        {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <p className="text-sm line-clamp-1">{p.title}</p>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">{p.vendor?.storeName || 'N/A'}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(p.minPrice || 0)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    <span className={`inline-flex px-2 py-0.5 text-xs ${p.approvalStatus === 'approved' ? 'bg-success/10 text-success' : p.approvalStatus === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-danger/10 text-danger'}`}>{p.approvalStatus}</span>
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    <div className="flex gap-1 flex-wrap">
                      {p.isFeatured && <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 text-xs">Featured</span>}
                      {p.isFlashSale && <span className="bg-red-50 text-red-700 px-1.5 py-0.5 text-xs">Flash</span>}
                      {p.needsReapproval && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 text-xs">Reapproval</span>}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    <div className="flex gap-2 flex-wrap items-center">
                      {p.approvalStatus === 'pending' && (
                        <>
                          <button onClick={() => approve(p._id)} className="text-xs text-success hover:underline min-h-[36px] min-w-[36px]">Approve</button>
                          <button onClick={() => reject(p._id)} className="text-xs text-danger hover:underline min-h-[36px] min-w-[36px]">Reject</button>
                        </>
                      )}
                      <button onClick={() => toggleFeatured(p._id)} className="text-xs text-purple-600 hover:underline min-h-[36px] min-w-[36px]">{p.isFeatured ? 'Unfeature' : 'Feature'}</button>
                      <button onClick={() => setFlashModal({
                        productId: p._id,
                        flashSalePrice: p.flashSalePrice || '',
                        flashSaleStart: p.flashSaleStart ? toDatetimeLocal(p.flashSaleStart) : '',
                        flashSaleEnd: p.flashSaleEnd ? toDatetimeLocal(p.flashSaleEnd) : '',
                      })} className="text-xs text-red-600 hover:underline min-h-[36px] min-w-[36px]">{p.isFlashSale ? 'Edit Flash' : 'Flash Sale'}</button>
                      {p.isFlashSale && <button onClick={() => removeFlashSale(p._id)} className="text-xs text-gray-500 hover:underline min-h-[36px] min-w-[36px]">Remove Flash</button>}
                      {p.isActive === false ? (
                        <button onClick={() => unhide(p._id)} className="text-xs text-green-600 hover:underline min-h-[36px] min-w-[36px]">Unhide</button>
                      ) : (
                        <button onClick={() => hide(p._id)} className="text-xs text-gray-500 hover:underline min-h-[36px] min-w-[36px]">Hide</button>
                      )}
                      <button onClick={() => toggleReturnable(p._id)} className={`text-xs hover:underline min-h-[36px] min-w-[36px] ${p.isReturnable !== false ? 'text-green-600' : 'text-gray-500'}`}>{p.isReturnable !== false ? 'Returnable' : 'Non-Returnable'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}

      {flashModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setFlashModal(null)}>
          <div className="bg-white p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-display font-bold mb-4">Set Flash Sale</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Sale Price (₹)</label>
                <input type="number" value={flashModal.flashSalePrice} className="w-full border px-3 py-2 text-sm" onChange={e => setFlashModal({ ...flashModal, flashSalePrice: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Start Date</label>
                <input type="datetime-local" value={flashModal.flashSaleStart || ''} className="w-full border px-3 py-2 text-sm" onChange={e => setFlashModal({ ...flashModal, flashSaleStart: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">End Date</label>
                <input type="datetime-local" value={flashModal.flashSaleEnd || ''} className="w-full border px-3 py-2 text-sm" onChange={e => setFlashModal({ ...flashModal, flashSaleEnd: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => saveFlashSale(flashModal.productId)} className="flex-1 bg-primary text-white py-2.5 text-sm font-medium min-h-[44px]">Save</button>
                <button onClick={() => setFlashModal(null)} className="flex-1 border py-2.5 text-sm font-medium min-h-[44px]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
