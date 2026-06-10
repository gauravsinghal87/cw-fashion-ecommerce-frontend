import { useState } from 'react';
import { formatDate } from '../../utils/helpers';
import { post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const ReviewCard = ({ review, currentUserId, onUpdate }) => {
  const [helpfulLoading, setHelpfulLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');

  const isHelpful = review.helpfulUsers?.includes(currentUserId);
  const canEdit = currentUserId && review.user?._id === currentUserId && review.status !== 'hidden';

  const handleHelpful = async () => {
    setHelpfulLoading(true);
    try {
      const { data } = await post(API.REVIEWS.HELPFUL(review._id));
      if (onUpdate) onUpdate(review._id, { helpfulCount: data.helpfulCount });
      review.helpfulCount = data.helpfulCount;
      if (data.isHelpful) {
        review.helpfulUsers = [...(review.helpfulUsers || []), currentUserId];
      } else {
        review.helpfulUsers = (review.helpfulUsers || []).filter(id => id !== currentUserId);
      }
    } catch { toast.error('Failed to update'); }
    finally { setHelpfulLoading(false); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await post(API.REVIEWS.REPORT(review._id), { reason: reportReason, details: reportDetails });
      toast.success('Report submitted');
      setShowReport(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to report'); }
  };

  return (
    <div className="border-b border-border pb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {review.user?.avatar ? (
            <img src={review.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {(review.user?.name || 'A')[0]}
            </div>
          )}
          <span className="text-sm font-medium">{review.user?.name || 'Anonymous'}</span>
          {review.isVerifiedPurchase && (
            <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5">Verified Purchase</span>
          )}
          {review.isAnonymous && <span className="text-xs text-gray-400">(anonymous)</span>}
        </div>
        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
      </div>

      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
        ))}
      </div>

      {review.title && <p className="text-sm font-medium">{review.title}</p>}
      {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}

      {review.images?.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {review.images.map((img, i) => (
            <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded border border-border" />
          ))}
        </div>
      )}

      {review.vendorReply?.text && (
        <div className="ml-4 pl-3 border-l-2 border-primary/30 mt-2 text-sm text-gray-500">
          <span className="text-xs font-medium text-primary">Seller Response: </span>{review.vendorReply.text}
        </div>
      )}

      {review.editedAt && (
        <p className="text-xs text-gray-300 mt-1">Edited {formatDate(review.editedAt)}</p>
      )}

      {review.status === 'pending' && (
        <span className="inline-block mt-1 text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5">Pending Approval</span>
      )}

      <div className="flex items-center gap-3 mt-2">
        <button onClick={handleHelpful} disabled={helpfulLoading} className={`text-xs flex items-center gap-1 min-h-[32px] px-2 rounded ${isHelpful ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
          👍 {review.helpfulCount || 0} Helpful
        </button>
        {currentUserId && review.user?._id !== currentUserId && (
          <button onClick={() => setShowReport(!showReport)} className="text-xs text-gray-400 hover:text-red-500 min-h-[32px] px-2 rounded">
            Report
          </button>
        )}
      </div>

      {showReport && (
        <form onSubmit={handleReport} className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-2">
          <select value={reportReason} onChange={e => setReportReason(e.target.value)} className="input-luxe text-xs w-full">
            <option value="spam">Spam</option>
            <option value="fake">Fake Review</option>
            <option value="abusive">Abusive</option>
            <option value="offensive">Offensive</option>
            <option value="other">Other</option>
          </select>
          <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} placeholder="Additional details..." className="input-luxe text-xs h-16 w-full" />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs px-3 py-1 min-h-[36px]">Submit Report</button>
            <button type="button" onClick={() => setShowReport(false)} className="text-xs text-gray-500 min-h-[36px] px-3">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewCard;
