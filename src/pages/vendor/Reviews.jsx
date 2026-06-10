import { useState, useEffect } from 'react';
import { get, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatDate, formatPrice, getInitials } from '../../utils/helpers';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [ratingFilter, setRatingFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReport, setShowReport] = useState(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');

  useEffect(() => { load(); }, [ratingFilter, page]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (ratingFilter) params.set('rating', ratingFilter);
      const { data } = await get(`${API.REVIEWS.VENDOR_ALL}?${params}`);
      setReviews(data.reviews || []);
      setAnalytics(data.analytics || {});
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  const submitReply = async (reviewId) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;
    try {
      await post(API.REVIEWS.VENDOR_REPLY(reviewId), { text });
      toast.success('Reply posted');
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reply'); }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    if (!showReport) return;
    try {
      await post(API.REVIEWS.VENDOR_REPORT(showReport._id), { reason: reportReason, details: reportDetails });
      toast.success('Report submitted');
      setShowReport(null);
      setReportReason('spam');
      setReportDetails('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to report'); }
  };

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>&#9733;</span>
  ));

  const getBarPercent = (value, total) => total ? Math.round((value / total) * 100) : 0;

  if (loading && reviews.length === 0) return <div className="p-3 sm:p-4 md:p-6 lg:p-8"><div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton" />)}</div></div>;

  const totalReviews = analytics?.totalReviews || 0;
  const avgRating = analytics?.avgRating || 0;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Reviews</h1>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        <div className="card-luxe p-3 text-center">
          <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Average</p>
        </div>
        <div className="card-luxe p-3 text-center">
          <p className="text-2xl font-bold">{totalReviews}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="card-luxe p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{analytics?.fiveStar || 0}</p>
          <p className="text-xs text-gray-500">5 ★</p>
          <div className="h-1 bg-gray-100 mt-1 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${getBarPercent(analytics?.fiveStar || 0, totalReviews)}%` }} /></div>
        </div>
        <div className="card-luxe p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{analytics?.fourStar || 0}</p>
          <p className="text-xs text-gray-500">4 ★</p>
          <div className="h-1 bg-gray-100 mt-1 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${getBarPercent(analytics?.fourStar || 0, totalReviews)}%` }} /></div>
        </div>
        <div className="card-luxe p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{analytics?.threeStar || 0}</p>
          <p className="text-xs text-gray-500">3 ★</p>
          <div className="h-1 bg-gray-100 mt-1 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{ width: `${getBarPercent(analytics?.threeStar || 0, totalReviews)}%` }} /></div>
        </div>
        <div className="card-luxe p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{analytics?.twoStar || 0}</p>
          <p className="text-xs text-gray-500">2 ★</p>
          <div className="h-1 bg-gray-100 mt-1 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${getBarPercent(analytics?.twoStar || 0, totalReviews)}%` }} /></div>
        </div>
        <div className="card-luxe p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{analytics?.oneStar || 0}</p>
          <p className="text-xs text-gray-500">1 ★</p>
          <div className="h-1 bg-gray-100 mt-1 rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${getBarPercent(analytics?.oneStar || 0, totalReviews)}%` }} /></div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[0, 5, 4, 3, 2, 1].map((s) => (
          <button key={s} onClick={() => { setRatingFilter(s); setPage(1); }} className={`px-3 py-2 text-xs border min-h-[36px] whitespace-nowrap ${ratingFilter === s ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'}`}>
            {s ? `${s} ★` : 'All'}
          </button>
        ))}
      </div>

      {reviews.length === 0 && <p className="text-center text-gray-500 py-8 text-xs sm:text-sm">No reviews found</p>}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r._id} className="card-luxe p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              {r.user?.avatar ? (
                <img src={r.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                  {getInitials(r.user?.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.user?.name || 'Anonymous'}</span>
                    <div className="flex">{renderStars(r.rating || 0)}</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      r.status === 'approved' ? 'text-green-600 bg-green-50' :
                      r.status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                      r.status === 'rejected' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'
                    }`}>{r.status}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
                {r.product && <p className="text-xs text-gray-500 mt-1">Product: {r.product.title}</p>}
                {r.isVerifiedPurchase && <span className="text-xs text-green-600">Verified Purchase</span>}
                {r.title && <p className="text-sm font-medium mt-1">{r.title}</p>}
                {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                {r.images?.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {r.images.map((img, i) => <img key={i} src={img} alt="" className="w-12 h-12 object-cover rounded border cursor-pointer" onClick={() => window.open(img, '_blank')} />)}
                  </div>
                )}
                {r.helpfulCount > 0 && <p className="text-xs text-gray-400 mt-1">{r.helpfulCount} found helpful</p>}

                {/* Vendor Reply */}
                {r.vendorReply?.text ? (
                  <div className="ml-4 pl-3 border-l-2 border-primary/30 mt-2 text-sm text-gray-500">
                    <span className="text-xs font-medium text-primary">Your reply: </span>{r.vendorReply.text}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(r.vendorReply.repliedAt)}</p>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <input value={replyText[r._id] || ''} onChange={(e) => setReplyText({ ...replyText, [r._id]: e.target.value })} placeholder="Write a reply..." className="input-luxe text-xs flex-1 w-full min-h-[44px]" />
                    <button onClick={() => submitReply(r._id)} disabled={!replyText[r._id]?.trim()} className="btn-primary text-xs px-3 py-2 min-h-[44px] w-full sm:w-auto">Reply</button>
                  </div>
                )}

                {/* Report Review */}
                {!r.report?.isReported && (
                  <button onClick={() => setShowReport(r)} className="text-xs text-gray-400 hover:text-red-500 mt-2 min-h-[32px]">Report this review</button>
                )}
                {r.report?.isReported && (
                  <p className="text-xs text-orange-500 mt-2">Reported ({r.report.reason})</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 text-xs border min-h-[36px] ${page === i + 1 ? 'bg-primary text-white' : ''}`}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowReport(null)}>
          <div className="bg-white w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-4">Report Review</h3>
            <p className="text-xs text-gray-500 mb-3">Review by {showReport.user?.name}</p>
            <form onSubmit={submitReport} className="space-y-3">
              <select value={reportReason} onChange={e => setReportReason(e.target.value)} className="input-luxe text-sm w-full">
                <option value="spam">Spam</option>
                <option value="fake">Fake Review</option>
                <option value="abusive">Abusive Language</option>
                <option value="offensive">Offensive</option>
                <option value="other">Other</option>
              </select>
              <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} placeholder="Additional details..." className="input-luxe text-sm h-20 w-full" />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">Submit Report</button>
                <button type="button" onClick={() => setShowReport(null)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
