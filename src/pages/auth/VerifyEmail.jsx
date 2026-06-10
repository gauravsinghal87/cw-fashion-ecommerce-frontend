import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { setUser } from '../../store/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const email = searchParams.get('email') || user?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const verify = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('No email found'); return; }
    setLoading(true);
    try {
      const { data } = await post(API.AUTH.VERIFY_EMAIL, { email, otp });
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          dispatch(setUser(data.user));
        }
      }
      toast.success('Email verified!');
      const redirect = sessionStorage.getItem('redirectAfterAuth') || '/';
      sessionStorage.removeItem('redirectAfterAuth');
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) { toast.error('No email found'); return; }
    if (resendCooldown > 0) return;
    try {
      await post(API.AUTH.RESEND_VERIFICATION, { email });
      toast.success('OTP resent');
      setResendCooldown(60);
    } catch (err) {
      const cooldown = err.response?.data?.cooldownSeconds;
      if (cooldown) {
        setResendCooldown(cooldown);
      }
      toast.error(err.response?.data?.message || 'Failed to resend');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
        <div className="card-luxe p-4 sm:p-6 md:p-8 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-2">Verify Your Email</h1>
          {email ? (
            <>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Enter the OTP sent to <strong>{email}</strong></p>
              <form onSubmit={verify} className="space-y-3 sm:space-y-4 md:space-y-6 max-w-xs mx-auto">
                <Input label="OTP Code" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" required maxLength={6} />
                <Button type="submit" loading={loading} className="w-full">Verify</Button>
              </form>
              <button onClick={resend} disabled={resendCooldown > 0} className="text-sm text-primary hover:underline mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </>
          ) : (
            <p className="text-gray-500">No email found. <button onClick={() => navigate('/login')} className="text-primary hover:underline">Go to login</button></p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
