import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { post } from "../../utils/apiMethods";
import { API } from "../../utils/apiPaths";
import { motion } from "framer-motion";
import { loginVendor, setVendorCredentials } from "../../store/vendorSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const VendorLogin = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Check if coming from a protected page
  const from = location.state?.from?.pathname || "/vendor/dashboard";

  const { loading: authLoading, error } = useSelector(
    (state) => state.vendor || {},
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await dispatch(
      loginVendor({ email: form.email, password: form.password }),
    );
    if (result?.meta?.requestStatus === "fulfilled") {
      navigate(from, { replace: true });
    } else {
      const err = result?.payload;
      if (err?.needsVerification) {
        toast.error('Please verify your email first');
        navigate('/verify-email?email=' + encodeURIComponent(form.email));
      } else {
        toast.error(err?.message || err || "Login failed. Please check your credentials.");
      }
    }
    setLoading(false);
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const payload = JSON.parse(
        atob(credentialResponse.credential.split(".")[1]),
      );
      const { data } = await post(API.AUTH.SOCIAL_LOGIN, {
        provider: "google",
        providerId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      });

      dispatch(setVendorCredentials({ user: data.user, token: data.token }));
      toast.success("Signed in with Google");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Google sign-in failed");
    }
  };

  const handleForgotPassword = () => {
    navigate("/vendor/forgot-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-0 sm:mx-4"
      >
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Vendor Login
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2">
              Sign in to your vendor account
            </p>
          </div>

          {error && (
            <div className="bg-danger/5 border border-danger/20 text-danger text-xs sm:text-sm p-3 sm:p-4 mb-6">
              {typeof error === 'string' ? error : error?.message || 'Login failed'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
            <div>
              <div className="relative">
                <Input
                  label="Password *"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-xs text-gray-400 min-h-[44px]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs sm:text-sm text-gray-500 hover:text-primary min-h-[44px]"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <Button
              type="submit"
              loading={loading || authLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 mb-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="bg-white px-3 text-gray-400">
                  or continue with
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => toast.error("Google sign-in failed")}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Don't have an account?{" "}
              <a
                href="/vendor/register"
                className="text-primary font-medium hover:underline"
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorLogin;
