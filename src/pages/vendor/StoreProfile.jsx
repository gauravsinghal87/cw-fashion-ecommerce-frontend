import { useState, useEffect } from 'react';
import { get, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { useDispatch, useSelector } from 'react-redux';
import { setVendorProfile } from '../../store/vendorSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const StoreProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const vendorProfile = useSelector(state => state.vendor.profile);

  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    warehouseAddress: '',
    panNumber: '',
    aadhaarNumber: '',
    accountHolderName: '',
    bankName: '',
    bankAccount: '',
    ifscCode: '',
    upiId: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await get(API.VENDORS.PROFILE);
        const profile = data.vendor || data;

        setForm({
          storeName: profile.storeName || '',
          storeDescription: profile.storeDescription || '',
          warehouseAddress: profile.warehouseAddress?.addressLine1 || '',
          panNumber: profile.panNumber || '',
          aadhaarNumber: profile.aadhaarNumber || '',
          accountHolderName: profile.bankAccount?.accountHolderName || '',
          bankName: profile.bankAccount?.bankName || '',
          bankAccount: profile.bankAccount?.accountNumber || '',
          ifscCode: profile.bankAccount?.ifscCode || '',
          upiId: profile.bankAccount?.upiId || '',
        });

        dispatch(setVendorProfile(profile));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        storeName: form.storeName,
        storeDescription: form.storeDescription,
        panNumber: form.panNumber,
        aadhaarNumber: form.aadhaarNumber,
        bankAccount: {
          accountHolderName: form.accountHolderName,
          accountNumber: form.bankAccount,
          bankName: form.bankName,
          ifscCode: form.ifscCode,
          upiId: form.upiId,
        },
      };
      if (form.warehouseAddress) {
        payload.warehouseAddress = { addressLine1: form.warehouseAddress };
      }
      const { data } = await put(API.VENDORS.UPDATE_PROFILE, payload);
      toast.success('Profile updated successfully');
      dispatch(setVendorProfile(data.vendor || data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Store Profile</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">Manage your store information and settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input 
                label="Store Name *" 
                value={form.storeName} 
                onChange={(e) => setForm({ ...form, storeName: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
            <textarea 
              value={form.storeDescription} 
              onChange={(e) => setForm({ ...form, storeDescription: e.target.value })} 
              className="input-luxe text-sm w-full h-24 min-h-[44px]" 
              placeholder="Tell customers about your store..."
            />
          </div>

          <div>
            <Input 
              label="Warehouse Address" 
              value={form.warehouseAddress} 
              onChange={(e) => setForm({ ...form, warehouseAddress: e.target.value })} 
              placeholder="Your warehouse/return address"
            />
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input 
                label="PAN Number *" 
                value={form.panNumber} 
                onChange={(e) => setForm({ ...form, panNumber: e.target.value })} 
                placeholder="Your PAN"
                required
              />
            </div>
            <div>
              <Input 
                label="Aadhaar Number *" 
                value={form.aadhaarNumber} 
                onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })} 
                placeholder="Your Aadhaar"
                required
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input 
                label="Account Holder Name *" 
                value={form.accountHolderName} 
                onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} 
                required 
              />
            </div>
            <div>
              <Input 
                label="Bank Name *" 
                value={form.bankName} 
                onChange={(e) => setForm({ ...form, bankName: e.target.value })} 
                required 
              />
            </div>
            <div>
              <Input 
                label="Account Number *" 
                value={form.bankAccount} 
                onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} 
                required 
              />
            </div>
            <div>
              <Input 
                label="IFSC Code *" 
                value={form.ifscCode} 
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value })} 
                required 
              />
            </div>
            <div className="md:col-span-2">
              <Input 
                label="UPI ID" 
                value={form.upiId} 
                onChange={(e) => setForm({ ...form, upiId: e.target.value })} 
                placeholder="Your UPI ID for payments" 
              />
            </div>
          </div>
        </div>

        <div className="flex-col sm:flex-row gap-3 flex">
          <Button 
            type="submit" 
            loading={saving} 
            className="w-full sm:w-auto"
          >
            Save Profile
          </Button>
          <button 
            type="button" 
            onClick={() => window.history.back()} 
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 px-6 py-2.5 min-h-[44px] text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreProfile;
