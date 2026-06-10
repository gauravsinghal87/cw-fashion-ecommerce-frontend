import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { get, del, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import ReviewForm from '../../components/review/ReviewForm';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setReviews([]);
    setPage(1);
    setHasMore(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchReviews = async () => {
      loadingRef.current = true;
      if (page === 1) setLoading(true);
      try {
        const { data } = await get(API.REVIEWS.MY, { page, limit: 20 });
        if (cancelled) return;
        setReviews(prev => page === 1 ? (data.reviews || []) : [...prev, ...(data.reviews || [])]);
        setHasMore(page < (data.pagination?.totalPages || 1));
      } catch { toast.error('Failed to load reviews'); }
      finally {
        if (!cancelled) { loadingRef.current = false; setLoading(false); }
      }
    };
    fetchReviews();
    return () => { cancelled = true; };
  }, [page]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          loadingRef.current = true;
          setPage(p => p + 1);
        }
      },
      { rootMargin: '200px' }
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const refresh = () => {
    setReviews([]);
    setPage(1);
    setHasMore(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await del(API.REVIEWS.DELETE(id));
      toast.success('Review deleted');
      refresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleEdit = async (formData) => {
    setSaving(true);
    try {
      await put(API.REVIEWS.UPDATE(editingReview._id), formData);
      toast.success('Review updated');
      setEditingReview(null);
      refresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const canEdit = (review) => {
    const days = (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
  };

  if (loading && reviews.length === 0) return <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton" />)}</div></div>;

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-4 sm:mb-6">My Reviews</h1>

      {reviews.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't written any reviews yet</p>
          <Link to="/products" className="btn-primary text-sm">Browse Products</Link>
        </div>
      ) : reviews.length > 0 ? (
        <>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="card-luxe p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  {r.product?.images?.[0]?.url ? (
                    <img src={r.product.images[0].url} alt="" className="w-12 h-16 object-cover border flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-16 bg-gray-100 border flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${r.product?._id}`} className="text-sm font-medium hover:text-primary line-clamp-1 block">{r.product?.title || 'Product'}</Link>
                    <div className="flex items-center gap-1 my-1 flex-wrap">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                        r.status === 'approved' ? 'text-green-600 bg-green-50' :
                        r.status === 'rejected' ? 'text-red-600 bg-red-50' :
                        r.status === 'hidden' ? 'text-gray-500 bg-gray-50' :
                        'text-yellow-600 bg-yellow-50'
                      }`}>{r.status}</span>
                    </div>
                    {r.title && <p className="text-sm font-medium">{r.title}</p>}
                    {r.comment && <p className="text-sm text-gray-600 break-words">{r.comment}</p>}
                    {r.images?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {r.images.map((img, i) => <img key={i} src={img} alt="" className="w-10 h-10 object-cover rounded border" />)}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(r.createdAt)}</p>
                    <div className="flex gap-2 mt-2">
                      {canEdit(r) && r.status !== 'hidden' && (
                        <button onClick={() => setEditingReview(r)} className="text-xs text-primary border border-primary px-2.5 py-1.5 min-h-[32px] rounded hover:bg-primary hover:text-white">Edit</button>
                      )}
                      <button onClick={() => handleDelete(r._id)} className="text-xs text-red-600 border border-red-600 px-2.5 py-1.5 min-h-[32px] rounded hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {loading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
          {hasMore && <div ref={sentinelRef} className="h-4" />}
          {!hasMore && reviews.length > 0 && <p className="text-center text-xs text-gray-400 py-6">All reviews loaded</p>}
        </>
      ) : null}

      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4" onClick={() => setEditingReview(null)}>
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-2 sm:mx-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm sm:text-base">Edit Review</h3>
              <button onClick={() => setEditingReview(null)} className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center text-xl flex-shrink-0">&times;</button>
            </div>
            <ReviewForm onSubmit={handleEdit} initialData={editingReview} loading={saving} />
            {!canEdit(editingReview) && <p className="text-xs text-red-500 mt-2">Cannot edit review after 30 days</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;
