import { formatPrice, formatDate } from '../../utils/helpers';

const InvoiceModal = ({ data, loading, onClose }) => {
  if (!data && !loading) return null;

  const printInvoice = () => {
    const content = document.getElementById('invoice-print');
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice - ${data?.invoiceNumber || ''}</title>
      <style>body{font-family:Arial;padding:40px;font-size:14px;color:#333}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #ddd}
      th{background:#f5f5f5;font-size:12px;text-transform:uppercase}
      .right{text-align:right}
      .header{margin-bottom:30px}
      .total{font-size:18px;font-weight:bold;text-align:right;margin-top:20px}
      .footer{margin-top:40px;font-size:12px;color:#888;text-align:center}
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const downloadPDF = () => {
    const content = document.getElementById('invoice-print');
    if (!content) return;
    const html = `<html><head><title>Invoice - ${data?.invoiceNumber || ''}</title>
      <style>body{font-family:Arial;padding:40px;font-size:14px;color:#333}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #ddd}
      th{background:#f5f5f5;font-size:12px;text-transform:uppercase}
      .header{margin-bottom:30px}
      .total{font-size:18px;font-weight:bold;text-align:right;margin-top:20px}
      .footer{margin-top:40px;font-size:12px;color:#888;text-align:center}
      @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
      </style></head><body>${content.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${data?.invoiceNumber || data?.orderNumber || 'download'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl mx-0 sm:mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-border p-3 sm:p-4 flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
          <h2 className="text-lg sm:text-xl font-semibold">Invoice</h2>
          <div className="flex gap-3">
            <button onClick={downloadPDF} className="btn-primary text-xs sm:text-sm px-4 py-2 min-h-[44px]">Download PDF</button>
            <button onClick={printInvoice} className="text-xs sm:text-sm border border-border px-4 py-2 min-h-[44px] rounded hover:bg-gray-50">Print</button>
            <button onClick={onClose} className="text-xs sm:text-sm text-gray-500 hover:underline min-h-[44px] flex items-center">Close</button>
          </div>
        </div>
        {loading ? (
          <div className="p-4 sm:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-8 skeleton" />)}</div></div>
        ) : (
          <div className="p-4 sm:p-6" id="invoice-print">
            <div className="header">
              <h3 className="text-lg sm:text-xl font-semibold">INVOICE</h3>
              <p className="text-xs text-gray-500 mt-1">Invoice #: {data.invoiceNumber}</p>
              <p className="text-xs text-gray-500">Order: {data.orderNumber || data.order?._id?.slice(-8)}</p>
              <p className="text-xs text-gray-500">Date: {formatDate(data.createdAt)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Customer</p>
                <p>{data.user?.name}</p>
                <p className="text-xs text-gray-500">{data.user?.email}</p>
                <p className="text-xs text-gray-500">{data.user?.phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Shipping Address</p>
                <p className="text-xs text-gray-500">{data.shippingAddress?.addressLine1}</p>
                <p className="text-xs text-gray-500">{data.shippingAddress?.city}, {data.shippingAddress?.state}</p>
                <p className="text-xs text-gray-500">{data.shippingAddress?.pincode}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[500px] w-full text-sm border-t border-b">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-medium text-xs uppercase text-gray-500">Item</th>
                    <th className="text-left p-3 font-medium text-xs uppercase text-gray-500">Qty</th>
                    <th className="text-right p-3 font-medium text-xs uppercase text-gray-500">Price</th>
                    <th className="text-right p-3 font-medium text-xs uppercase text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(data.items || []).map((item, i) => (
                    <tr key={i}>
                      <td className="p-3 text-sm">{item.name}</td>
                      <td className="p-3 text-xs">{item.quantity}</td>
                      <td className="p-3 text-right text-xs">{formatPrice(item.price || 0)}</td>
                      <td className="p-3 text-right text-sm font-medium">{formatPrice(item.totalPrice || (item.price || 0) * (item.quantity || 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right mt-4 space-y-1 text-sm">
              <p>Subtotal: {formatPrice(data.subtotal || 0)}</p>
              {data.discount > 0 && <p className="text-green-600">Discount: -{formatPrice(data.discount)}</p>}
              <p>Shipping: {data.shippingCharge ? formatPrice(data.shippingCharge) : 'Free'}</p>
              <p className="text-lg font-bold">Total: {formatPrice(data.total || 0)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceModal;
