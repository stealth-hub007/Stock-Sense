import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffTransfersPage = () => {
  const { transfers, executeTransfer } = useInventory();
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [scannedBinConfirmed, setScannedBinConfirmed] = useState(true);
  const [activeFilter, setActiveFilter] = useState('SCHEDULED'); // 'SCHEDULED' | 'ALL' | 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredTransfers = (transfers || []).filter((t) => {
    const matchesFilter = activeFilter === 'ALL' || t.status === activeFilter;
    const matchesSearch =
      t.transferNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toLocation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleConfirmMovement = (e) => {
    e.preventDefault();
    if (!selectedTransfer) return;

    executeTransfer(selectedTransfer.transferNo, 'Alex Rivera (Staff)');
    showToast(`✓ Movement confirmed! Relocated ${selectedTransfer.qty} units of ${selectedTransfer.sku} to ${selectedTransfer.toLocation}.`);
    setSelectedTransfer(null);
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
              Internal Transfers & Bin Relocation
            </h1>
            <span className="ss-badge ss-badge-success">FLOOR MOVEMENT</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Execute scheduled physical inventory shifts between docks, buffer racks, and picking shelves.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            type="button"
            className={`ss-btn ${activeFilter === 'SCHEDULED' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => setActiveFilter('SCHEDULED')}
          >
            Pending Movements ({(transfers || []).filter((t) => t.status === 'SCHEDULED').length})
          </button>
          <button
            type="button"
            className={`ss-btn ${activeFilter === 'ALL' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => setActiveFilter('ALL')}
          >
            All Transfers
          </button>
          <button
            type="button"
            className={`ss-btn ${activeFilter === 'COMPLETED' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => setActiveFilter('COMPLETED')}
          >
            Completed History
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="ss-input"
          placeholder="Filter transfers by Transfer #, SKU, Product, or Location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Transfers Cards / Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredTransfers.map((t) => {
          const isPending = t.status === 'SCHEDULED';

          return (
            <div
              key={t.id || t.transferNo}
              className="ss-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                border: '1px solid var(--ss-border)',
                borderTop: isPending ? '4px solid var(--ss-success)' : '4px solid var(--ss-border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                    {t.transferNo}
                  </span>
                  <span className={`ss-badge ${isPending ? 'ss-badge-warning' : 'ss-badge-success'}`}>
                    {isPending ? '⏳ SCHEDULED' : '✓ COMPLETED'}
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                  {t.productName || t.sku}
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '2px' }}>
                  SKU: {t.sku}
                </div>

                {/* VISUAL SOURCE TO DESTINATION PATH */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--ss-bg-app)',
                    border: '1px solid var(--ss-border)',
                    borderRadius: 'var(--ss-radius-md)',
                    marginTop: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                        SOURCE (FROM)
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-danger-text)', fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                        {t.fromLocation}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {t.fromWarehouse || 'Origin'}
                      </div>
                    </div>

                    <div style={{ fontSize: '1.25rem', color: 'var(--ss-text-muted)', fontWeight: 800 }}>
                      ➔
                    </div>

                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                        DESTINATION (TO)
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-success-text)', fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                        {t.toLocation}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {t.toWarehouse || 'Target'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Movement Quantity:</span>
                    <strong style={{ fontSize: '1.125rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                      {t.qty} units
                    </strong>
                  </div>
                </div>

                {t.reason && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
                    Reason: {t.reason}
                  </div>
                )}
              </div>

              {/* Action Button */}
              {isPending ? (
                <button
                  type="button"
                  className="ss-btn ss-btn-primary"
                  onClick={() => setSelectedTransfer(t)}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.625rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  ✓ Confirm Movement ({t.qty} units)
                </button>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', textAlign: 'center' }}>
                  ✓ Shift completed {t.completedAt || 'earlier'}
                </div>
              )}
            </div>
          );
        })}

        {filteredTransfers.length === 0 && (
          <div
            className="ss-card"
            style={{ gridColumn: '1 / -1', padding: '3rem 1rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}
          >
            <span style={{ fontSize: '2.5rem' }}>⇄</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.5rem' }}>
              No Transfer Tasks in View
            </div>
            <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              All scheduled physical bin shifts are up to date.
            </p>
          </div>
        )}
      </div>

      {/* CONFIRM MOVEMENT DIALOG */}
      {selectedTransfer && (
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
              maxWidth: '500px',
              padding: '1.75rem',
              borderRadius: 'var(--ss-radius-lg)',
              backgroundColor: 'var(--ss-bg-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⇄</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Execute Physical Relocation
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', fontFamily: 'var(--ss-font-mono)' }}>
                    Ref: {selectedTransfer.transferNo}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTransfer(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0.875rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                {selectedTransfer.productName || selectedTransfer.sku}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                SKU: <strong style={{ fontFamily: 'var(--ss-font-mono)' }}>{selectedTransfer.sku}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border-subtle)', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)' }}>From: </span>
                  <strong style={{ color: 'var(--ss-danger-text)' }}>{selectedTransfer.fromLocation}</strong>
                </div>
                <div>➔</div>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)' }}>To: </span>
                  <strong style={{ color: 'var(--ss-success-text)' }}>{selectedTransfer.toLocation}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmMovement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={scannedBinConfirmed}
                  onChange={(e) => setScannedBinConfirmed(e.target.checked)}
                />
                <span>I have physically placed <strong>{selectedTransfer.qty} units</strong> into bin <strong>{selectedTransfer.toLocation}</strong>.</span>
              </label>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setSelectedTransfer(null)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!scannedBinConfirmed}
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTransfersPage;
