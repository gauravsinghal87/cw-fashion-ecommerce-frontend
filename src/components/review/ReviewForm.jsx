import { useState, useRef } from 'react';
import { post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const ReviewForm = ({ onSubmit, initialData, loading }) => {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(initialData?.isAnonymous || false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileUpload = async (files, type) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const f of files) formData.append('files', f);
      const { data } = await post(API.UPLOAD.BASE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const urls = data.files.map(f => f.url);
      if (type === 'image') setImages(prev => [...prev, ...urls]);
      else setVideos(prev => [...prev, ...urls]);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (url, type) => {
    if (type === 'image') setImages(prev => prev.filter(u => u !== url));
    else setVideos(prev => prev.filter(u => u !== url));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, title, comment, images, videos, isAnonymous });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl min-h-[44px] min-w-[44px] ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Summary of your review" maxLength={200} className="input-luxe text-sm" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Review *</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." className="input-luxe text-sm h-24" required />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Photos</label>
        <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={e => { handleFileUpload(e.target.files, 'image'); e.target.value = ''; }} className="hidden" />
        <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading} className="border border-dashed border-border rounded-lg p-4 w-full text-xs text-gray-400 hover:border-primary hover:text-primary transition-colors min-h-[44px]">
          {uploading ? 'Uploading...' : 'Click to upload photos'}
        </button>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-16 h-16 object-cover rounded border border-border" />
                <button type="button" onClick={() => removeFile(url, 'image')} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Videos</label>
        <input ref={videoInputRef} type="file" accept="video/*" multiple onChange={e => { handleFileUpload(e.target.files, 'video'); e.target.value = ''; }} className="hidden" />
        <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploading} className="border border-dashed border-border rounded-lg p-4 w-full text-xs text-gray-400 hover:border-primary hover:text-primary transition-colors min-h-[44px]">
          {uploading ? 'Uploading...' : 'Click to upload videos'}
        </button>
        {videos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {videos.map((url, i) => (
              <div key={i} className="relative group">
                <video src={url} className="w-20 h-16 object-cover rounded border border-border" />
                <button type="button" onClick={() => removeFile(url, 'video')} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="rounded" />
        Post anonymously
      </label>

      <Button type="submit" loading={loading || uploading} className="w-full sm:w-auto">
        {initialData ? 'Update Review' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
