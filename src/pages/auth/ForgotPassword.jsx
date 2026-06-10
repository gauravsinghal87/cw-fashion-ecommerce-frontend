import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateOTP = () => {
    const e = {};
    if (!otp || otp.length !== 6) e.otp = 'Enter the 6-digit OTP';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePassword = () => {
    const e = {};
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setLoading(true);
    try {
      await post(API.AUTH.FORGOT_PASSWORD, { email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateOTP()) return;
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setLoading(true);
    try {
      await post(API.AUTH.RESET_PASSWORD, { email, otp, password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 px-3 sm:px-4">
      <div className="w-full max-w-md mx-auto card-luxe p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">Forgot Password</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            {step === 1 && 'Enter your email to receive an OTP'}
            {step === 2 && 'Enter the 6-digit OTP sent to your email'}
            {step === 3 && 'Set your new password'}
          </p>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-3 sm:space-y-4 md:space-y-6">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            <Button type="submit" loading={loading} className="w-full">Send OTP</Button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-3 sm:space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">OTP</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-luxe min-h-[44px] px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-center text-2xl tracking-[12px] font-mono"
                placeholder="000000" maxLength={6} autoFocus />
              {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp}</p>}
            </div>
            <Button type="submit" className="w-full">Verify OTP</Button>
            <div className="text-center">
              <button type="button" onClick={handleSendOTP} className="text-xs text-primary hover:underline min-h-[44px]">Resend OTP</button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-3 sm:space-y-4 md:space-y-6">
            <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm your password" required />
            {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
