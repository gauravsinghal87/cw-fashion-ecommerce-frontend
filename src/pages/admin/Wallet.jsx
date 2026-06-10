import { useState, useEffect, useCallback } from 'react';
import { get, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';

const PRESETS = [100, 500, 1000];

const AdminWallet = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Action state
  const [actionType, setActionType] = useState('credit');
  const [actionAmount, setActionAmount] = useState('');
  const [actionDesc, setActionDesc] = useState('');
  const [actioning, setActioning] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const load = useCallback(async (userId) => {
    setLoading(true);
    try {
      const params = { page: page || 1, limit: 20 };
      if (userId) params.userId = userId;
      const { data } = await get(API.ADMIN.WALLET_TRANSACTIONS, params);
      setTransactions(data.transactions || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(selectedUser?._id); }, [selectedUser, page, load]);

  const searchUsers = async (q) => {
    if (!q || q.length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    setSearching(true);
    try {
      const { data } = await get(API.ADMIN.USERS, { search: q, limit: 10 });
      setSearchResults(data.users || []);
      setShowDropdown(true);
    } catch {} finally { setSearching(false); }
  };

  const selectUser = async (user) => {
    setSearch(user.name + ' (' + user.email + ')');
    setShowDropdown(false);
    setPage(1);
    setActionAmount('');
    setActionDesc('');
    setShowCustom(false);
    try {
      const { data } = await get(API.ADMIN.USERS + '/' + user._id);
      setSelectedUser(data.user || user);
    } catch { setSelectedUser(user); }
  };

  const clearUser = () => {
    setSelectedUser(null);
    setSearch('');
    setShowDropdown(false);
    setPage(1);
    setActionAmount('');
    setActionDesc('');
    setShowCustom(false);
  };

  const applyAction = async (amount) => {
    const finalAmount = amount || parseFloat(actionAmount);
    if (!finalAmount || finalAmount < 1) { toast.error('Enter a valid amount'); return; }
    if (!selectedUser) { toast.error('Select a user first'); return; }
    setActioning(true);
    try {
      await post(API.ADMIN.USER_WALLET_ADJUST(selectedUser._id), {
        type: actionType, amount: finalAmount, description: actionDesc || `${actionType === 'credit' ? 'Credited' : 'Debited'} ₹${finalAmount}`,
      });
      toast.success(`₹${finalAmount} ${actionType === 'credit' ? 'credited to' : 'debited from'} ${selectedUser.name}`);
      setActionAmount('');
      setActionDesc('');
      setShowCustom(false);

      const { data } = await get(API.ADMIN.USERS + '/' + selectedUser._id);
      setSelectedUser(data.user || selectedUser);
      load(selectedUser._id);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActioning(false); }
  };

  if (loading && !transactions.length && !selectedUser) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Wallet Management</h1>

      {/* User Search */}
      <div className="relative mb-6 max-w-lg">
        <div className="relative">
          <input value={search} onChange={(e) => { setSearch(e.target.value); searchUsers(e.target.value); }} placeholder="Search user by name, email or phone..." className="input-luxe text-sm w-full min-h-[44px] pl-10" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          {selectedUser && <button onClick={clearUser} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 min-h-[36px] min-w-[36px]">&times;</button>}
          {searching && <div className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 bg-white border border-border rounded shadow-lg mt-1 max-h-60 overflow-y-auto">
            {searchResults.map(u => (
              <button key={u._id} onClick={() => selectUser(u)} className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-border/50 last:border-0 min-h-[44px]">
                <span className="font-medium">{u.name}</span>
                <span className="text-gray-500 ml-2">{u.email}</span>
                <span className="text-gray-400 text-xs ml-2">{u.role}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Wallet Dashboard */}
      {selectedUser && (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lg font-bold text-blue-700 border-2 border-blue-200">{selectedUser.name?.[0]}</div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email} · {selectedUser.phone || '—'}</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 mt-1 inline-block">{selectedUser.role}</span>
                </div>
              </div>
              <div className="text-right bg-white rounded-lg px-5 py-3 border border-blue-200 min-w-[160px]">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Wallet Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700">{formatPrice(selectedUser.walletBalance || 0)}</p>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-xl border border-border p-5 mb-6">
            <h3 className="font-semibold mb-4">Quick Action</h3>

            {/* Credit/Debit Toggle */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setActionType('credit')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg border min-h-[44px] ${actionType === 'credit' ? 'bg-green-600 text-white border-green-600' : 'border-border text-gray-600 hover:bg-gray-50'}`}>Credit</button>
              <button onClick={() => setActionType('debit')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg border min-h-[44px] ${actionType === 'debit' ? 'bg-red-600 text-white border-red-600' : 'border-border text-gray-600 hover:bg-gray-50'}`}>Debit</button>
            </div>

            {/* Preset Amounts */}
            <div className="flex gap-2 mb-3">
              {PRESETS.map(p => (
                <button key={p} onClick={() => { setShowCustom(false); setActionAmount(''); applyAction(p); }} disabled={actioning}
                  className={`flex-1 py-3 text-sm font-medium rounded-lg border min-h-[44px] ${actionType === 'credit' ? 'hover:bg-green-50 hover:border-green-300' : 'hover:bg-red-50 hover:border-red-300'} border-border disabled:opacity-40`}>
                  {actionType === 'credit' ? '+' : '-'}₹{p}
                </button>
              ))}
              <button onClick={() => setShowCustom(!showCustom)} className={`flex-1 py-3 text-sm font-medium rounded-lg border min-h-[44px] ${showCustom ? 'border-primary bg-primary/5' : 'border-border'} hover:bg-gray-50`}>
                Custom
              </button>
            </div>

            {/* Custom Amount Input */}
            {showCustom && (
              <div className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <input type="number" value={actionAmount} onChange={(e) => setActionAmount(e.target.value)} placeholder="Enter amount" className="input-luxe text-sm flex-1 min-h-[44px]" min="1" />
                  <button onClick={() => applyAction()} disabled={actioning || !actionAmount}
                    className={`px-6 py-2.5 text-sm font-medium rounded-lg min-h-[44px] text-white ${actionType === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-40`}>
                    {actioning ? 'Processing...' : actionType === 'credit' ? 'Credit' : 'Debit'}
                  </button>
                </div>
                <input value={actionDesc} onChange={(e) => setActionDesc(e.target.value)} placeholder="Description (optional)" className="input-luxe text-sm w-full min-h-[44px]" />
              </div>
            )}
          </div>
        </>
      )}

      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{selectedUser ? 'Recent Transactions' : 'All Transactions'}</h3>
          <p className="text-xs text-gray-500">{pagination?.total || 0} total</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-border">
              <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">User</th>
              <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Type</th>
              <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 text-right">Amount</th>
              <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden md:table-cell">Category</th>
              <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500 hidden lg:table-cell">Description</th>
              <th className="py-3 px-2 font-medium text-xs uppercase tracking-wider text-gray-500">Date</th>
            </tr></thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-border/50 hover:bg-gray-50/50">
                  <td className="py-3 px-2 text-sm">{t.user?.name || '\u2014'}</td>
                  <td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 ${t.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{t.type}</span></td>
                  <td className="py-3 px-2 text-right font-medium">{'\u20B9'}{t.amount?.toLocaleString()}</td>
                  <td className="py-3 px-2 hidden md:table-cell text-xs">{t.category || '\u2014'}</td>
                  <td className="py-3 px-2 hidden lg:table-cell text-xs text-gray-500 max-w-[200px] truncate">{t.description || '\u2014'}</td>
                  <td className="py-3 px-2 text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!transactions.length && <p className="text-center text-gray-500 py-12 text-sm">No transactions</p>}
        </div>

        {pagination?.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
            <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); }} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminWallet;
