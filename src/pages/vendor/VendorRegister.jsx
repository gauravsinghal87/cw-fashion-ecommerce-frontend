import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../../utils/apiMethods";
import { API } from "../../utils/apiPaths";
import { motion } from "framer-motion";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const VendorRegister = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    panNumber: "",
    aadhaarNumber: "",
    bankAccount: "",
    ifscCode: "",
    upiId: "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateStep = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.phone) {
        toast.error("Please fill all required fields");
        return false;
      }

      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }

      return true;
    }

    if (step === 2) {
      if (!form.storeName) {
        toast.error("Store name is required");
        return false;
      }

      return true;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);

    try {
      const { data } = await post(API.VENDORS.REGISTER, {
        ...form,
        role: "vendor",
      });

      console.log("Registration response:", data);

      toast.success(
        "Vendor registration successful! Please check your email for verification.",
      );

      navigate("/vendor/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (stepNum) => {
    if (stepNum > step) {
      if (!validateStep()) return;
    }

    setStep(stepNum);
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-0 sm:mx-4"
      >
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Vendor Registration
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2">
              Join our marketplace as a vendor
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className={`flex flex-col items-center w-1/3`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium 
                  ${step >= stepNum ? "bg-primary text-white" : "border border-gray-300"}`}
                >
                  {stepNum}
                </div>
                <div
                  className={`mt-2 text-xs sm:text-sm text-gray-500 ${step >= stepNum ? "font-medium" : "font-normal"}`}
                >
                  {stepNum === 1 && "Account"}
                  {stepNum === 2 && "Store Info"}
                  {stepNum === 3 && "Bank Details"}
                </div>
                {stepNum < 3 && (
                  <div className="w-full h-0.5 bg-gray-200 mt-2"></div>
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
                <Input
                  label="Email *"
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
                <Input
                  label="Phone Number *"
                  autoComplete="tel"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  required
                />
                <div className="relative">
                  <Input
                    label="Password *"
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Create a strong password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[42px] min-h-[44px]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="Confirm Password *"
                    autoComplete="new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm your password"
                    required
                    minLength={8}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[42px] min-h-[44px]"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={() => handleStepChange(2)}
              >
                Continue to Store Info
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Store Name *"
                value={form.storeName}
                onChange={(e) =>
                  setForm({ ...form, storeName: e.target.value })
                }
                placeholder="Enter your store name"
                required
              />
              <Input
                label="PAN Number"
                value={form.panNumber}
                onChange={(e) =>
                  setForm({ ...form, panNumber: e.target.value })
                }
                placeholder="Your PAN card number"
              />
              <Input
                label="Aadhaar Number"
                value={form.aadhaarNumber}
                onChange={(e) =>
                  setForm({ ...form, aadhaarNumber: e.target.value })
                }
                placeholder="Your Aadhaar number"
              />

              <div className="flex-col sm:flex-row gap-2 flex">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => handleStepChange(1)}
                >
                  Previous Step
                </Button>

                <Button
                  type="button"
                  className="w-full sm:w-auto bg-primary text-white"
                  onClick={() => handleStepChange(3)}
                >
                  Continue to Bank Details
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Bank Account Number *"
                value={form.bankAccount}
                onChange={(e) =>
                  setForm({ ...form, bankAccount: e.target.value })
                }
                placeholder="Your bank account number"
                required
              />
              <Input
                label="IFSC Code *"
                value={form.ifscCode}
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                placeholder="Bank IFSC code"
                required
              />
              <Input
                label="UPI ID"
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                placeholder="Your UPI ID (optional)"
              />

              <div className="flex-col sm:flex-row gap-2 flex">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => handleStepChange(2)}
                >
                  Previous Step
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full sm:w-auto bg-primary text-white"
                >
                  Complete Registration
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Already have an account?{" "}
              <a
                href="/vendor/login"
                className="text-primary font-medium hover:underline"
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorRegister;
