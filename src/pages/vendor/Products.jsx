import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = async (p) => {
    setLoading(true);
    try {
      const { data } = await get(API.VENDORS.PRODUCTS, { page: p || page, limit: 20 });
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, [page]);

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await del(API.PRODUCTS.DETAIL(id)); toast.success('Product deleted'); setProducts(products.filter(p => p._id !== id)); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">My Products</h1>
        <Link to="/vendor/products/add" className="btn-primary text-xs sm:text-sm px-4 py-2 min-h-[44px] flex items-center justify-center w-full sm:w-auto">Add Product</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-[600px] lg:min-w-0 w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Product</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Price</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Stock</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Approval</th>
                <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gray-50 border border-border overflow-hidden flex-shrink-0">
                        {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <p className="text-sm line-clamp-1">{p.title}</p>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(p.minPrice || 0)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{p.totalStock || 0}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                    <span className={`inline-flex px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs ${p.status === 'approved' ? 'bg-success/10 text-success' : p.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : p.status === 'draft' ? 'bg-gray-100 text-gray-600' : p.status === 'rejected' ? 'bg-danger/10 text-danger' : 'bg-gray-50 text-gray-400'}`}>{p.status}</span>
                    {p.needsReapproval && <span className="ml-1 inline-flex px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700">Reapproval</span>}
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                    <span className={`inline-flex px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs ${p.approvalStatus === 'approved' ? 'bg-purple-50 text-purple-700' : p.approvalStatus === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-danger/10 text-danger'}`}>{p.approvalStatus}</span>
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                    <div className="flex gap-2">
                      <Link to={`/vendor/products/edit/${p._id}`} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">Edit</Link>
                      <button onClick={() => deleteProduct(p._id)} className="text-xs sm:text-sm text-danger hover:underline min-h-[44px] flex items-center">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && !loading && <p className="text-center text-gray-500 py-8 sm:py-12 text-xs sm:text-sm">No products yet</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
