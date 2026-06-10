import { useState, useEffect } from 'react';
import { get, post, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';

const TABS = ['inventory', 'add-stock', 'remove-stock', 'transfer', 'damaged', 'history', 'alerts', 'dashboard'];

const Inventory = () => {
  const [tab, setTab] = useState('inventory');
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [search, setSearch] = useState('');

  // Add Stock form
  const [addForm, setAddForm] = useState({ productId: '', sku: '', warehouseId: '', quantity: '', note: '' });
  // Remove Stock form
  const [removeForm, setRemoveForm] = useState({ productId: '', sku: '', warehouseId: '', quantity: '', note: '', type: 'stock_out' });
  // Transfer form
  const [transferForm, setTransferForm] = useState({ productId: '', sku: '', fromWarehouseId: '', toWarehouseId: '', quantity: '', note: '' });
  // Damaged form
  const [damagedForm, setDamagedForm] = useState({ productId: '', sku: '', warehouseId: '', quantity: '', note: '' });

  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  useEffect(() => {
    Promise.all([
      get(API.VENDORS.WAREHOUSES).catch(() => ({ data: { warehouses: [] } })),
      get(API.VENDORS.PRODUCTS).catch(() => ({ data: { products: [] } })),
    ]).then(([w, p]) => {
      setWarehouses(w.data.warehouses || []);
      setProducts(p.data.products || []);
      if (w.data.warehouses?.length) setSelectedWarehouse(w.data.warehouses[0]._id);
    });
  }, []);

  useEffect(() => {
    if (tab === 'inventory') loadInventory(1);
    else if (tab === 'history') loadHistory(1);
    else if (tab === 'alerts') loadAlerts();
    else if (tab === 'dashboard') loadDashboard();
  }, [tab, selectedWarehouse]);

  useEffect(() => { if (tab === 'inventory') loadInventory(); }, [page]);
  useEffect(() => { if (tab === 'history') loadHistory(); }, [historyPage]);

  const loadInventory = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20 };
      if (selectedWarehouse) params.warehouse = selectedWarehouse;
      if (search) params.q = search;
      const { data } = await get(API.VENDORS.INVENTORY, params);
      setInventory(data.inventory || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  const loadHistory = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || historyPage, limit: 20 };
      if (selectedWarehouse) params.warehouse = selectedWarehouse;
      const { data } = await get(API.VENDORS.INVENTORY_HISTORY, params);
      setHistory(data.transactions || []);
      setHistoryTotalPages(data.pagination?.totalPages || 1);
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  };

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const { data } = await get(API.VENDORS.INVENTORY_LOW_STOCK);
      setAlerts(data.alerts || []);
    } catch { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await get(API.VENDORS.INVENTORY_DASHBOARD);
      setStats(data.stats);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const getVariants = (p) => p.variants?.length ? p.variants.filter(v => v.isActive !== false) : [{ color: '', size: '', sku: p.sku || `SKU-${p._id}`, _id: p._id }];

  const submitAddStock = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await post(API.VENDORS.INVENTORY_ADD, addForm);
      toast.success('Stock added');
      setAddForm({ productId: '', sku: '', warehouseId: '', quantity: '', note: '' });
      setPage(1); loadInventory(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const submitRemoveStock = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await post(API.VENDORS.INVENTORY_REMOVE, removeForm);
      toast.success('Stock removed');
      setRemoveForm({ productId: '', sku: '', warehouseId: '', quantity: '', note: '', type: 'stock_out' });
      setPage(1); loadInventory(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await post(API.VENDORS.INVENTORY_TRANSFER, transferForm);
      toast.success('Transfer completed');
      setTransferForm({ productId: '', sku: '', fromWarehouseId: '', toWarehouseId: '', quantity: '', note: '' });
      setPage(1); loadInventory(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const submitDamaged = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await post(API.VENDORS.INVENTORY_DAMAGED, damagedForm);
      toast.success('Marked as damaged');
      setDamagedForm({ productId: '', sku: '', warehouseId: '', quantity: '', note: '' });
      setPage(1); loadInventory(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const renderTabs = () => (
    <div className="flex flex-wrap gap-1 sm:gap-2 mb-6">
      {TABS.map((t) => (
        <button key={t} onClick={() => setTab(t)}
          className={`px-3 py-1.5 text-xs border whitespace-nowrap min-h-[36px] ${tab === t ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary capitalize'}`}>
          {t.replace('-', ' ')}
        </button>
      ))}
    </div>
  );

  const typeBadge = (type) => {
    const colors = {
      stock_in: 'bg-success/10 text-success', stock_out: 'bg-danger/10 text-danger',
      transfer_in: 'bg-blue-50 text-blue-700', transfer_out: 'bg-yellow-50 text-yellow-700',
      damaged: 'bg-red-50 text-red-700', repaired: 'bg-green-50 text-green-700',
      reserve: 'bg-purple-50 text-purple-700', unreserve: 'bg-gray-100 text-gray-600',
      order: 'bg-orange-50 text-orange-700', order_cancel: 'bg-gray-100 text-gray-500',
    };
    return <span className={`inline-flex px-1.5 py-0.5 text-xs ${colors[type] || 'bg-gray-100 text-gray-600'}`}>{type.replace('_', ' ')}</span>;
  };

  if (loading && tab === 'inventory') return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Inventory</h1>
      </div>
      {renderTabs()}

      {/* INVENTORY TABLE */}
      {tab === 'inventory' && (
        <div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4 items-stretch">
            <select value={selectedWarehouse} onChange={(e) => { setSelectedWarehouse(e.target.value); setPage(1); }}
              className="input-luxe text-sm min-h-[44px] w-full sm:w-auto sm:min-w-[180px]">
              <option value="">All Warehouses</option>
              {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name} - {w.city}</option>)}
            </select>
            <div className="flex gap-2 flex-1 min-w-0 w-full sm:w-auto">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or SKU..."
                className="input-luxe text-sm flex-1 min-h-[44px]" />
              <button onClick={() => { setPage(1); loadInventory(1); }} className="btn-primary text-xs px-4 py-2 min-h-[44px]">Search</button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="min-w-[800px] lg:min-w-0 w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Product</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Variant</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">SKU</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Warehouse</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Available</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Reserved</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Damaged</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inventory.map((inv) => {
                    const sellable = (inv.availableStock || 0) - (inv.reservedStock || 0);
                    const low = sellable <= (inv.lowStockThreshold || 10) && sellable > 0;
                    const oos = sellable <= 0;
                    return (
                      <tr key={inv._id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 bg-gray-50 border overflow-hidden flex-shrink-0">
                              {inv.product?.images?.[0]?.url && <img src={inv.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <p className="text-sm line-clamp-1">{inv.product?.title || '-'}</p>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{inv.variantLabel || '-'}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs font-mono">{inv.variantSku}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{inv.warehouse?.name || '-'}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{inv.availableStock || 0}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{inv.reservedStock || 0}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{inv.damagedStock || 0}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                          {oos ? <span className="bg-danger/10 text-danger px-2 py-0.5 text-xs">Out of Stock</span> :
                           low ? <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 text-xs">Low Stock</span> :
                           <span className="text-xs text-gray-500">In Stock</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {inventory.length === 0 && <p className="text-center text-gray-500 py-8 text-xs">No inventory records found</p>}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6 pb-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
            </div>
          )}
        </div>
      )}

      {/* ADD STOCK */}
      {tab === 'add-stock' && (
        <div className="max-w-lg">
          <form onSubmit={submitAddStock} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider">Add Stock</h2>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
              <select value={addForm.productId} onChange={(e) => { setAddForm({ ...addForm, productId: e.target.value, sku: '' }); }}
                className="input-luxe text-sm w-full min-h-[44px]" required>
                <option value="">Select product</option>
                {products.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            {addForm.productId && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Variant (SKU)</label>
                <select value={addForm.sku} onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                  className="input-luxe text-sm w-full min-h-[44px]" required>
                  <option value="">Select variant</option>
                  {getVariants(products.find(p => p._id === addForm.productId)).map((v) => (
                    <option key={v.sku} value={v.sku}>{[v.color, v.size].filter(Boolean).join(' / ') || 'Default'} — {v.sku}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse</label>
              <select value={addForm.warehouseId} onChange={(e) => setAddForm({ ...addForm, warehouseId: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" required>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name} - {w.city}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={addForm.quantity} onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" min="1" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Note (optional)</label>
              <input value={addForm.note} onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" placeholder="e.g. New purchase from supplier" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 min-h-[44px]">{saving ? 'Adding...' : 'Add Stock'}</button>
          </form>
        </div>
      )}

      {/* REMOVE STOCK */}
      {tab === 'remove-stock' && (
        <div className="max-w-lg">
          <form onSubmit={submitRemoveStock} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider">Remove Stock</h2>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
              <select value={removeForm.productId} onChange={(e) => setRemoveForm({ ...removeForm, productId: e.target.value, sku: '' })}
                className="input-luxe text-sm w-full min-h-[44px]" required>
                <option value="">Select product</option>
                {products.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            {removeForm.productId && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Variant (SKU)</label>
                <select value={removeForm.sku} onChange={(e) => setRemoveForm({ ...removeForm, sku: e.target.value })}
                  className="input-luxe text-sm w-full min-h-[44px]" required>
                  <option value="">Select variant</option>
                  {getVariants(products.find(p => p._id === removeForm.productId)).map((v) => (
                    <option key={v.sku} value={v.sku}>{[v.color, v.size].filter(Boolean).join(' / ') || 'Default'} — {v.sku}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse</label>
              <select value={removeForm.warehouseId} onChange={(e) => setRemoveForm({ ...removeForm, warehouseId: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" required>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name} - {w.city}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={removeForm.quantity} onChange={(e) => setRemoveForm({ ...removeForm, quantity: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" min="1" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Note (optional)</label>
              <input value={removeForm.note} onChange={(e) => setRemoveForm({ ...removeForm, note: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" placeholder="e.g. Damaged, returned to supplier" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 min-h-[44px]">{saving ? 'Removing...' : 'Remove Stock'}</button>
          </form>
        </div>
      )}

      {/* TRANSFER STOCK */}
      {tab === 'transfer' && (
        <div className="max-w-lg">
          <form onSubmit={submitTransfer} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider">Transfer Stock Between Warehouses</h2>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
              <select value={transferForm.productId} onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value, sku: '' })}
                className="input-luxe text-sm w-full min-h-[44px]" required>
                <option value="">Select product</option>
                {products.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            {transferForm.productId && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Variant (SKU)</label>
                <select value={transferForm.sku} onChange={(e) => setTransferForm({ ...transferForm, sku: e.target.value })}
                  className="input-luxe text-sm w-full min-h-[44px]" required>
                  <option value="">Select variant</option>
                  {getVariants(products.find(p => p._id === transferForm.productId)).map((v) => (
                    <option key={v.sku} value={v.sku}>{[v.color, v.size].filter(Boolean).join(' / ') || 'Default'} — {v.sku}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">From Warehouse</label>
              <select value={transferForm.fromWarehouseId} onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" required>
                <option value="">Select source warehouse</option>
                {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name} - {w.city}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To Warehouse</label>
              <select value={transferForm.toWarehouseId} onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" required>
                <option value="">Select destination warehouse</option>
                {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name} - {w.city}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={transferForm.quantity} onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" min="1" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Note (optional)</label>
              <input value={transferForm.note} onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" placeholder="e.g. Rebalancing stock" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 min-h-[44px]">{saving ? 'Transferring...' : 'Transfer Stock'}</button>
          </form>
        </div>
      )}

      {/* DAMAGED STOCK */}
      {tab === 'damaged' && (
        <div className="max-w-lg">
          <form onSubmit={submitDamaged} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider">Mark Stock as Damaged</h2>
            <p className="text-xs text-gray-500">Move items from available to damaged stock.</p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
              <select value={damagedForm.productId} onChange={(e) => setDamagedForm({ ...damagedForm, productId: e.target.value, sku: '' })}
                className="input-luxe text-sm w-full min-h-[44px]" required>
                <option value="">Select product</option>
                {products.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            {damagedForm.productId && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Variant (SKU)</label>
                <select value={damagedForm.sku} onChange={(e) => setDamagedForm({ ...damagedForm, sku: e.target.value })}
                  className="input-luxe text-sm w-full min-h-[44px]" required>
                  <option value="">Select variant</option>
                  {getVariants(products.find(p => p._id === damagedForm.productId)).map((v) => (
                    <option key={v.sku} value={v.sku}>{[v.color, v.size].filter(Boolean).join(' / ') || 'Default'} — {v.sku}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse</label>
              <select value={damagedForm.warehouseId} onChange={(e) => setDamagedForm({ ...damagedForm, warehouseId: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" required>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name} - {w.city}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={damagedForm.quantity} onChange={(e) => setDamagedForm({ ...damagedForm, quantity: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" min="1" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Note (optional)</label>
              <input value={damagedForm.note} onChange={(e) => setDamagedForm({ ...damagedForm, note: e.target.value })}
                className="input-luxe text-sm w-full min-h-[44px]" placeholder="e.g. Items damaged during transit" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 min-h-[44px]">{saving ? 'Updating...' : 'Mark as Damaged'}</button>
          </form>
        </div>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <select value={selectedWarehouse} onChange={(e) => { setSelectedWarehouse(e.target.value); setHistoryPage(1); }}
              className="input-luxe text-sm min-h-[44px] w-full sm:w-64">
              <option value="">All Warehouses</option>
              {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton" />)}</div> : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="min-w-[700px] lg:min-w-0 w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Date</th>
                      <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Type</th>
                      <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Product</th>
                      <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">SKU</th>
                      <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Qty</th>
                      <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Before</th>
                      <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">After</th>
                      <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">{typeBadge(tx.type)}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{tx.product?.title || '-'}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs font-mono">{tx.variantSku || '-'}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs font-medium">{tx.quantity}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{tx.availableBefore}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs">{tx.availableAfter}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500 max-w-[150px] truncate">{tx.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {history.length === 0 && <p className="text-center text-gray-500 py-8 text-xs">No transactions yet</p>}
            </div>
          )}
          {historyTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6 pb-4">
              <button disabled={historyPage <= 1} onClick={() => setHistoryPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{historyPage} / {historyTotalPages}</span>
              <button disabled={historyPage >= historyTotalPages} onClick={() => setHistoryPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
            </div>
          )}
        </div>
      )}

      {/* LOW STOCK ALERTS */}
      {tab === 'alerts' && (
        <div>
          {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div> : (
            <div className="space-y-3">
              {alerts.length === 0 ? <p className="text-center text-gray-500 py-8 text-sm">No low stock alerts</p> : (
                alerts.map((a) => (
                  <div key={a._id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gray-50 border overflow-hidden flex-shrink-0">
                        {a.product?.images?.[0]?.url && <img src={a.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{a.product?.title || '-'}</p>
                        <p className="text-xs text-gray-500">{a.variantLabel || a.variantSku} @ {a.warehouse?.name || '-'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-danger">{a.availableStock || 0} left</p>
                      <p className="text-xs text-gray-400">Threshold: {a.lowStockThreshold || 10}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div>
          {loading ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 skeleton" />)}</div> : stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Products', value: stats.totalProducts, color: 'bg-blue-50 text-blue-700' },
                { label: 'Total Stock', value: stats.totalStock, color: 'bg-success/10 text-success' },
                { label: 'Low Stock Items', value: stats.lowStockItems, color: 'bg-yellow-50 text-yellow-700' },
                { label: 'Out of Stock', value: stats.outOfStockItems, color: 'bg-danger/10 text-danger' },
                { label: 'Warehouses', value: stats.warehouseCount, color: 'bg-purple-50 text-purple-700' },
              ].map((s) => (
                <div key={s.label} className={`rounded-lg shadow-sm p-4 ${s.color}`}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs mt-1 opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Inventory;
