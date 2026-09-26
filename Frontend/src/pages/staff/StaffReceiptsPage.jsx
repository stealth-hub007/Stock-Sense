import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffReceiptsPage = () => {
  const { receipts, confirmReceipt } = useInventory();
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receivedQtyInput, setReceivedQtyInput] = useState(0);
  const [receivedDock, setReceivedDock] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'RECEIVED'
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const filteredReceipts = (receipts || []).filter((r) => {
    const matchesFilter = activeFilter === 'ALL' || r.status === activeFilter;
    const matchesSearch =
      r.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openReceiveModal = (receipt) => {
    setSelectedReceipt(receipt);
    setReceivedQtyInput(receipt.expectedQty);
    setReceivedDock(receipt.dock || 'Bay 01 - Receiving');
  };

  const handleConfirmReceive = (e) => {
    e.preventDefault();
    if (!selectedReceipt) return;

    const qty = parseInt(receivedQtyInput, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid positive quantity to receive.');
      return;
    }

    confirmReceipt(selectedReceipt.poNumber, qty, 'Alex Rivera (Staff)');
    showToast(`✓ Received +${qty} units of ${selectedReceipt.sku} at ${receivedDock}! Stock updated.`);
    setSelectedReceipt(null);
  };

  return (
    <div style={{ padding: 'var(--ss-space-5)', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 1100,
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--ss-bg-surface-elevated)',
            border: '1px solid var(--ss-success)',
            borderRadius: 'var(--ss-radius-md)',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-success)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
              Inbound Receiving & Putaway
            </h1>
            <span className="ss-badge ss-badge-info">FLOOR RECEIVING</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Inspect incoming supplier shipments, verify physical quantities, and intake stock into the active facility.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            type="button"
            className={`ss-btn ${activeFilter === 'ALL' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => setActiveFilter('ALL')}
          >
            All Receipts
          </button>
          <button
            type="button"
            className={`ss-btn ${activeFilter === 'PENDING' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => setActiveFilter('PENDING')}
          >
            Pending Only ({(receipts || []).filter((r) => r.status === 'PENDING').length})
          </button>
          <button
            type="button"
            className={`ss-btn ${activeFilter === 'RECEIVED' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => setActiveFilter('RECEIVED')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="ss-input"
          placeholder="Search by PO Number, Supplier, SKU, or Product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Receipts Table / Cards */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>PO NUMBER</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>SUPPLIER</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>PRODUCT & SKU</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>DOCK ASSIGNMENT</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>EXPECTED QTY</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((r) => {
                const isPending = r.status === 'PENDING';

                return (
                  <tr
                    key={r.id || r.poNumber}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      backgroundColor: isPending ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {r.poNumber}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {r.createdAt || 'Today'}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                        {r.supplier || 'Industrial Supplier Co'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        Carrier: {r.carrier || 'Standard Freight'}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                        {r.productName || r.sku}
                      </div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                        {r.sku}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--ss-font-mono)',
                          background: 'var(--ss-bg-app)',
                          border: '1px solid var(--ss-border)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--ss-radius-xs)',
                          color: 'var(--ss-text-secondary)',
                        }}
                      >
                        {r.dock || 'Bay 01 - Receiving'}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 700, fontSize: '0.9375rem' }}>
                      {r.status === 'RECEIVED' ? (
                        <span style={{ color: 'var(--ss-success)' }}>{r.receivedQty || r.expectedQty} units</span>
                      ) : (
                        <span>{r.expectedQty} units</span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isPending ? (
                        <span className="ss-badge ss-badge-warning">● PENDING INTAKE</span>
                      ) : (
                        <div>
                          <span className="ss-badge ss-badge-success">✓ RECEIVED</span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                            By {r.receivedBy || 'Staff'}
                          </div>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {isPending ? (
                        <button
                          type="button"
                          className="ss-btn ss-btn-primary"
                          onClick={() => openReceiveModal(r)}
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
                        >
                          Receive Goods →
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                    No inbound shipments found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: HIGH-SPEED OPERATIONAL RECEIVING DIALOG */}
      {selectedReceipt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--ss-modal-backdrop)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="ss-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem',
              borderRadius: 'var(--ss-radius-lg)',
              boxShadow: 'var(--ss-shadow-lg)',
              border: '1px solid var(--ss-border)',
              backgroundColor: 'var(--ss-bg-surface)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📥</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Confirm Goods Receipt
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', fontFamily: 'var(--ss-font-mono)' }}>
                    Order Ref: {selectedReceipt.poNumber}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Shipment Summary Panel */}
            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--ss-bg-app)',
                borderRadius: 'var(--ss-radius-md)',
                border: '1px solid var(--ss-border)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                {selectedReceipt.productName || selectedReceipt.sku}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)' }}>SKU: </span>
                  <strong style={{ fontFamily: 'var(--ss-font-mono)' }}>{selectedReceipt.sku}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)' }}>Supplier: </span>
                  <strong>{selectedReceipt.supplier || 'Industrial Supplier Co'}</strong>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmReceive} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Receiving Dock */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Receiving Dock / Unloading Bay
                </label>
                <select
                  className="ss-select"
                  value={receivedDock}
                  onChange={(e) => setReceivedDock(e.target.value)}
                >
                  <option value="Bay 01 - Receiving">Bay 01 - Receiving Dock</option>
                  <option value="Bay 02 - Inbound Freight">Bay 02 - Inbound Freight</option>
                  <option value="Bay 03 - Cross-Dock">Bay 03 - Cross-Dock Rapid Intake</option>
                </select>
              </div>

              {/* Physical Quantity Stepper (High-speed tap targets) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)' }}>
                    Confirmed Physical Quantity
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                    Expected: <strong>{selectedReceipt.expectedQty} units</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setReceivedQtyInput((prev) => Math.max(1, prev - 1))}
                    style={{ fontSize: '1.25rem', width: '42px', height: '42px', justifyContent: 'center', padding: 0 }}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={receivedQtyInput}
                    onChange={(e) => setReceivedQtyInput(parseInt(e.target.value, 10) || 0)}
                    style={{
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      fontFamily: 'var(--ss-font-mono)',
                      height: '42px',
                    }}
                    required
                  />

                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setReceivedQtyInput((prev) => prev + 1)}
                    style={{ fontSize: '1.25rem', width: '42px', height: '42px', justifyContent: 'center', padding: 0 }}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setReceivedQtyInput(selectedReceipt.expectedQty)}
                    style={{ fontSize: '0.75rem', padding: '0 0.75rem', height: '42px' }}
                    title="Match expected quantity"
                  >
                    Match Full ({selectedReceipt.expectedQty})
                  </button>
                </div>

                {/* Variance indicator */}
                {receivedQtyInput !== selectedReceipt.expectedQty && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: receivedQtyInput < selectedReceipt.expectedQty ? 'var(--ss-danger)' : 'var(--ss-warning)',
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ Quantity variance: {receivedQtyInput - selectedReceipt.expectedQty} units from expected PO
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setSelectedReceipt(null)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Confirm & Receive Goods
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReceiptsPage;
