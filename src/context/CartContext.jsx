import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createOrderAPI, getOrdersAPI, getPublishedProducts } from '../services/api';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// ─── Shared localStorage helper ───────────────────────────────────────────────
// ONE single key used by buyer My Orders + Seller Orders Received
const ORDERS_KEY = 'cc_real_orders_v2';

export function readStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStoredOrders(orders) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    // notify every tab (including current) via custom event
    window.dispatchEvent(new CustomEvent('cc_orders_updated', { detail: orders }));
  } catch (e) {
    console.warn('[CartContext] Failed to write orders to localStorage:', e);
  }
}
// ──────────────────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems]         = useState([]);
  const [myOrders, setMyOrders]           = useState([]);
  const [myLearning, setMyLearning]       = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const refreshOrders = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoadingOrders(true);
    }
    try {
      const responseData = await getOrdersAPI();
      // Handle both DRF paginated response { results: [...] } and raw arrays
      const backendList = Array.isArray(responseData)
        ? responseData
        : (responseData?.results || responseData?.data || []);

      if (Array.isArray(backendList) && backendList.length > 0) {
        const formattedBackend = backendList.map(o => {
          const rawId = o.id || Math.floor(1000 + Math.random() * 9000);
          
          // Format artisan name safely if nested detail is available
          let artisanName = 'CraftConnect Artisan Studio';
          const art = o.items?.[0]?.product_detail?.artisan_detail;
          if (art && (art.first_name || art.username)) {
            artisanName = art.first_name 
              ? `${art.first_name} ${art.last_name || ''}`.trim()
              : art.username;
          }

          return {
            id:              `ORD-${rawId}`,
            orderId:         `ORD-${rawId}`,
            customerName:    o.shipping_address ? 'Verified Buyer' : 'Craft Buyer',
            email:           'buyer@craftconnect.app',
            phone:           '+91 98765 43210',
            shippingAddress: o.shipping_address || 'Express Delivery, India',
            productTitle:    o.items?.[0]?.product_detail?.title || o.items?.[0]?.product_title || o.productTitle || 'Handcrafted Item',
            productImage:    o.items?.[0]?.product_detail?.image || o.items?.[0]?.product_detail?.image || o.productImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
            quantity:        o.items?.[0]?.quantity || 1,
            amount:          Number(o.total_amount || o.price || 500),
            date:            new Date(o.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status:          o.status || 'pending',
            trackingNumber:  o.tracking_number || '',
            paymentMethod:   'UPI',
            artisanName,
            _real:           true,
          };
        });

        setMyOrders(formattedBackend);

        // Sync backend orders into shared storage so SellerOrders sees them!
        const existingLocal = readStoredOrders();
        const merged = [...existingLocal];
        formattedBackend.forEach(bOrder => {
          if (!merged.some(m => String(m.id).replace('ORD-', '') === String(bOrder.id).replace('ORD-', ''))) {
            merged.push(bOrder);
          }
        });
        writeStoredOrders(merged);
      }
    } catch (e) {
      console.warn('[CartContext] Failed to refresh orders:', e);
    } finally {
      if (!isBackground) {
        setLoadingOrders(false);
      }
    }
  }, []);

  // Hydrate from backend on mount — only when user is logged in
  useEffect(() => {
    const token = localStorage.getItem('cc_access_token');
    if (token) {
      refreshOrders();
    }
  }, [refreshOrders]);

  // Self-healing migration: Automatically upload stuck local-only orders (e.g. from previous failed stock checkouts)
  useEffect(() => {
    const migrateOrders = async () => {
      const savedUser = localStorage.getItem('cc_user');
      if (!savedUser) return;

      const localOrders = readStoredOrders();
      // Stuck local orders have simulated ID like ORD-9xxxx
      const localOnly = localOrders.filter(o => o._real && String(o.id).startsWith('ORD-9'));
      if (localOnly.length === 0) return;

      console.log(`[Self-Healing] Found ${localOnly.length} local-only orders. Attempting backend migration...`);

      let updated = [...localOrders];
      let didSync = false;

      for (const order of localOnly) {
        try {
          let productId = 1;
          const products = await getPublishedProducts().catch(() => []);
          const match = products.find(p => p.title === order.productTitle);
          if (match) {
            productId = match.id;
          }

          const backendOrder = await createOrderAPI({
            shipping_address: order.shippingAddress || 'Standard Express Shipping',
            items: [{ product: productId, quantity: order.quantity || 1 }]
          });

          if (backendOrder && backendOrder.id) {
            console.log(`[Self-Healing] Migrated local order ${order.id} to backend order ORD-${backendOrder.id}`);
            updated = updated.map(item => {
              if (item.id === order.id) {
                return {
                  ...item,
                  id: `ORD-${backendOrder.id}`,
                  _real: true
                };
              }
              return item;
            });
            didSync = true;
          }
        } catch (e) {
          console.warn(`[Self-Healing] Migration failed for order ${order.id}:`, e?.message);
        }
      }

      if (didSync) {
        writeStoredOrders(updated);
        refreshOrders(true);
      }
    };

    const timer = setTimeout(migrateOrders, 2000);
    return () => clearTimeout(timer);
  }, [refreshOrders]);

  const addToCart = (item) => setCartItems(prev => {
    const existingIndex = prev.findIndex(i => String(i.id) === String(item.id));
    if (existingIndex > -1) {
      const updated = [...prev];
      const existing = updated[existingIndex];
      const addQty = item.quantity || 1;
      updated[existingIndex] = { ...existing, quantity: (existing.quantity || 1) + addQty };
      return updated;
    }
    return [...prev, { ...item, quantity: item.quantity || 1 }];
  });

  const updateQuantity = (id, newQty) => setCartItems(prev => {
    if (newQty <= 0) return prev.filter(i => String(i.id) !== String(id));
    return prev.map(i => String(i.id) === String(id) ? { ...i, quantity: newQty } : i);
  });

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => String(i.id) !== String(id)));

  const completeCheckout = async (paymentResult = null, directItems = null) => {
    // Support direct item array (e.g. Buy Now) or fallback to cartItems
    const targetItems      = (directItems && directItems.length > 0) ? directItems : cartItems;
    const physicalProducts = targetItems.filter(item => !item.lessonsCount);
    const digitalCourses   = targetItems.filter(item =>  item.lessonsCount);

    // Attempt backend order for numeric product IDs
    const orderItems = physicalProducts
      .filter(item => typeof item.id === 'number')
      .map(item => ({ product: item.id, quantity: item.quantity || 1 }));

    let backendOrder = null;
    if (orderItems.length > 0) {
      try {
        backendOrder = await createOrderAPI({
          shipping_address: 'Standard Express Shipping',
          items: orderItems,
        });
      } catch (err) {
        console.warn('[CartContext] Backend order fallback:', err?.message);
      }
    }

    const orderId = backendOrder
      ? `ORD-${backendOrder.id}`
      : `ORD-${Math.floor(70000 + Math.random() * 9000)}`; // 70000-79999: avoids ORD-9xxxx migration range
    const orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    // ── Physical items ────────────────────────────────────────────────────────
    if (physicalProducts.length > 0) {
      let savedUser = {};
      try { savedUser = JSON.parse(localStorage.getItem('cc_user') || '{}'); } catch {}

      const customerName = savedUser.first_name
        ? `${savedUser.first_name} ${savedUser.last_name || ''}`.trim()
        : (savedUser.username || 'Craft Buyer');
      const customerEmail   = savedUser.email   || 'buyer@craftconnect.app';
      const customerPhone   = savedUser.phone   || '+91 98765 43210';
      const customerAddress = savedUser.address || 'Indiranagar, Bengaluru, KA 560038';

      // Build one entry per cart line-item so seller sees each product
      const sharedEntries = physicalProducts.map((item, idx) => ({
        id:              idx === 0 ? orderId : `${orderId}-${idx}`,
        customerName,
        email:           customerEmail,
        phone:           customerPhone,
        shippingAddress: customerAddress,
        productTitle:    item.title  || item.name        || 'Craft Product',
        productImage:    item.image  || item.thumbnail   || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
        quantity:        item.quantity || 1,
        amount:          Number(item.price || 0) * (item.quantity || 1),
        date:            orderDate,
        status:          'pending',
        trackingNumber:  '',
        paymentMethod:   paymentResult?.method        || 'UPI',
        transactionId:   paymentResult?.transactionId || `TXN-${Date.now()}`,
        _real:           true,
      }));

      // ── Persist to localStorage (shared key read by SellerOrders) ──────────
      const existing = readStoredOrders();
      writeStoredOrders([...sharedEntries, ...existing]);

      // ── Also update buyer's in-memory state ──────────────────────────────
      const newOrders = physicalProducts.map(item => ({
        ...item,
        orderId,
        date:          orderDate,
        status:        'Processing',
        paymentTxn:    paymentResult?.transactionId || null,
        paymentMethod: paymentResult?.method        || 'UPI',
      }));
      setMyOrders(prev => [...newOrders, ...prev]);
    }

    // ── Digital courses ───────────────────────────────────────────────────────
    if (digitalCourses.length > 0) {
      setMyLearning(prev => [
        ...digitalCourses.map(c => ({
          ...c,
          progress:     0,
          enrolledDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        })),
        ...prev,
      ]);
    }

    setCartItems([]);
    return backendOrder;
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + Number(item.price || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity,
      totalPrice, cartCount: cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0),
      myOrders, myLearning, completeCheckout,
      loadingOrders, refreshOrders
    }}>
      {children}
    </CartContext.Provider>
  );
};