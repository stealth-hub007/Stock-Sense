import React, { useState } from 'react';
import { INITIAL_LEDGER } from '../../services/mockData';

export const StockLedgerPage = () => {
  const [ledgerEntries, setLedgerEntries] = useState(INITIAL_LEDGER);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportNotice, setExportNotice] = useState(null);

  const filteredEntries = ledgerEntries.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    setExportNotice('Exporting verified double-entry audit bundle (CSV)... File prepared.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1680px', margin: '0 auto', width: '100%' }}>
      {/* Export Toast */}
      {exportNotice && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            background: 'var(--ss-bg-surface-elevated)',
            border: '1px solid var(--ss-success)',
            borderRadius: 'var(--ss-radius-md)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-text-primary)',
          }}
        >
          <span style={{ color: 'var(--ss-success)', fontSize: '1.25rem' }}>✓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-success)' }}>
              Audit Report Generated
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              {exportNotice}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 'var(--ss-space-5)',
          flexWrap: 'wrap',
          gap: 'var(--ss-space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--ss-text-primary)', letterSpacing: '-0.025em' }}>
              Master Stock Ledger & Audit Trail
            </h1>
            <span className="ss-badge ss-badge-success">LIFECYCLE: STAGE 5 (AUDIT PROOF)</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            The immutable single source of truth. Every receipt, relocation, dispatch, and adjustment timestamped with verified operator signatures.
          </p>
        </div>

        <button
          type="button"
          className="ss-btn ss-btn-secondary"
          onClick={handleExportCSV}
        >
          ⬇ Export Audit Bundle (CSV)
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-5)',
        }}
      >
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>TOTAL AUDIT EVENTS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
            1,842 Events
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>INBOUND RECEIPTS LOGGED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)' }}>
            +680 Units
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>OUTBOUND DISPATCHES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-danger-text)' }}>
            -415 Units
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>AUDIT PARITY ACCURACY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-info-text)' }}>
            99.98% Synced
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="ss-card"
        style={{
          padding: 'var(--ss-space-3) var(--ss-space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ss-space-3)',
          marginBottom: 'var(--ss-space-4)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 280px' }}>
          <input
            type="text"
            className="ss-input"
            placeholder="Search by SKU, Ref (PO/SO/TR/ADJ), Location, or Operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Operation Type:</span>
          <select
            className="ss-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Operations</option>
            <option value="RECEIPT">Inbound Receipts (+)</option>
            <option value="TRANSFER">Internal Transfers (⇄)</option>
            <option value="DELIVERY">Outbound Deliveries (-)</option>
            <option value="ADJUSTMENT">Cycle Adjustments (Δ)</option>
          </select>
        </div>
      </div>

      {/* Master Ledger Table */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>EVENT ID & TIME</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>OP TYPE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>REFERENCE #</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>ITEM (SKU)</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>SOURCE → DESTINATION</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>DELTA</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>BALANCE AFTER</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>OPERATOR & NOTES</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((tx, idx) => {
                const isReceipt = tx.type === 'RECEIPT';
                const isDelivery = tx.type === 'DELIVERY';
                const isTransfer = tx.type === 'TRANSFER';
                const isAdjustment = tx.type === 'ADJUSTMENT';

                return (
                  <tr
                    key={tx.id + idx}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {tx.id}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {tx.timestamp}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isReceipt && <span className="ss-badge ss-badge-success">📥 RECEIPT</span>}
                      {isDelivery && <span className="ss-badge ss-badge-danger">📤 DELIVERY</span>}
                      {isTransfer && (
                        <span className="ss-badge ss-badge-info" style={{ color: '#c084fc', borderColor: '#8b5cf6' }}>
                          ⇄ TRANSFER
                        </span>
                      )}
                      {isAdjustment && <span className="ss-badge ss-badge-warning">Δ ADJUSTMENT</span>}
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--ss-font-mono)',
                          fontSize: '0.75rem',
                          background: 'var(--ss-bg-app)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: 'var(--ss-radius-xs)',
                          border: '1px solid var(--ss-border)',
                          color: 'var(--ss-text-primary)',
                        }}
                      >
                        {tx.reference}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{tx.productName}</div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                        {tx.sku}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--ss-text-secondary)' }}>{tx.source}</span>
                        <span style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>→</span>
                        <span style={{ color: 'var(--ss-text-primary)' }}>{tx.destination}</span>
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--ss-font-mono)',
                          fontWeight: 800,
                          fontSize: '0.9375rem',
                          color: isReceipt
                            ? 'var(--ss-success-text)'
                            : isDelivery
                            ? 'var(--ss-danger-text)'
                            : isTransfer
                            ? '#c084fc'
                            : 'var(--ss-warning-text)',
                        }}
                      >
                        {isReceipt && `+${tx.qtyChange}`}
                        {isDelivery && `${tx.qtyChange}`}
                        {isTransfer && `⇄ ${tx.qtyChange}`}
                        {isAdjustment && `${tx.qtyChange > 0 ? '+' : ''}${tx.qtyChange}`}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                        {tx.balanceAfter}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginLeft: '3px' }}>units</span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)', fontSize: '0.75rem' }}>
                        {tx.operator}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {tx.note}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockLedgerPage;
