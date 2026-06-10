import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const Toggle = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between min-h-[44px]">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button type="button" onClick={() => onChange(!enabled)} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

const Shipping = () => {
  const [settings, setSettings] = useState({ charge: 99, freeThreshold: 999, isShippingEnabled: true, isFreeShippingEnabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

   useEffect(() => {
     get(API.ADMIN.SHIPPING).then(({ data }) => setSettings(data.shipping || { charge: 99, freeThreshold: 999, isShippingEnabled: true, isFreeShippingEnabled: true })).catch(() => {}).finally(() => setLoading(false));
   }, []);

   const save = async (e) => {
     e.preventDefault();
     setSaving(true);
     try {
       const { data } = await put(API.ADMIN.SHIPPING, settings);
       setSettings(data.shipping);
       toast.success('Shipping settings updated');
     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
     finally { setSaving(false); }
   };

  if (loading) return <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8"><div className="h-32 skeleton" /></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-lg">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold mb-4 sm:mb-6">Shipping Settings</h1>
      <form onSubmit={save} className="card-luxe p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        <Toggle label="Enable Shipping" enabled={settings.isShippingEnabled} onChange={(v) => setSettings({ ...settings, isShippingEnabled: v })} />
        {settings.isShippingEnabled && (
          <>
            <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Shipping Charge (₹)</label><input type="number" value={settings.charge} onChange={(e) => setSettings({ ...settings, charge: Number(e.target.value) })} className="input-luxe text-sm w-full min-h-[44px]" disabled={!settings.isShippingEnabled} /></div>
            <Toggle label="Enable Free Shipping" enabled={settings.isFreeShippingEnabled} onChange={(v) => setSettings({ ...settings, isFreeShippingEnabled: v })} />
            {settings.isFreeShippingEnabled && (
              <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Free Shipping Threshold (₹)</label><input type="number" value={settings.freeThreshold} onChange={(e) => setSettings({ ...settings, freeThreshold: Number(e.target.value) })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
            )}
          </>
        )}
        <div className="border-t border-border pt-3 space-y-1 text-xs text-gray-500">
          <p><strong>Shipping Charge:</strong> Flat fee added when customer doesn't qualify for free shipping.</p>
          <p><strong>Free Shipping Threshold:</strong> Orders at or above this amount (after coupon discount) get free shipping.</p>
          <p><strong>Free Shipping Coupon:</strong> If a customer applies a free_shipping type coupon, shipping is always waived regardless of these settings.</p>
        </div>
        <Button type="submit" loading={saving}>Save Settings</Button>
      </form>
    </div>
  );
};

export default Shipping;
