import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { get, post } from "../../utils/apiMethods";
import { API } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, fetchCart } from "../../store/cartSlice";
import { formatPrice } from "../../utils/helpers";
import { useSite } from "../../context/SiteContext";
import Button from "../../components/ui/Button";

const COLOR_MAP = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  pink: "#ec4899",
  brown: "#a16207",
  black: "#171717",
  white: "#f5f5f5",
  gray: "#6b7280",
  grey: "#6b7280",
  navy: "#1e3a5f",
  maroon: "#800000",
  teal: "#0d9488",
  indigo: "#4f46e5",
  violet: "#7c3aed",
  cyan: "#06b6d4",
  lime: "#84cc16",
  amber: "#d97706",
  rose: "#f43f5e",
  emerald: "#10b981",
  sky: "#0ea5e9",
  gold: "#d4a017",
  silver: "#c0c0c0",
};
function getColorHex(c) {
  const color = (c || "").trim().toLowerCase();
  if (COLOR_MAP[color]) return COLOR_MAP[color];
  if (/^#[0-9a-f]{3,6}$/i.test(color)) return color;
  return c || null;
}
const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { siteTitle } = useSite();
  const { items, coupon, shippingInfo } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    get(API.USERS.ADDRESSES)
      .then(({ data }) => {
        setAddresses(data.addresses || []);
        const def = data.addresses?.find((a) => a.isDefault);
        if (def) setSelectedAddress(def._id);
      })
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const shipping =
    shippingInfo?.estimatedShipping ?? (subtotal >= 999 ? 0 : 99);
  const discount = coupon?.discount || 0;
  const total = subtotal - discount + shipping;

  const validate = () => {
    const newErrors = {};
    if (!selectedAddress)
      newErrors.address = "Please select a shipping address";
    if (!paymentMethod) newErrors.payment = "Please select a payment method";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrder = useCallback(async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const address = addresses.find((a) => a._id === selectedAddress);
      const isRazorpay =
        paymentMethod === "razorpay" ||
        paymentMethod === "razorpay_upi" ||
        paymentMethod === "razorpay_card";
      const method = isRazorpay ? "razorpay" : paymentMethod;

      const { data } = await post(API.ORDERS.CREATE, {
        items: items.map((i) => ({
          productId: i.product?._id || i.product,
          variantId: i.variant?._id || i.variant,
          quantity: i.quantity,
        })),
        shippingAddress: address,
        paymentMethod: method,
        couponCode: coupon?.code,
      });
      const order = data.order;

      if (method === "cod" || method === "wallet") {
        toast.success("Order placed successfully!");
        dispatch(clearCart());
        navigate(`/orders/${order._id}`);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway");
        setSubmitting(false);
        return;
      }

      const { data: rzpData } = await post(API.ORDERS.RAZORPAY_CREATE, {
        orderId: order._id,
      });

      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency || "INR",
        name: siteTitle,
        description: `Order #${order.orderNumber}`,
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: user?.email || "",
          contact: address.phone,
        },
        theme: { color: "#000000" },
        handler: async (response) => {
          try {
            await post(API.ORDERS.RAZORPAY_VERIFY, {
              orderId: order._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful! Order placed.");
            dispatch(clearCart());
            navigate(`/orders/${order._id}`);
          } catch {
            toast.error("Payment verification failed");
            navigate(`/orders/${order._id}`);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
      setSubmitting(false);
    }
  }, [
    validate,
    addresses,
    selectedAddress,
    items,
    coupon,
    dispatch,
    navigate,
    user,
    paymentMethod,
  ]);

  const isRazorpaySelected =
    paymentMethod === "razorpay_upi" ||
    paymentMethod === "razorpay_card" ||
    paymentMethod === "razorpay";
  const buttonLabel =
    paymentMethod === "cod"
      ? "Place Order (COD)"
      : paymentMethod === "wallet"
        ? `Pay ₹${formatPrice(total)} from Wallet`
        : isRazorpaySelected
          ? `Pay ₹${total} Now`
          : "Place Order";

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-4 sm:mb-6 lg:mb-8">
        Checkout
      </h1>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
          <div className="card-luxe p-4 sm:p-6">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4">
              Delivery Address
            </h3>
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">
                No addresses saved.{" "}
                <Link to="/addresses" className="text-primary hover:underline">
                  Add one
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`block p-3 sm:p-4 border cursor-pointer transition-colors ${selectedAddress === addr._id ? "border-primary bg-primary/5" : "border-border hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                      className="sr-only"
                    />
                    <p className="text-sm font-medium">{addr.fullName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {addr.addressLine1}, {addr.city}, {addr.state} -{" "}
                      {addr.pincode}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>
                  </label>
                ))}
              </div>
            )}
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          <div className="card-luxe p-4 sm:p-6">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4">
              Payment Method
            </h3>
            <div className="space-y-3">
              {[
                {
                  value: "cod",
                  label: "Cash on Delivery",
                  desc: "Pay when you receive your order",
                },
                {
                  value: "wallet",
                  label: "Wallet",
                  desc: "Pay using your wallet balance",
                },
                {
                  value: "razorpay_card",
                  label: "Credit / Debit Card / UPI",
                  desc: "Visa, Mastercard, RuPay, Net Banking, UPI",
                },
              ].map((pm, idx) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between p-3 sm:p-4 border cursor-pointer transition-colors ${paymentMethod === pm.value ? "border-primary bg-primary/5" : "border-border hover:border-gray-300"}`}
                >
                  <div className="min-w-0">
                    <input
                      type="radio"
                      name="payment"
                      value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <p className="text-sm font-medium">{pm.label}</p>
                    <p className="text-xs text-gray-500">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.payment && (
              <p className="text-xs text-red-500 mt-1">{errors.payment}</p>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="card-luxe p-4 sm:p-6 sticky top-24 space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider">
              Order Summary
            </h3>

            {/* Items being purchased */}
            <div className="space-y-3 max-h-64 overflow-y-auto border-b border-border pb-3">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <div className="w-12 h-14 flex-shrink-0 bg-gray-50 border border-border overflow-hidden rounded">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-1">
                      {item.name}
                    </p>
                    {(item.color || item.size) && (
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {item.color && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                            <span
                              className="w-2 h-2 rounded-full border border-gray-300"
                              style={{
                                backgroundColor: getColorHex(item.color),
                              }}
                            />
                            {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                            Size: {item.size}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-500">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-xs font-semibold">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">
                  Subtotal ({items.length} items)
                </span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-success">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between gap-2 font-semibold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button
              onClick={placeOrder}
              loading={submitting}
              className="w-full"
            >
              {submitting ? "Processing..." : buttonLabel}
            </Button>
            {isRazorpaySelected && (
              <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Secured by Razorpay
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
