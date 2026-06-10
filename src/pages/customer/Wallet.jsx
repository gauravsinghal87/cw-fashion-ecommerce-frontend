import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { formatPrice, formatDate } from '../../utils/helpers';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    get(API.WALLET.BASE).then(({ data }) => setWallet(data.wallet)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchTx = async () => {
      loadingRef.current = true;
      if (txPage === 1) setLoading(true);
      try {
        const { data } = await get(API.WALLET.TRANSACTIONS, { page: txPage, limit: 20 });
        if (cancelled) return;
        setTransactions(prev => txPage === 1 ? (data.transactions || []) : [...prev, ...(data.transactions || [])]);
        setHasMore(txPage < (data.pagination?.totalPages || 1));
      } catch {}
      finally {
        if (!cancelled) { loadingRef.current = false; setLoading(false); }
      }
    };
    fetchTx();
    return () => { cancelled = true; };
  }, [txPage]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          loadingRef.current = true;
          setTxPage(p => p + 1);
        }
      },
      { rootMargin: '200px' }
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-4 sm:mb-6">My Wallet</h1>

      <div className="card-luxe p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Available Balance</p>
        <p className="text-3xl sm:text-4xl font-display font-semibold">{wallet ? formatPrice(wallet.balance) : '₹0'}</p>
      </div>

      <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Transaction History</h3>
      <div className="space-y-2">
        {loading && transactions.length === 0 ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 skeleton" />) : transactions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <>
            {transactions.map((t) => (
              <div key={t._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-4 border border-border bg-white">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize truncate">{t.category.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500 truncate">{t.description} &bull; {formatDate(t.createdAt)}</p>
                </div>
                <span className={`text-sm font-medium flex-shrink-0 ${t.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                  {t.type === 'credit' ? '+' : '-'}{formatPrice(t.amount)}
                </span>
              </div>
            ))}
            {loading && <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
            {hasMore && <div ref={sentinelRef} className="h-4" />}
            {!hasMore && transactions.length > 0 && <p className="text-center text-xs text-gray-400 py-4">All transactions loaded</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Wallet;
