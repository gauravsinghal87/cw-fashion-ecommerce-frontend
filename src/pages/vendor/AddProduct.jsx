import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const videoFileInput = useRef(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [images, setImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [videos, setVideos] = useState([]);
  const [pendingVideo, setPendingVideo] = useState(null);
  const [pendingVideoPreview, setPendingVideoPreview] = useState(null);
  const [embedUrl, setEmbedUrl] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', category: '', subCategory: '', brand: '',
    productType: 'simple', mrp: '', price: '', stock: '', sku: '',
    tags: '', weight: '',
    variants: [],
  });
  const [errors, setErrors] = useState({});
  const originalStatus = useRef(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      if (pendingVideoPreview) URL.revokeObjectURL(pendingVideoPreview);
    };
  }, [previewUrls, pendingVideoPreview]);

  useEffect(() => {
    Promise.all([
      get(API.CATEGORIES.BASE),
      get(API.BRANDS.BASE),
    ]).then(([c, b]) => {
      setCategories(c.data.categories || []);
      setBrands(b.data.brands || []);
    }).catch(() => {});
    if (id) {
      get(API.PRODUCTS.DETAIL(id)).then(({ data }) => {
        const p = data.product;
        originalStatus.current = p.status;
        const v0 = p.variants?.[0] || {};
        setForm({
          title: p.title, description: p.description, category: p.category?._id || '', subCategory: p.subCategory?._id || '',
          brand: p.brand?._id || '', productType: p.productType,
          mrp: v0.mrp || p.maxPrice || '',
          price: v0.price || p.minPrice || '',
          stock: v0.stock || p.totalStock || '',
          sku: v0.sku || '',
          tags: p.tags?.join(', ') || '',
          weight: p.weight || v0.weight || '',
          variants: p.variants || [],
        });
        if (p.images?.length) setImages(p.images);
        if (p.videos?.length) setVideos(p.videos);
      }).catch(() => toast.error('Failed to load product data'));
    }
  }, [id]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPendingFiles(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    if (fileInput.current) fileInput.current.value = '';
  };

  const removePendingImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = async (publicId) => {
    try {
      await del(API.UPLOAD.DELETE(publicId));
    } catch {}
    setImages(prev => prev.filter(img => img.publicId !== publicId));
  };

  const setPrimary = (publicId) => {
    setImages(prev => prev.map(img => ({ ...img, isPrimary: img.publicId === publicId })));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (pendingVideoPreview) URL.revokeObjectURL(pendingVideoPreview);
    setPendingVideo(file);
    setPendingVideoPreview(URL.createObjectURL(file));
    if (videoFileInput.current) videoFileInput.current.value = '';
  };

  const removePendingVideo = () => {
    if (pendingVideoPreview) URL.revokeObjectURL(pendingVideoPreview);
    setPendingVideo(null);
    setPendingVideoPreview(null);
  };

  const removeUploadedVideo = async (publicId) => {
    try {
      await del(API.UPLOAD.DELETE(publicId));
    } catch {}
    setVideos(prev => prev.filter(v => v.publicId !== publicId));
  };

  const addEmbedVideo = () => {
    if (!embedUrl.trim()) return;
    let videoId = '';
    let type = 'youtube';
    if (embedUrl.includes('youtube.com/watch?v=') || embedUrl.includes('youtu.be/')) {
      const match = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      videoId = match ? match[1] : '';
    } else if (embedUrl.includes('vimeo.com/')) {
      const match = embedUrl.match(/vimeo\.com\/(\d+)/);
      videoId = match ? match[1] : '';
      type = 'vimeo';
    }
    if (videoId) {
      if (videos.some(v => v.publicId === videoId)) {
        toast.error('This video is already added');
        return;
      }
      setVideos(prev => [...prev, { url: embedUrl, publicId: videoId, type }]);
      setEmbedUrl('');
      toast.success(`${type === 'vimeo' ? 'Vimeo' : 'YouTube'} video added`);
    } else {
      toast.error('Invalid YouTube or Vimeo URL');
    }
  };

  const removeEmbedVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    const idx = form.variants.length;
    setForm({ ...form, variants: [...form.variants, { color: '', size: '', price: '', mrp: '', stock: '', sku: `SKU-${Date.now().toString(36)}-${idx}`, weight: '' }] });
  };

  const updateVariant = (index, field, value) => {
    const variants = [...form.variants];
    variants[index][field] = value;
    setForm({ ...form, variants });
  };

  const removeVariant = (index) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.price) newErrors.price = 'Price is required';
    else if (isNaN(form.price) || Number(form.price) <= 0) newErrors.price = 'Enter a valid price';
    if (form.stock && (isNaN(form.stock) || Number(form.stock) < 0)) newErrors.stock = 'Stock cannot be negative';
    if (images.length === 0 && pendingFiles.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadPendingFiles = async () => {
    if (pendingFiles.length === 0 && !pendingVideo) return { uploadedImages: [], uploadedVideos: [] };
    setUploading(true);
    try {
      const formData = new FormData();
      pendingFiles.forEach(f => formData.append('files', f));
      if (pendingVideo) formData.append('files', pendingVideo);
      const { data } = await post(API.UPLOAD.BASE, formData);
      if (data.success) {
        const uploadedImages = data.files.filter(f => f.mimeType?.startsWith('image/'));
        const uploadedVideos = data.files.filter(f => f.mimeType?.startsWith('video/')).map(v => ({ url: v.url, publicId: v.publicId, type: 'upload' }));
        setImages(prev => [...prev, ...uploadedImages]);
        setVideos(prev => [...prev, ...uploadedVideos]);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPendingFiles([]);
        setPreviewUrls([]);
        if (pendingVideoPreview) URL.revokeObjectURL(pendingVideoPreview);
        setPendingVideo(null);
        setPendingVideoPreview(null);
        return { uploadedImages, uploadedVideos };
      }
      return { uploadedImages: [], uploadedVideos: [] };
    } catch (err) {
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const uploadVariantImages = async (variants) => {
    const variantFiles = [];
    variants.forEach((v, i) => {
      (v.pendingVariantFiles || []).forEach(f => {
        variantFiles.push({ file: f, variantIndex: i });
      });
    });
    if (variantFiles.length === 0) return variants;
    const formData = new FormData();
    variantFiles.forEach(({ file }) => formData.append('files', file));
    const { data } = await post(API.UPLOAD.BASE, formData);
    const uploaded = data.files?.filter(f => f.mimeType?.startsWith('image/')) || [];
    return variants.map((v, i) => {
      const imgs = uploaded.filter((_, vi) => variantFiles[vi]?.variantIndex === i);
      const existingImages = v.images || [];
      if (imgs.length === 0) return { ...v };
      return {
        ...v,
        images: [...existingImages, ...imgs.map(img => ({ url: img.url, publicId: img.publicId }))],
      };
    });
  };

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let extraImages = [], extraVideos = [];
      if (pendingFiles.length > 0 || pendingVideo) {
        const result = await uploadPendingFiles();
        extraImages = result.uploadedImages || [];
        extraVideos = result.uploadedVideos || [];
      }
      const allImages = [...images, ...extraImages];
      const allVideos = [...videos, ...extraVideos];
      const hasVariants = form.variants.length > 0;

      let finalVariants = [];
      if (hasVariants) {
        let mappedVariants = form.variants.map((v, vi) => {
          const { pendingVariantFiles, pendingVariantImages, ...clean } = v;
          return {
            ...clean,
            sku: clean.sku || `SKU-${Date.now().toString(36)}-${vi}`,
            price: Number(clean.price), mrp: Number(clean.mrp), stock: Number(clean.stock), availableStock: Number(clean.stock),
            weight: clean.weight ? Number(clean.weight) : undefined,
          };
        });
        if (form.variants.some(v => (v.pendingVariantFiles?.length || 0) > 0)) {
          const uploadedVariants = await uploadVariantImages(form.variants);
          mappedVariants = mappedVariants.map((v, i) => ({
            ...v,
            images: [...(v.images || []), ...(uploadedVariants[i]?.images?.filter(img => img?.url) || [])],
          }));
        }
        finalVariants = mappedVariants;
      }

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        subCategory: form.subCategory || undefined,
        brand: form.brand || undefined,
        productType: hasVariants ? 'variant' : 'simple',
        price: hasVariants ? undefined : Number(form.price),
        stock: hasVariants ? undefined : form.stock ? Number(form.stock) : undefined,
        status: id ? (status === 'draft' ? 'draft' : (originalStatus.current || status)) : (status || 'pending'),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        weight: form.weight ? Number(form.weight) : undefined,
        images: allImages.map(img => ({ url: img.url, publicId: img.publicId, isPrimary: img.isPrimary || false })),
        videos: allVideos.map(v => ({ url: v.url, publicId: v.publicId, type: v.type })),
        variants: hasVariants ? finalVariants : [{
          sku: form.sku || `SKU-${Date.now()}`,
          price: Number(form.price), mrp: Number(form.mrp), stock: Number(form.stock), availableStock: Number(form.stock),
          weight: form.weight ? Number(form.weight) : undefined,
        }],
      };
      if (id) {
        await put(API.PRODUCTS.DETAIL(id), payload);
        toast.success('Product updated');
      } else {
        await post(API.PRODUCTS.BASE, payload);
        toast.success('Product created');
      }
      navigate('/vendor/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">{id ? 'Edit Product' : 'Add Product'}</h1>
      <form onSubmit={(e) => handleSubmit(e, 'pending')} className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
              <select value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]">
                <option value="">None</option>
                {categories.find(c => c._id === form.category)?.subCategories?.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]">
                <option value="">Select brand</option>
                {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-luxe text-sm w-full h-28 min-h-[44px]" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider">Product Images</h3>
          {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.publicId} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-gray-50">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeUploadedImage(img.publicId)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                {!img.isPrimary && <button type="button" onClick={() => setPrimary(img.publicId)} className="absolute bottom-1 left-1 text-[10px] bg-white/90 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-600">Set Primary</button>}
                {img.isPrimary && <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded">Primary</span>}
              </div>
            ))}
            {previewUrls.map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-blue-300 bg-blue-50">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePendingImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                <span className="absolute bottom-1 left-1 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">New</span>
              </div>
            ))}
            <label className="aspect-square flex items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary text-gray-400 text-sm min-h-[44px] hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center gap-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px]">Add Images</span>
              </div>
              <input ref={fileInput} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider">Product Videos</h3>
          {(videos.length > 0 || pendingVideo) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {videos.map((v, i) => (
                <div key={v.publicId || i} className="relative group rounded-lg overflow-hidden border border-border bg-gray-50">
                  {v.type === 'upload' ? (
                    <video src={v.url} className="w-full aspect-video object-cover" controls />
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">{v.type}</span>
                    <button type="button" onClick={() => removeEmbedVideo(i)} className="text-[10px] text-red-500 hover:text-red-700">Remove</button>
                  </div>
                </div>
              ))}
              {pendingVideo && (
                <div className="relative group rounded-lg overflow-hidden border border-blue-300 bg-blue-50">
                  <video src={pendingVideoPreview} className="w-full aspect-video object-cover" controls />
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-[10px] text-blue-500 uppercase">New</span>
                    <button type="button" onClick={removePendingVideo} className="text-[10px] text-red-500 hover:text-red-700">Remove</button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-dashed border-border rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Upload video file (MP4, MOV)</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary border border-primary rounded-lg cursor-pointer hover:bg-primary/5 min-h-[44px]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {pendingVideo ? 'Change video' : 'Choose video'}
                <input ref={videoFileInput} type="file" accept="video/mp4,video/quicktime" onChange={handleVideoSelect} className="hidden" />
              </label>
            </div>
            <div className="border border-dashed border-border rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Or embed from YouTube / Vimeo</p>
              <div className="flex gap-2">
                <input value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="input-luxe text-sm flex-1 min-h-[44px]" />
                <button type="button" onClick={addEmbedVideo} className="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5 whitespace-nowrap min-h-[44px]">Add</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">MRP</label><input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" />{errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" />{errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight (g)</label><input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider">Tags</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. organic, handcrafted, eco-friendly" className="input-luxe text-sm w-full min-h-[44px]" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wider">Variants (Color + Size)</h3>
            <button type="button" onClick={addVariant} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">+ Add Variant</button>
          </div>
          {form.variants.map((v, i) => (
            <div key={i} className="p-3 sm:p-4 bg-gray-50 border border-border space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 items-end">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-gray-500">Color</label>
                  <div className="flex gap-2 items-center">
                    <input value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="e.g. Red" className="input-luxe text-xs w-full min-h-[44px]" />
                    {v.color && <span className="w-7 h-7 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: v.color.toLowerCase() }} />}
                  </div>
                </div>
                <div><label className="text-xs text-gray-500">Size</label><input value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} placeholder="e.g. M" className="input-luxe text-xs w-full min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">MRP</label><input type="number" value={v.mrp} onChange={(e) => updateVariant(i, 'mrp', e.target.value)} className="input-luxe text-xs w-full min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">Price</label><input type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="input-luxe text-xs w-full min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">Stock</label><input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} className="input-luxe text-xs w-full min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">Weight (g)</label><input type="number" value={v.weight} onChange={(e) => updateVariant(i, 'weight', e.target.value)} className="input-luxe text-xs w-full min-h-[44px]" /></div>
                <button type="button" onClick={() => removeVariant(i)} className="text-xs sm:text-sm text-danger hover:underline min-h-[44px] flex items-center self-end pb-0.5">Remove</button>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Variant Image (shown when color is selected)</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {v.images?.map((img, imgIdx) => (
                    <div key={img.publicId || imgIdx} className="relative w-14 h-14 rounded border border-border overflow-hidden group">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => {
                        const updated = [...form.variants];
                        updated[i].images = updated[i].images.filter((_, j) => j !== imgIdx);
                        setForm({ ...form, variants: updated });
                      }} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100">&times;</button>
                    </div>
                  ))}
                  {v.pendingVariantImages?.map((url, imgIdx) => (
                    <div key={url} className="relative w-14 h-14 rounded border border-blue-300 bg-blue-50 overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => {
                        const updated = [...form.variants];
                        URL.revokeObjectURL(updated[i].pendingVariantImages[imgIdx]);
                        updated[i].pendingVariantImages = updated[i].pendingVariantImages.filter((_, j) => j !== imgIdx);
                        setForm({ ...form, variants: updated });
                      }} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500/80 text-white rounded-full text-[8px] flex items-center justify-center">&times;</button>
                    </div>
                  ))}
                  <label className="w-14 h-14 flex items-center justify-center border-2 border-dashed border-border rounded cursor-pointer hover:border-primary text-gray-400 hover:bg-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      const updated = [...form.variants];
                      if (!updated[i].pendingVariantFiles) updated[i].pendingVariantFiles = [];
                      if (!updated[i].pendingVariantImages) updated[i].pendingVariantImages = [];
                      updated[i].pendingVariantFiles.push(file);
                      updated[i].pendingVariantImages.push(url);
                      setForm({ ...form, variants: updated });
                      e.target.value = '';
                    }} />
                  </label>
                </div>
              </div>
            </div>
          ))}
          {form.variants.length === 0 && <p className="text-xs text-gray-400">Add variants for products with color/size options</p>}
        </div>

        <div className="flex-col sm:flex-row gap-2 sm:gap-3 flex">
          <Button type="button" onClick={(e) => handleSubmit(e, 'draft')} loading={loading || uploading} className="w-full sm:w-auto">Save as Draft</Button>
          <Button type="submit" loading={loading || uploading} className="w-full sm:w-auto">Submit for Approval</Button>
          <button type="button" onClick={() => navigate('/vendor/products')} className="w-full sm:w-auto px-6 py-2.5 text-sm border border-border hover:bg-gray-50 min-h-[44px]">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
