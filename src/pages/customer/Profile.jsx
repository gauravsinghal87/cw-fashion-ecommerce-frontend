import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { post, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { logout } from '../../store/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', gender: user?.gender || '', dob: user?.dob?.split('T')[0] || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = async (e) => {
    e.preventDefault();
    try { await put(API.USERS.PROFILE, form); toast.success('Profile updated'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const validate = () => {
    const newErrors = {};
    if (!pwForm.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!pwForm.newPassword) newErrors.newPassword = 'New password is required';
    else if (pwForm.newPassword.length < 6) newErrors.newPassword = 'Min 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await put(API.AUTH.UPDATE_PASSWORD, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setShowPw(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPwLoading(false); }
  };

  const handleLogout = async () => {
    try { await post(API.AUTH.LOGOUT); } catch (_) {}
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-6">My Profile</h1>
      <div className="card-luxe p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        <form onSubmit={update} className="space-y-4">
          <h2 className="text-base sm:text-lg md:text-xl font-medium">Personal Information</h2>
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" value={user?.email || ''} disabled className="bg-gray-50" />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-luxe text-sm min-h-[44px]">
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <Input label="Date of Birth" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          <Button type="submit">Save Changes</Button>
        </form>

        <div className="pt-6 border-t border-border">
          <button onClick={() => setShowPw(!showPw)} className="text-sm text-primary hover:underline mb-4 block min-h-[44px]">Change Password</button>
          {showPw && (
            <form onSubmit={changePassword} className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>}
              <Input label="New Password" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
              <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              <Button type="submit" loading={pwLoading} size="sm">Update Password</Button>
            </form>
          )}
        </div>
        <div className="pt-6 border-t border-border">
          <Button variant="danger" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
