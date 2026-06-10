import { useState, useEffect } from 'react';
import { get, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice, formatDate } from '../../utils/helpers';

const VendorWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [walletRes, withdrawalRes] = await Promise.all([
        get(API.VENDORS.WALLET_TRANSACTIONS),
        get(API.VENDORS.WITHDRAWALS),
      ]);
      setWallet(walletRes.data.wallet);
      setTransactions(walletRes.data.transactions || []);
      setWithdrawals(withdrawalRes.data.withdrawals || []);
    } catch { toast.error('Failed to load wallet'); }
    finally { setLoading(false); }
  };

  const requestWithdrawal = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 1) { toast.error('Enter a valid amount'); return; }
    setRequesting(true);
    try {
      await post(API.VENDORS.WITHDRAWAL_REQUEST, { amount: amt });
      toast.success('Withdrawal request submitted');
      setAmount('');
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Request failed'); }
    finally { setRequesting(false); }
  };

  if (loading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Wallet</h1>

      {/* Balance Card */}
      <div className="card-luxe p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Available Balance</p>
            <p className="text-3xl sm:text-4xl font-bold mt-1">{formatPrice(wallet?.balance || 0)}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>Total Credited: {formatPrice(wallet?.totalCredited || 0)}</span>
              <span>Total Debited: {formatPrice(wallet?.totalDebited || 0)}</span>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-6 py-3 min-h-[44px]">
            {showForm ? 'Cancel' : 'Withdraw'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={requestWithdrawal} className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row gap-3 max-w-md">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min ₹${wallet?.withdrawalMinimum || 500}`} className="input-luxe text-sm flex-1 min-h-[44px]" min={wallet?.withdrawalMinimum || 500} max={wallet?.balance || 0} />
            <button type="submit" disabled={requesting} className="btn-primary text-sm px-4 min-h-[44px]">{requesting ? 'Requesting...' : 'Submit Request'}</button>
          </form>
        )}
      </div>

      {/* Withdrawals */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-3">Withdrawal History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-border">
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Amount</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Status</th>
              <th className="py-3 px-2 font-medium text-xs uppercase text-gray-500">Date</th>
            </tr></thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w._id} className="border-b border-border/50">
                  <td className="py-3 px-2 font-medium">{formatPrice(w.amount)}</td>
                  <td className="py-3 px-2"><span className={`text-xs px-1.5 py-0.5 ${w.status === 'completed' ? 'text-green-600 bg-green-50' : w.status === 'pending' ? 'text-yellow-600 bg-yellow-50' : w.status === 'rejected' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'}`}>{w.status}</span></td>
                  <td className="py-3 px-2 text-gray-500">{formatDate(w.createdAt)}</td>
                </tr>
              ))}
              {!withdrawals.length && <tr><td colSpan="3" className="py-8 text-center text-gray-500 text-sm">No withdrawals yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-base font-semibold mb-3">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map(t => (
            <div key={t._id} className="card-luxe p-3 flex items-center justify-between">
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
    </div>
  );
};

export default VendorWallet;
