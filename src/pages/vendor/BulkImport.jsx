import { useState, useRef } from 'react';
import { post, get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';

const BulkImport = () => {
  const [rawData, setRawData] = useState('');
  const [parsed, setParsed] = useState([]);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInput = useRef(null);

  const parseData = (text) => {
    const lines = text.trim().split('\n').filter(Boolean);
    const rows = lines.map((line) => {
      const cols = line.split('\t').map((c) => c.trim());
      return { name: cols[0] || '', price: cols[1] || '', stock: cols[2] || '', sku: cols[3] || '' };
    }).filter((r) => r.name);
    setParsed(rows);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        setRawData(text);
        parseData(text);
      }
    };
    reader.readAsText(file);
  };

  const importProducts = async () => {
    if (!parsed.length) { toast.error('No data to import'); return; }
    setImporting(true);
    try {
      await post(API.VENDORS.BULK_UPLOAD, { products: parsed });
      toast.success(`${parsed.length} products imported`);
      setRawData('');
      setParsed([]);
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed'); }
    finally { setImporting(false); }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { data } = await get(API.VENDORS.EXPORT_PRODUCTS);
      const products = data.products || data || [];
      const headers = 'Name,Price,Stock,SKU\n';
      const rows = products.map((p) => `"${p.title}","${p.minPrice || p.price || 0}","${p.totalStock || p.stock || 0}","${p.sku || ''}"`).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'products.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const { data } = await get(API.VENDORS.EXPORT_PRODUCTS);
      const products = data.products || data || [];
      const headers = 'Name\tPrice\tStock\tSKU\n';
      const rows = products.map((p) => `${p.title}\t${p.minPrice || p.price || 0}\t${p.totalStock || p.stock || 0}\t${p.sku || ''}`).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/tab-separated-values;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'products.xls'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Excel file exported');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Bulk Import / Export</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 mb-6">
        <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Import Products</h3>
        <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center mb-4" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { fileInput.current.files = e.dataTransfer.files; handleFile({ target: { files: [f] } }); } }}>
          <p className="text-xs sm:text-sm text-gray-500 mb-2">Drag & drop an Excel or CSV file here, or</p>
          <label className="btn-primary text-xs sm:text-sm px-4 py-2 cursor-pointer inline-block min-h-[44px] flex items-center">Browse Files<input ref={fileInput} type="file" accept=".csv,.xlsx,.xls,.tsv,.txt" onChange={handleFile} className="hidden" /></label>
        </div>

        <p className="text-xs text-gray-400 mb-3">Alternatively, paste tab-separated data below (Name, Price, Stock, SKU per line):</p>
        <textarea value={rawData} onChange={(e) => { setRawData(e.target.value); parseData(e.target.value); }} className="input-luxe text-sm w-full h-28 font-mono min-h-[44px]" placeholder="Product A\t499\t100\tSKU001\nProduct B\t299\t50\tSKU002" />

        {parsed.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">{parsed.length} product(s) parsed:</p>
            <div className="overflow-x-auto -mx-3 sm:mx-0 border border-border">
              <table className="min-w-[400px] w-full text-xs">
                <thead className="bg-gray-50"><tr><th className="text-left p-2 sm:p-3 font-medium text-gray-500">Name</th><th className="text-left p-2 sm:p-3 font-medium text-gray-500">Price</th><th className="text-left p-2 sm:p-3 font-medium text-gray-500">Stock</th><th className="text-left p-2 sm:p-3 font-medium text-gray-500">SKU</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {parsed.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-2 sm:p-3">{r.name}</td>
                      <td className="p-2 sm:p-3">{formatPrice(Number(r.price))}</td>
                      <td className="p-2 sm:p-3">{r.stock}</td>
                      <td className="p-2 sm:p-3 font-mono">{r.sku}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={importProducts} disabled={importing || !parsed.length} className="btn-primary text-xs sm:text-sm px-6 py-2 mt-4 min-h-[44px] w-full sm:w-auto">{importing ? 'Importing...' : `Import ${parsed.length} Products`}</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6">
        <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Export Products</h3>
        <div className="flex-col sm:flex-row gap-3 flex">
          <button onClick={exportCsv} disabled={exporting} className="btn-primary text-xs sm:text-sm px-6 py-2 min-h-[44px] w-full sm:w-auto">Export as CSV</button>
          <button onClick={exportExcel} disabled={exporting} className="px-6 py-2 text-sm border border-border hover:bg-gray-50 min-h-[44px] w-full sm:w-auto">Export as Excel</button>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;
