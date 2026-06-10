export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getReviewStatusColor = (status) => {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    approved: 'text-green-600 bg-green-50 border-green-200',
    rejected: 'text-red-600 bg-red-50 border-red-200',
    hidden: 'text-gray-500 bg-gray-100 border-gray-200',
  };
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
};

export const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
};

export const truncate = (str, len = 100) => {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
};

export const calculateDiscount = (mrp, price) => {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    accepted: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    packed: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    shipped: 'text-blue-600 bg-blue-50 border-blue-200',
    out_for_delivery: 'text-purple-600 bg-purple-50 border-purple-200',
    delivered: 'text-green-600 bg-green-50 border-green-200',
    cancelled: 'text-gray-600 bg-gray-50 border-gray-200',
    approved: 'text-green-600 bg-green-50 border-green-200',
    rejected: 'text-red-600 bg-red-50 border-red-200',
    completed: 'text-green-600 bg-green-50 border-green-200',
    return_requested: 'text-orange-600 bg-orange-50 border-orange-200',
    return_approved: 'text-blue-600 bg-blue-50 border-blue-200',
    return_rejected: 'text-red-600 bg-red-50 border-red-200',
    pickup_scheduled: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    picked_up: 'text-purple-600 bg-purple-50 border-purple-200',
    return_received: 'text-violet-600 bg-violet-50 border-violet-200',
    qc_passed: 'text-teal-600 bg-teal-50 border-teal-200',
    qc_failed: 'text-red-700 bg-red-100 border-red-300',
    refund_processed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    dispute_open: 'text-rose-600 bg-rose-50 border-rose-200',
    dispute_resolved: 'text-gray-700 bg-gray-100 border-gray-300',
    refunded: 'text-teal-600 bg-teal-50 border-teal-200',
    settled: 'text-gray-800 bg-gray-100 border-gray-300',
  };
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
};
