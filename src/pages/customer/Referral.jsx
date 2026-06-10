import { useState, useEffect } from 'react';
import { get } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { useSite } from '../../context/SiteContext';

const Referral = () => {
  const { siteTitle } = useSite();
  const [code, setCode] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    Promise.all([
      get(API.REFERRALS.CODE),
      get(API.REFERRALS.ANALYTICS),
      get(API.REFERRALS.LIST),
    ]).then(([c, a, r]) => {
      setCode(c.data.code);
      setAnalytics(a.data.analytics);
      setReferrals(r.data.referrals || []);
    }).catch(() => {});
  }, []);

  const copyToClipboard = (text) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success('Copied to clipboard!');
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
    document.body.removeChild(textarea);
  };

  const copyCode = () => copyToClipboard(code);

  const referralLink = `${window.location.origin}/register?ref=${code}`;

  const copyLink = () => copyToClipboard(referralLink);

  const shareVia = (platform) => {
    const text = `Join me on ${siteTitle}! Use my referral code ${code} and get rewards. Sign up here: ${referralLink}`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Join me on ${siteTitle}!`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-4 sm:mb-6">Refer & Earn</h1>

      {/* Referral Code Card */}
      <div className="card-luxe p-6 sm:p-8 text-center mb-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Referral Code</p>
        <p className="text-2xl sm:text-3xl font-display font-bold tracking-[0.2em] text-accent mb-3 select-all">{code || '------'}</p>
        <p className="text-xs text-gray-400 mb-4 break-all">{referralLink}</p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          <button onClick={copyCode} className="btn-primary text-xs px-5 py-3 min-h-[44px] flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Copy Code
          </button>
          <button onClick={copyLink} className="btn-outline text-xs px-5 py-3 min-h-[44px] flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            Copy Link
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-accent/10">
          <p className="text-xs text-gray-500 mb-2">Share via</p>
          <div className="flex justify-center gap-2 sm:gap-3">
            <button onClick={() => shareVia('whatsapp')} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center text-[#25D366] transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0" title="WhatsApp">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            <button onClick={() => shareVia('telegram')} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0088cc]/10 hover:bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0" title="Telegram">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </button>
            <button onClick={() => shareVia('facebook')} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2] transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0" title="Facebook">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button onClick={() => shareVia('twitter')} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0" title="Twitter / X">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card-luxe p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-semibold">{analytics?.totalReferrals || 0}</p>
          <p className="text-xs text-gray-500">Total Referrals</p>
        </div>
        <div className="card-luxe p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-semibold">{analytics?.completedReferrals || 0}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="card-luxe p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-semibold">₹{analytics?.totalEarnings || 0}</p>
          <p className="text-xs text-gray-500">Earnings</p>
        </div>
        <div className="card-luxe p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-semibold">{analytics?.pendingReferrals || 0}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
      </div>

      {/* How it works */}
      <div className="card-luxe p-4 sm:p-6 mb-6">
        <h3 className="text-sm font-medium mb-3">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <span>Share your referral code or link with friends</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <span>Friend registers using your link and places their first order</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <span>After delivery + return period, both get rewarded in wallet</span>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Referral History</h3>
      {referrals.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No referrals yet. Share your code to start earning!</p>
      ) : (
        <div className="space-y-2">
          {referrals.map((r) => (
            <div key={r._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-4 border border-border bg-white">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.referred?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{r.referred?.email} &bull; {formatDate(r.createdAt)}</p>
                {r.orderAmount && <p className="text-xs text-gray-400 mt-0.5">Order: ₹{r.orderAmount}</p>}
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 ${
                  r.status === 'completed' ? 'bg-success/10 text-success' :
                  r.status === 'rejected' ? 'bg-danger/10 text-danger' :
                  r.isFraud ? 'bg-danger/10 text-danger' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  {r.isFraud ? 'Fraud' : r.status}
                </span>
                {r.status === 'completed' && <p className="text-xs font-medium text-success mt-1">+₹{r.rewardReferrer}</p>}
                {r.referrerRewarded && r.status === 'completed' && <p className="text-xs text-gray-400 mt-0.5">Reward paid</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Referral;
