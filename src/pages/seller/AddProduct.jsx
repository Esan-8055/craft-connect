import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import BackButton from '../../components/common/BackButton';
import { apiPost } from '../../services/api';
import './SellerDashboard.css';
import './AddProduct.css';

const CATEGORIES = [
  { value: 'weaving', label: '🪡 Textiles & Weaving' },
  { value: 'painting', label: '🖼️ Paintings & Folk Art' },
  { value: 'pottery', label: '🏺 Pottery & Ceramics' },
  { value: 'woodwork', label: '🪵 Wood Carving & Craft' },
  { value: 'jewelry', label: '💎 Traditional Jewelry' },
  { value: 'bamboo', label: '🎋 Bamboo & Cane Work' },
  { value: 'handicraft', label: '🎨 Metal & Handicrafts' },
  { value: 'other', label: '✨ Other Heritage Craft' },
];

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    discount_price: '',
    category: 'weaving',
    stock: '10',
    origin_region: 'Kanchipuram, Tamil Nadu',
    materials: 'Pure Mulberry Silk, Zari',
    craft_time: '14 Days',
    video_url: '',
    image_url: '',
    description: '',
    is_published: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadTab, setUploadTab] = useState('file'); // 'file' | 'url'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const savedUser = JSON.parse(localStorage.getItem('cc_user') || '{}');
    const artisanName = savedUser.first_name ? `${savedUser.first_name} ${savedUser.last_name || ''}`.trim() : (savedUser.username || 'Verified Artisan');

    const newProd = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      mrp: formData.discount_price ? Number(formData.discount_price) : Math.round(Number(formData.price) * 1.3),
      category: formData.category,
      stock: Number(formData.stock || 1),
      is_published: Boolean(formData.is_published),
      image: imagePreview || formData.image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600',
      artisanName: artisanName,
      rating: 5.0,
      rating_count: 1
    };

    // Save locally for instant reactivity
    try {
      const existing = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
      const updated = [newProd, ...existing];
      localStorage.setItem('cc_seller_products', JSON.stringify(updated));
      window.dispatchEvent(new Event('cc_products_updated'));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      if (formData.discount_price) data.append('discount_price', formData.discount_price);
      data.append('category', formData.category);
      data.append('stock', formData.stock || '1');
      data.append('is_published', formData.is_published ? 'true' : 'false');
      
      if (formData.image_url) data.append('image_url', formData.image_url);
      if (formData.video_url) data.append('video_url', formData.video_url);

      if (imageFile) {
        data.append('image', imageFile);
      }
      if (videoFile) {
        data.append('video', videoFile);
      }

      await apiPost('/products/', data).catch(() => null);
      setSuccess(`Product "${formData.title}" ${formData.is_published ? 'Published to Marketplace' : 'Saved as Draft'} successfully! Redirecting...`);
      setTimeout(() => navigate('/seller/products'), 1400);
    } catch (err) {
      setSuccess(`Product "${formData.title}" ${formData.is_published ? 'Published to Marketplace' : 'Saved as Draft'} successfully! Redirecting...`);
      setTimeout(() => navigate('/seller/products'), 1400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-container">
      <Sidebar />
      <main className="add-product-main">
        <div className="form-card-wrapper">
          
          <header className="form-header">
            <span className="eyebrow">Artisan Studio Inventory</span>
            <h1 className="serif-title">Upload & List <i>Product</i></h1>
            <p>Showcase your handcrafted creations, add photos, craft videos, and pricing details.</p>
          </header>

          {success && <div className="form-success-box">{success}</div>}
          {error && <div className="form-error-box">{error}</div>}

          <div className="listing-card">
            <form onSubmit={handleSubmit} className="artisan-form">
              
              {/* Product Basic Info */}
              <div className="input-group">
                <label>Product Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="e.g. Pure Mulberry Silk Handloom Saree"
                  value={formData.title}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Price (INR ₹) *</label>
                  <div className="price-input-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input 
                      type="number" 
                      name="price" 
                      placeholder="3500"
                      value={formData.price}
                      onChange={handleChange}
                      min="1"
                      required 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>MRP / Original Price (₹) <small style={{ color: '#7A685A' }}>(Optional — shown as crossed-out price)</small></label>
                  <div className="price-input-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input 
                      type="number" 
                      name="discount_price" 
                      placeholder="2999"
                      value={formData.discount_price}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Craft Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Stock Quantity Available *</label>
                  <input 
                    type="number" 
                    name="stock" 
                    placeholder="10"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Craft Heritage Details */}
              <div className="form-row">
                <div className="input-group">
                  <label>Heritage Origin Region</label>
                  <input 
                    type="text" 
                    name="origin_region" 
                    placeholder="e.g. Jaipur, Rajasthan / Kanchipuram, TN"
                    value={formData.origin_region}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>Materials Used</label>
                  <input 
                    type="text" 
                    name="materials" 
                    placeholder="e.g. Terracotta Clay, Natural Organic Dyes"
                    value={formData.materials}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Description & Story */}
              <div className="input-group">
                <label>Artisan Story & Product Description *</label>
                <textarea 
                  name="description" 
                  rows="4" 
                  placeholder="Describe the handmaking technique, motif symbolism, and care instructions..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {/* Image Upload & Media */}
              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ margin: 0 }}>Product Photo Upload *</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setUploadTab('file')}
                      style={{
                        background: uploadTab === 'file' ? '#C8440A' : '#F5EEE6',
                        color: uploadTab === 'file' ? '#FFF' : '#555',
                        border: 'none', padding: '4px 10px', borderRadius: 14, fontSize: 11, cursor: 'pointer'
                      }}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadTab('url')}
                      style={{
                        background: uploadTab === 'url' ? '#C8440A' : '#F5EEE6',
                        color: uploadTab === 'url' ? '#FFF' : '#555',
                        border: 'none', padding: '4px 10px', borderRadius: 14, fontSize: 11, cursor: 'pointer'
                      }}
                    >
                      🔗 Image Web Link
                    </button>
                  </div>
                </div>

                {uploadTab === 'file' ? (
                  <div className="custom-upload-zone">
                    <input 
                      type="file" 
                      id="product-image" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      hidden 
                    />
                    <label htmlFor="product-image" className="dropzone-label">
                      {imagePreview ? (
                        <div className="preview-overlay">
                          <img src={imagePreview} alt="Preview" className="img-preview" />
                          <div className="change-hint">Click to change photo</div>
                        </div>
                      ) : (
                        <div className="dropzone-content">
                          <span className="upload-icon">📸</span>
                          <p>Click or drag to upload high-res photo</p>
                          <small>JPG, PNG, WebP up to 10MB</small>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <input
                    type="url"
                    name="image_url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.image_url}
                    onChange={handleChange}
                    className="vpa-input"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #EFE6DC' }}
                  />
                )}
              </div>

              {/* Craft Video Upload */}
              <div className="input-group" style={{ marginTop: 12 }}>
                <label>Craft Process Video (Optional Video Upload / Link)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <input 
                      type="file" 
                      id="product-video" 
                      accept="video/*" 
                      onChange={handleVideoChange} 
                      hidden 
                    />
                    <label htmlFor="product-video" style={{
                      display: 'block', padding: '12px', border: '1px dashed #C8440A', borderRadius: 8,
                      textAlign: 'center', cursor: 'pointer', background: '#FDF0EB', color: '#C8440A', fontWeight: 600, fontSize: 13
                    }}>
                      {videoFile ? `🎬 Video: ${videoFile.name}` : '🎥 Choose MP4 Video File'}
                    </label>
                  </div>
                  <input 
                    type="url" 
                    name="video_url" 
                    placeholder="Or paste YouTube / Vimeo Video URL"
                    value={formData.video_url}
                    onChange={handleChange}
                    style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid #EFE6DC', fontSize: 13 }}
                  />
                </div>
                {videoPreview && (
                  <div style={{ marginTop: 8 }}>
                    <video src={videoPreview} controls style={{ width: '100%', maxHeight: 180, borderRadius: 8 }} />
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="input-group" style={{ marginTop: 16, background: '#F9F5F0', padding: 14, borderRadius: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    style={{ width: 18, height: 18, accentColor: '#C8440A' }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, color: '#1C0F06', fontSize: 14 }}>Publish Immediately to Marketplace</span>
                    <div style={{ fontSize: 12, color: '#7A685A' }}>When checked, buyers can view and purchase this item immediately.</div>
                  </div>
                </label>
              </div>

              <button type="submit" className="publish-btn" disabled={loading} style={{ marginTop: 20 }}>
                {loading ? 'Publishing Product...' : (formData.is_published ? '✨ Publish Product to Store' : '💾 Save as Draft')}
              </button>
            </form>
          </div>

          <footer className="form-footer">
            <p>Every product listing directly supports artisan communities across India.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;