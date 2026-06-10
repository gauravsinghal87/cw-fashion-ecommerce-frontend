import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, setCredentials } from '../../store/authSlice';
import { post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Min 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = await dispatch(loginUser({ email, password }));
      if (result?.meta?.requestStatus === 'fulfilled') {
        const user = result.payload.user;
        if (user.role === 'admin' || user.role === 'subadmin') navigate('/admin');
        else if (user.role === 'vendor') navigate('/vendor');
        else navigate('/');
      } else {
        const err = result?.payload;
        if (err?.needsVerification) {
          toast.error('Please verify your email first');
          navigate('/verify-email?email=' + encodeURIComponent(email));
        } else {
          toast.error(err?.message || err || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const { data } = await post(API.AUTH.SOCIAL_LOGIN, {
        provider: 'google', providerId: payload.sub,
        email: payload.email, name: payload.name, avatar: payload.picture,
      });
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success('Signed in with Google');
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'vendor') navigate('/vendor');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
        <div className="card-luxe p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">Welcome Back</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-danger/5 border border-danger/20 text-danger text-sm p-3 mb-4 sm:mb-6">{typeof error === 'string' ? error : error?.message || 'Login failed'}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            <div>
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-primary">Forgot password?</Link>
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>

          <div className="mt-6 mb-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">or continue with</span></div>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={onGoogleSuccess} onError={() => toast.error('Google sign-in failed')} theme="outline" size="large" text="continue_with" shape="rectangular" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link></p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-gray-400 text-center">Demo: admin@luxefashion.com / Admin@1234</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
