import { useState, useEffect } from 'react';
import { get, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import Button from '../../components/ui/Button';

const VendorWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get(API.VENDORS.WALLET),
      get(API.VENDORS.WITHDRAWALS),
    ]).then(([w, wd]) => { setWallet(w.data.wallet); setWithdrawals(wd.data.withdrawals || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const request = async (e) => {
    e.preventDefault();
    try { await post(API.VENDORS.WITHDRAWAL_REQUEST, { amount: Number(amount) }); toast.success('Withdrawal requested'); setAmount(''); window.location.reload(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Withdrawals</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-5"><p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Balance</p><p className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">{formatPrice(wallet?.balance || 0)}</p></div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-5"><p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Pending</p><p className="text-xl sm:text-2xl md:text-3xl font-bold mt-2 text-yellow-600">{formatPrice(wallet?.pendingWithdrawal || 0)}</p></div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-5"><p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Withdrawn</p><p className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">{formatPrice(wallet?.totalWithdrawn || 0)}</p></div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 mb-8 max-w-md">
        <h3 className="text-sm font-medium mb-4">Request Withdrawal</h3>
        <form onSubmit={request} className="flex-col sm:flex-row gap-3 flex">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (min ₹500)" min="500" className="input-luxe text-sm flex-1 w-full min-h-[44px]" required />
          <Button type="submit" size="sm" className="w-full sm:w-auto">Request</Button>
        </form>
      </div>

      <h3 className="text-sm sm:text-base font-medium mb-4">History</h3>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-[600px] lg:min-w-0 w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Amount</th><th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Net Amount</th><th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Method</th><th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th><th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Date</th></tr></thead>
            <tbody className="divide-y divide-border">
              {withdrawals.map((w) => (
                <tr key={w._id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">{formatPrice(w.amount)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(w.netAmount)}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs uppercase">{w.paymentMethod}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3"><span className={`text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 border ${getStatusColor(w.status)}`}>{w.status}</span></td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{formatDate(w.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorWithdrawals;
