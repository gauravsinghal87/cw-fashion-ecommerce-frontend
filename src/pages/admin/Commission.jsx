import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const AdminCommission = () => {
  const [commissions, setCommissions] = useState([]);
  const [rate, setRate] = useState(10);
  const [returnDays, setReturnDays] = useState(7);

  useEffect(() => {
    Promise.all([
      get(API.ADMIN.COMMISSION),
      get(API.ADMIN.RETURN_SETTINGS),
    ]).then(([commRes, retRes]) => {
      setCommissions(commRes.data.commissions || []);
      const global = commRes.data.commissions?.find(c => c.type === 'global');
      if (global) setRate(global.rate);
      setReturnDays(retRes.data.settings?.rate || 7);
    }).catch(() => {});
  }, []);

  const save = async () => {
    try { await put(API.ADMIN.COMMISSION, { rate, type: 'global', name: 'Global Commission' }); toast.success('Commission updated'); }
    catch { toast.error('Failed'); }
  };

  const saveReturn = async () => {
    try { await put(API.ADMIN.RETURN_SETTINGS, { rate: returnDays, name: 'Return Settings' }); toast.success('Return settings updated'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold mb-4 sm:mb-6">Commission &amp; Return Settings</h1>

      <div className="card-luxe p-4 sm:p-5 md:p-6 max-w-md space-y-3 sm:space-y-4">
        <label className="block text-sm font-medium">Global Commission Rate (%)</label>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} min="0" max="100" className="input-luxe text-sm w-full sm:w-24 min-h-[44px]" />
          <button onClick={save} className="btn-primary text-xs px-4 w-full sm:w-auto min-h-[44px]">Save</button>
        </div>
        <p className="text-xs text-gray-500">This rate applies to all vendor sales by default.</p>
      </div>

      <div className="card-luxe p-4 sm:p-5 md:p-6 max-w-md space-y-3 sm:space-y-4">
        <label className="block text-sm font-medium">Return Window (Days)</label>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input type="number" value={returnDays} onChange={(e) => setReturnDays(Number(e.target.value))} min="0" max="60" className="input-luxe text-sm w-full sm:w-24 min-h-[44px]" />
          <button onClick={saveReturn} className="btn-primary text-xs px-4 w-full sm:w-auto min-h-[44px]">Save</button>
        </div>
        <p className="text-xs text-gray-500">Default return window for products without a specific policy. Set 0 to disable returns globally.</p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Current Commission Rules</h3>
        {commissions.map((c) => (
          <div key={c._id} className="p-3 border border-border bg-white flex items-center justify-between text-sm mb-2">
            <span className="font-medium capitalize">{c.type} - {c.name}</span>
            <span className="text-accent font-semibold">{c.rate}{c.type === 'return_settings' ? ' days' : '%'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCommission;
