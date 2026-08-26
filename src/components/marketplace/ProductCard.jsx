import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const name     = product.title || product.name;
  const artisan  = product.artisan_detail
    ? `${product.artisan_detail.first_name} ${product.artisan_detail.last_name}`.trim()
    : product.artisanName || 'Verified Artisan';
  const price    = Number(product.price);
  const mrp      = product.mrp || Math.round(price * 1.38);
  const discount = Math.round((1 - price / mrp) * 100);
  const category = product.category || 'Handcraft';
  const image    = product.image || '';
  const rating   = Number(product.rating) || 4.3;
  // Stable seed based on product.id — no flicker on re-renders
  const ratingCount = useMemo(
    () => product.rating_count || (((Number(product.id) * 37 + 13) % 560) + 40),
    [product.id, product.rating_count]
  );
  const fallback = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600';

  const onAddCart = (e) => {
    e.stopPropagation();
    addToCart({ ...product, name, artisanName: artisan });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  const onWishlist = (e) => {
    e.stopPropagation();
    setWishlisted(w => !w);
  };

  return (
    <article className="cc-art-card" onClick={() => navigate(`/product/${product.id}`)}>
      {/* Image */}
      <div className="cc-art-card-img-wrap">
        <img
          src={image || fallback}
          alt={name}
          className="cc-art-card-img"
          onError={e => { e.target.src = fallback; }}
        />
        {discount >= 5 && <span className="cc-art-disc-ribbon">{discount}% off</span>}
        <button className={`cc-art-wish-btn ${wishlisted ? 'active' : ''}`} onClick={onWishlist}>
          {wishlisted ? '♥' : '♡'}
        </button>
      </div>

      {/* Body */}
      <div className="cc-art-card-body">
        <span className="cc-art-category">{category}</span>
        <h3 className="cc-art-name">{name}</h3>
        <p className="cc-art-artisan">by {artisan}</p>

        {/* Rating */}
        <div className="cc-art-rating-row">
          <span className="cc-rating-chip"><span className="star">★</span> {rating.toFixed(1)}</span>
          <span className="cc-art-count">({ratingCount})</span>
        </div>

        {/* Price */}
        <div className="cc-art-price-row">
          <span className="cc-art-price">₹{price.toLocaleString('en-IN')}</span>
          {discount >= 5 && <span className="cc-art-mrp">₹{mrp.toLocaleString('en-IN')}</span>}
        </div>

        <p className="cc-art-delivery">🚚 Free delivery</p>

        <button className={`cc-art-add-btn ${isAdded ? 'added' : ''}`} onClick={onAddCart}>
          {isAdded ? '✓ Added to Bag' : 'Add to Bag'}
        </button>
      </div>
    </article>
  );
}