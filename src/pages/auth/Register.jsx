import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useSite } from '../../context/SiteContext';
import { registerUser } from '../../store/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const { siteTitle } = useSite();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [referralCode, setReferralCode] = useState('');
  const [manualReferral, setManualReferral] = useState('');
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
    if (location.state?.from) {
      sessionStorage.setItem('redirectAfterAuth', location.state.from);
    }
  }, [searchParams, location.state]);

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone)) newErrors.phone = 'Invalid phone format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const payload = { name: form.name, email: form.email, password: form.password, phone: form.phone };
    const code = referralCode || manualReferral;
    if (code) payload.referralCode = code;
    const result = await dispatch(registerUser(payload));
    if (result?.meta?.requestStatus === 'fulfilled') {
      navigate('/verify-email?email=' + encodeURIComponent(form.email));
    } else {
      toast.error(result?.payload || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
        <div className="card-luxe p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">Create Account</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2">Join {siteTitle} today</p>
          </div>

          {referralCode && (
            <div className="bg-accent/5 border border-accent/20 text-accent text-sm p-3 mb-4 rounded flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Referral applied! Code: <strong>{referralCode}</strong></span>
            </div>
          )}

          {error && <div className="bg-danger/5 border border-danger/20 text-danger text-sm p-3 mb-4 sm:mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" required />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}

            {!referralCode && (
              <div>
                <Input label="Referral Code (optional)" value={manualReferral} onChange={(e) => setManualReferral(e.target.value.toUpperCase())} placeholder="Enter referral code" />
                {errors.referral && <p className="text-xs text-red-500 mt-1">{errors.referral}</p>}
              </div>
            )}

            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" required minLength={8} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm your password" required />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            <Button type="submit" loading={loading} className="w-full">Create Account</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
