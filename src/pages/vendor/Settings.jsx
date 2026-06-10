import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const VendorSettings = () => {
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [seoForm, setSeoForm] = useState({ metaTitle: '', metaDescription: '', storeSlug: '' });

  useEffect(() => {
    get(API.VENDORS.PROFILE).then(({ data }) => {
      const v = data.vendor;
      if (v.seo) setSeoForm({
        metaTitle: v.seo.metaTitle || '',
        metaDescription: v.seo.metaDescription || '',
        storeSlug: v.storeSlug || '',
      });
    }).catch(() => {});
  }, []);

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    try {
      await put(API.AUTH.UPDATE_PASSWORD, { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password updated');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updateSEO = async (e) => {
    e.preventDefault();
    try {
      await put(API.VENDORS.STORE_SEO_UPDATE, { metaTitle: seoForm.metaTitle, metaDescription: seoForm.metaDescription, storeSlug: seoForm.storeSlug });
      toast.success('SEO settings saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-2xl">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Store Settings</h1>

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4 mb-6">
        <h3 className="text-sm font-medium uppercase tracking-wider">Change Password</h3>
        <form onSubmit={updatePassword} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label><input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label><input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
          </div>
          <Button type="submit" className="w-full sm:w-auto">Update Password</Button>
        </form>
      </div>

      {/* Store SEO */}
      <form onSubmit={updateSEO} className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider">Store SEO</h3>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label><input value={seoForm.metaTitle} onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label><textarea value={seoForm.metaDescription} onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })} className="input-luxe text-sm w-full h-20 min-h-[44px]" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Slug</label><input value={seoForm.storeSlug} onChange={(e) => setSeoForm({ ...seoForm, storeSlug: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
        <Button type="submit" className="w-full sm:w-auto">Update SEO</Button>
      </form>
    </div>
  );
};

export default VendorSettings;
