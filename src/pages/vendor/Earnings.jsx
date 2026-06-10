import { useState, useEffect } from 'react';
import { get, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import Button from '../../components/ui/Button';

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'released', label: 'Released' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Earnings = () => {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Settlement state
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [settleFilter, setSettleFilter] = useState('');
  const [settleDetail, setSettleDetail] = useState(null);

  // Wallet state
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);

  // Withdrawal state
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [settRes, walletRes, wdRes, prof] = await Promise.all([
        get(API.VENDORS.SETTLEMENTS),
        get(API.VENDORS.WALLET_TRANSACTIONS),
        get(API.VENDORS.WITHDRAWALS),
        get(API.VENDORS.PROFILE),
      ]);
      const sd = settRes.data;
      setSettlements(sd.settlements || []);
      setSummary(sd.summary || null);
      setWallet(walletRes.data.wallet);
      setTransactions(walletRes.data.transactions || []);
      setWithdrawals(wdRes.data.withdrawals || []);
      setVendorProfile(prof.data.vendor);
      // Auto-select existing method
      if (prof.data.vendor?.bankAccount?.upiId) setPaymentMethod('upi');
    } catch { toast.error('Failed to load earnings data'); }
    finally { setLoading(false); }
  };

  const requestWithdrawal = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 1) { toast.error('Enter a valid amount'); return; }
    setRequesting(true);
    try {
      await post(API.VENDORS.WITHDRAWAL_REQUEST, { amount: amt, paymentMethod });
      toast.success('Withdrawal request submitted');
      setAmount('');
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Request failed'); }
    finally { setRequesting(false); }
  };

  const viewSettleDetail = async (id) => {
    try { const { data } = await get(API.VENDORS.SETTLEMENT_DETAIL(id)); setSettleDetail(data.settlement || data); }
    catch {}
  };

  const filteredSettlements = settleFilter ? settlements.filter(s => s.status === settleFilter) : settlements;

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Earnings</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-white border border-border rounded p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Earnings</p>
          <p className="text-lg sm:text-xl font-bold mt-1">{formatPrice(summary?.totalEarnings || 0)}</p>
        </div>
        <div className="bg-white border border-border rounded p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="text-lg sm:text-xl font-bold mt-1 text-amber-600">{formatPrice(summary?.pending || 0)}</p>
        </div>
        <div className="bg-white border border-border rounded p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Released</p>
          <p className="text-lg sm:text-xl font-bold mt-1 text-green-600">{formatPrice(summary?.released || 0)}</p>
        </div>
        <div className="bg-white border border-border rounded p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Wallet Balance</p>
          <p className="text-lg sm:text-xl font-bold mt-1">{formatPrice(wallet?.balance || 0)}</p>
        </div>
        <div className="bg-white border border-border rounded p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pending Withdrawal</p>
          <p className="text-lg sm:text-xl font-bold mt-1 text-yellow-600">{formatPrice(wallet?.pendingWithdrawal || 0)}</p>
        </div>
        <div className="bg-white border border-border rounded p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Withdrawn</p>
          <p className="text-lg sm:text-xl font-bold mt-1">{formatPrice(wallet?.totalWithdrawn || 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-border">
        {['overview', 'settlements', 'withdrawals', 'transactions'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm border-b-2 min-h-[44px] ${tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-gray-500'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white border border-border rounded p-4">
            <h3 className="font-medium mb-3">Earnings Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">Total Earnings:</span> <span className="font-medium">{formatPrice(summary?.totalEarnings || 0)}</span></div>
              <div><span className="text-gray-500">Pending Release:</span> <span className="font-medium text-amber-600">{formatPrice(summary?.pending || 0)}</span></div>
              <div><span className="text-gray-500">Released:</span> <span className="font-medium text-green-600">{formatPrice(summary?.released || 0)}</span></div>
            </div>
          </div>
          <div className="bg-white border border-border rounded p-4">
            <h3 className="font-medium mb-3">Wallet Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">Available Balance:</span> <span className="font-medium">{formatPrice(wallet?.balance || 0)}</span></div>
              <div><span className="text-gray-500">Total Credited:</span> <span className="font-medium text-green-600">{formatPrice(wallet?.totalCredited || 0)}</span></div>
              <div><span className="text-gray-500">Total Debited:</span> <span className="font-medium">{formatPrice(wallet?.totalDebited || 0)}</span></div>
            </div>
          </div>
          <div className="bg-white border border-border rounded p-4">
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTab('settlements')} className="text-xs border px-3 py-2 min-h-[36px]">View Settlements</button>
              <button onClick={() => setTab('withdrawals')} className="text-xs border px-3 py-2 min-h-[36px]">Request Withdrawal</button>
              <button onClick={() => setTab('transactions')} className="text-xs border px-3 py-2 min-h-[36px]">View Transactions</button>
            </div>
          </div>
        </div>
      )}

      {/* Settlements Tab */}
      {tab === 'settlements' && (
        <div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-6 items-stretch">
            {statusFilters.map((s) => (
              <button key={s.value} onClick={() => { setSettleFilter(s.value); }}
                className={`text-xs sm:text-sm px-4 py-2 border whitespace-nowrap min-h-[44px] flex items-center justify-center w-full sm:w-auto ${
                  settleFilter === s.value ? 'border-primary bg-primary text-white' : 'border-border hover:bg-gray-50'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="min-w-[700px] lg:min-w-0 w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Item</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Order #</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Date</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Amount</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Commission</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Net Earnings</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Status</th>
                    <th className="text-left px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Released</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSettlements.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => viewSettleDetail(s._id)}>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs max-w-[160px] truncate">{s.itemName || '\u2014'}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-mono text-xs">{s.order?.orderNumber || '\u2014'}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{formatDate(s.createdAt)}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(s.finalPrice || s.originalPrice || 0)}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{formatPrice(s.commissionAmount || 0)}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">{formatPrice(s.vendorEarnings || 0)}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3"><span className={`text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 border ${getStatusColor(s.status)}`}>{s.status}</span></td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-gray-500">{s.releasedAt ? formatDate(s.releasedAt) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSettlements.length === 0 && <p className="text-center text-gray-500 py-8 sm:py-12 text-xs sm:text-sm">No settlements found</p>}
          </div>
        </div>
      )}

      {/* Withdrawals Tab */}
      {tab === 'withdrawals' && (
        <div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 mb-8 max-w-lg">
            <h3 className="text-sm font-medium mb-4">Request Withdrawal</h3>

            {/* Saved Account Details */}
            {vendorProfile?.bankAccount && (vendorProfile.bankAccount.accountNumber || vendorProfile.bankAccount.upiId) && (
              <div className="mb-4 p-3 bg-gray-50 rounded border text-sm space-y-1.5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Your Saved Account</p>
                {vendorProfile.bankAccount.accountHolderName && <div><span className="text-gray-500">Holder:</span> <span className="font-medium">{vendorProfile.bankAccount.accountHolderName}</span></div>}
                {vendorProfile.bankAccount.bankName && <div><span className="text-gray-500">Bank:</span> <span className="font-medium">{vendorProfile.bankAccount.bankName}</span></div>}
                {vendorProfile.bankAccount.accountNumber && <div><span className="text-gray-500">A/C:</span> <span className="font-mono">{vendorProfile.bankAccount.accountNumber}</span></div>}
                {vendorProfile.bankAccount.ifscCode && <div><span className="text-gray-500">IFSC:</span> <span className="font-mono">{vendorProfile.bankAccount.ifscCode}</span></div>}
                {vendorProfile.bankAccount.upiId && <div><span className="text-gray-500">UPI:</span> <span className="font-mono">{vendorProfile.bankAccount.upiId}</span></div>}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Withdraw via</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPaymentMethod('bank_transfer')} disabled={!vendorProfile?.bankAccount?.accountNumber}
                  className={`flex-1 py-2.5 text-sm border rounded min-h-[44px] ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border'} ${!vendorProfile?.bankAccount?.accountNumber ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  Bank Transfer
                </button>
                <button type="button" onClick={() => setPaymentMethod('upi')} disabled={!vendorProfile?.bankAccount?.upiId}
                  className={`flex-1 py-2.5 text-sm border rounded min-h-[44px] ${paymentMethod === 'upi' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border'} ${!vendorProfile?.bankAccount?.upiId ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  UPI
                </button>
              </div>
            </div>

            <form onSubmit={requestWithdrawal} className="flex-col sm:flex-row gap-3 flex">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Min ₹${wallet?.withdrawalMinimum || 500}`} min={wallet?.withdrawalMinimum || 500} max={wallet?.balance || 0} className="input-luxe text-sm flex-1 w-full min-h-[44px]" required />
              <Button type="submit" disabled={requesting} size="sm" className="w-full sm:w-auto">{requesting ? 'Requesting...' : 'Request'}</Button>
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
      )}

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div>
          <h3 className="text-sm sm:text-base font-medium mb-4">Wallet Transactions</h3>
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t._id} className="bg-white border border-border rounded p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.description || t.category}</p>
                  <p className="text-xs text-gray-500">{formatDate(t.createdAt)}</p>
                </div>
                <div className={`text-right flex-shrink-0 ml-3 ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  <p className="text-sm font-medium">{t.type === 'credit' ? '+' : '-'}{formatPrice(t.amount)}</p>
                  <p className="text-xs text-gray-500">{t.category}</p>
                </div>
              </div>
            ))}
            {!transactions.length && <p className="text-center text-gray-500 py-8 text-sm">No transactions</p>}
          </div>
        </div>
      )}

      {/* Settlement Detail Modal */}
      {settleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setSettleDetail(null)}>
          <div className="bg-white w-full max-w-lg mx-0 sm:mx-4 p-4 sm:p-6 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Settlement Detail</h2>
              <button onClick={() => setSettleDetail(null)} className="text-xs sm:text-sm text-gray-500 hover:underline min-h-[44px] flex items-center">Close</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="text-right max-w-[60%]">{settleDetail.itemName || '\u2014'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Order #</span><span className="font-mono">{settleDetail.order?.orderNumber || '\u2014'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Original Price</span><span>{formatPrice(settleDetail.originalPrice || 0)}</span></div>
              {settleDetail.couponDiscount > 0 && <div className="flex justify-between"><span className="text-gray-500">Coupon Discount</span><span className="text-danger">-{formatPrice(settleDetail.couponDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Final Amount</span><span>{formatPrice(settleDetail.finalPrice || settleDetail.originalPrice || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Commission ({settleDetail.commissionRate || 0}%)</span><span className="text-gray-500">{formatPrice(settleDetail.commissionAmount || 0)}</span></div>
              <div className="flex justify-between border-t border-border pt-2"><span className="font-medium">Net Earnings</span><span className="font-bold">{formatPrice(settleDetail.vendorEarnings || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`text-xs px-2 py-0.5 border ${getStatusColor(settleDetail.status)}`}>{settleDetail.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivered</span><span className="text-xs text-gray-500">{settleDetail.deliveredAt ? formatDate(settleDetail.deliveredAt) : '\u2014'}</span></div>
              {settleDetail.releasedAt && <div className="flex justify-between"><span className="text-gray-500">Released</span><span className="text-xs text-gray-500">{formatDate(settleDetail.releasedAt)}</span></div>}
              {settleDetail.returnWindowEnd && <div className="flex justify-between"><span className="text-gray-500">Return Window</span><span className="text-xs text-gray-500">{formatDate(settleDetail.returnWindowEnd)}</span></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
