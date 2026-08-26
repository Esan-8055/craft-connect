import React from 'react';
import './InvoiceModal.css';

export default function InvoiceModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  // Safe string coercion & tax breakdown
  const orderIdStr = String(order.id || '98210');
  const invoiceNumber = `INV-2026-${orderIdStr.replace('ORD-', '')}`;
  const totalAmount = Number(order.amount || 0);
  const taxableValue = Math.round(totalAmount / 1.18);
  const totalGst = totalAmount - taxableValue;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  return (
    <div className="invoice-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="invoice-card">
        {/* Action Header Bar */}
        <div className="invoice-action-bar">
          <span>🧾 Official GST Tax Invoice & Dispatch Slip</span>
          <div className="invoice-btn-group">
            <button type="button" onClick={handlePrint} className="print-btn-primary">
              🖨️ Print / Save PDF
            </button>
            <button type="button" onClick={onClose} className="close-btn-round" aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Printable Paper Content */}
        <div className="printable-invoice-paper">
          {/* Header */}
          <div className="invoice-paper-head">
            <div>
              <h1 className="invoice-brand-title">
                Craft<span>Connect</span>
              </h1>
              <span className="invoice-sub-badge">Authentic Indian Artisan Marketplace</span>
            </div>
            <div className="invoice-meta-col">
              <div className="invoice-number-tag">{invoiceNumber}</div>
              <div className="invoice-meta-date">Date: {order.date}</div>
              <div className="invoice-meta-date">Order ID: <strong>{order.id}</strong></div>
            </div>
          </div>

          {/* Supplier & Recipient Addresses */}
          <div className="invoice-parties-grid">
            <div className="party-box">
              <span className="party-box-title">Billed & Shipped From (Artisan Studio)</span>
              <div className="party-name">CraftConnect Heritage Artisan Studio</div>
              <div className="party-address">
                Craft Cluster Hub, Sector 4<br />
                Jaipur Craft Village, Rajasthan 302001<br />
                Phone: +91 1800 200 4050 · Email: studio@craftconnect.app
              </div>
              <div className="party-gstin">GSTIN: 08AAAAA0000A1Z2 (Rajasthan)</div>
            </div>

            <div className="party-box">
              <span className="party-box-title">Billed & Shipped To (Customer)</span>
              <div className="party-name">{order.customerName}</div>
              <div className="party-address">
                {order.shippingAddress}<br />
                Phone: {order.phone}<br />
                Email: {order.email}
              </div>
              <div className="party-gstin">Place of Supply: India</div>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Craft Product Description</th>
                <th style={{ width: '80px' }}>HSN/SAC</th>
                <th style={{ width: '50px' }}>Qty</th>
                <th style={{ width: '100px' }}>Rate (₹)</th>
                <th style={{ width: '110px' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div className="item-desc-cell">
                    <span className="item-desc-title">{order.productTitle}</span>
                    <span className="item-desc-hsn">Authentic Handmade Craft Item</span>
                  </div>
                </td>
                <td>691200</td>
                <td>{order.quantity}</td>
                <td>₹{Math.round(taxableValue / (order.quantity || 1)).toLocaleString('en-IN')}</td>
                <td>₹{taxableValue.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Financial Breakdown & Verification Stamp */}
          <div className="invoice-summary-section">
            <div className="payment-status-stamp">
              <span className="stamp-icon">🛡️</span>
              <div>
                <div className="stamp-title">Payment Verified & Paid</div>
                <div className="stamp-sub">
                  Method: Razorpay / UPI · Txn Ref: <code>pay_{orderIdStr.replace('ORD-', '982')}</code>
                </div>
                {order.trackingNumber && (
                  <div className="stamp-sub" style={{ marginTop: 4 }}>
                    Courier Tracking AWB: <strong>{order.trackingNumber}</strong>
                  </div>
                )}
              </div>
            </div>

            <div>
              <table className="totals-table">
                <tbody>
                  <tr>
                    <td>Taxable Amount:</td>
                    <td>₹{taxableValue.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>CGST (9%):</td>
                    <td>₹{cgst.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>SGST (9%):</td>
                    <td>₹{sgst.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Shipping & Handling:</td>
                    <td><span style={{ color: '#27AE60', fontWeight: 700 }}>FREE</span></td>
                  </tr>
                  <tr className="grand-total-row">
                    <td>Grand Total:</td>
                    <td>₹{totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Note */}
          <div className="invoice-paper-footer">
            <p><strong>Thank you for empowering Indian Heritage Artisans!</strong></p>
            <p>This is a computer-generated tax invoice issued by CraftConnect India under Section 31 of the CGST Act.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
