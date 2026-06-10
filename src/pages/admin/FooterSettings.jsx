import { useState, useEffect } from 'react';
import { get, put, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const AdminFooterSettings = () => {
  const [form, setForm] = useState({ title: '', supportEmail: '', supportPhone: '', address: '', logo: { url: '', publicId: '' }, socialLinks: { facebook: '', instagram: '', twitter: '', youtube: '', linkedin: '', whatsapp: '' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data } = await get(API.FOOTER.ADMIN_GET);
      if (data.settings) setForm({
        title: data.settings.title || '',
        supportEmail: data.settings.supportEmail || '',
        supportPhone: data.settings.supportPhone || '',
        address: data.settings.address || '',
        logo: data.settings.logo || { url: '', publicId: '' },
        socialLinks: data.settings.socialLinks || { facebook: '', instagram: '', twitter: '', youtube: '', linkedin: '', whatsapp: '' },
      });
    } catch {
      toast.error('Failed to load footer settings');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSettings().finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const { data } = await post(API.UPLOAD.BASE, formData);
      if (data.success && data.files?.[0]) {
        setForm(prev => ({ ...prev, logo: { url: data.files[0].url, publicId: data.files[0].publicId || '' } }));
        toast.success('Logo uploaded');
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setForm(prev => ({ ...prev, logo: { url: '', publicId: '' } }));
  };

  const setSocial = (key, value) => {
    setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
  };

  const socialFields = [
    { key: 'facebook', label: 'Facebook URL', icon: 'fb' },
    { key: 'instagram', label: 'Instagram URL', icon: 'ig' },
    { key: 'twitter', label: 'Twitter URL', icon: 'tw' },
    { key: 'youtube', label: 'YouTube URL', icon: 'yt' },
    { key: 'linkedin', label: 'LinkedIn URL', icon: 'in' },
    { key: 'whatsapp', label: 'WhatsApp Number (with country code)', icon: 'wa' },
  ];

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const { data } = await put(API.FOOTER.ADMIN_UPDATE, form);
      if (data.settings) {
        setForm({
          title: data.settings.title || '',
          supportEmail: data.settings.supportEmail || '',
          supportPhone: data.settings.supportPhone || '',
          address: data.settings.address || '',
          logo: data.settings.logo || { url: '', publicId: '' },
          socialLinks: data.settings.socialLinks || { facebook: '', instagram: '', twitter: '', youtube: '', linkedin: '', whatsapp: '' },
        });
        toast.success('Footer settings saved');
      } else {
        toast.success('Saved. Refreshing from server...');
        await fetchSettings();
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-64 bg-gray-200 rounded" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Footer Settings</h1>
      </div>

      <div className="max-w-2xl space-y-5">
        <div className="card-luxe p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold">Branding</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Site Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="LUXE" className="input-luxe text-sm w-full min-h-[44px]" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Logo</label>
            {form.logo?.url ? (
              <div className="flex items-center gap-3 mb-2">
                <img src={form.logo.url} alt="Logo preview" className="h-12 w-auto object-contain border border-border rounded" />
                <button onClick={removeLogo} className="text-xs text-danger hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-2 p-4 border-2 border-dashed border-border rounded-lg text-center">
                <p className="text-xs text-gray-400">No logo uploaded</p>
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2 text-xs border border-border rounded cursor-pointer hover:bg-gray-50 min-h-[44px]">
              <span>{uploading ? 'Uploading...' : 'Upload Logo (Max 2MB)'}</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="card-luxe p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold">Contact Information</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Support Email</label>
            <input value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} placeholder="support@luxe.com" type="email" className="input-luxe text-sm w-full min-h-[44px]" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Support Phone</label>
            <input value={form.supportPhone} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} placeholder="+1 (555) 000-0000" className="input-luxe text-sm w-full min-h-[44px]" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Fashion Street, New York, NY 10001" className="input-luxe h-24 text-sm w-full min-h-[44px]" />
          </div>
        </div>

        <div className="card-luxe p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold">Social Media Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialFields.map(({ key, label, icon }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1 capitalize">{label}</label>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-xs font-bold uppercase">{icon}</span>
                  <input value={form.socialLinks?.[key] || ''} onChange={(e) => setSocial(key, e.target.value)} placeholder={`https://${key}.com/...`} type="url" className="input-luxe text-sm w-full min-h-[44px]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-6 py-2 min-h-[44px]">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFooterSettings;
