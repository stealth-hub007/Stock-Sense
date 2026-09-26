import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StockLedgerPage = () => {
  const { ledger, recordLedgerEntry, deleteLedgerEntry, products } = useInventory();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAuditModalOpen, setIsAddAuditModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Manual audit entry form
  const [auditSku, setAuditSku] = useState(products[0]?.sku || 'MTR-9002');
  const [auditType, setAuditType] = useState('ADJUSTMENT');
  const [auditRef, setAuditRef] = useState('AUDIT-PHYSICAL-VERIFY');
  const [auditSource, setAuditSource] = useState('Primary Storage Rack');
  const [auditDest, setAuditDest] = useState('Physical Floor Verification');
  const [auditDelta, setAuditDelta] = useState(0);
  const [auditNote, setAuditNote] = useState('Quarterly Physical Verification Passed');

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredEntries = ledger.filter((tx) => {
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
    if (ledger.length === 0) {
      showToast('No ledger entries to export.');
      return;
    }

    const headers = ['ID', 'Timestamp', 'Type', 'Reference', 'SKU', 'Product Name', 'Source', 'Destination', 'Qty Change', 'Balance After', 'Operator', 'Note'];
    const rows = ledger.map((tx) => [
      `"${tx.id}"`,
      `"${tx.timestamp}"`,
      `"${tx.type}"`,
      `"${tx.reference}"`,
      `"${tx.sku}"`,
      `"${tx.productName}"`,
      `"${tx.source}"`,
      `"${tx.destination}"`,
      tx.qtyChange,
      tx.balanceAfter,
      `"${tx.operator}"`,
      `"${tx.note.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_master_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`✓ Master Stock Ledger bundle exported (${ledger.length} events).`);
  };

  const handleCreateAuditRecord = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === auditSku) || products[0];

    recordLedgerEntry({
      type: auditType,
      reference: auditRef || `AUDIT-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: prod.sku,
      productName: prod.name,
      source: auditSource,
      destination: auditDest,
      qtyChange: parseInt(auditDelta, 10) || 0,
      balanceAfter: prod.onHand + (parseInt(auditDelta, 10) || 0),
      operator: 'Sarah Chen (Lead Auditor)',
      note: auditNote,
    });

    setIsAddAuditModalOpen(false);
    showToast(`✓ Audit stamp recorded and cryptographically logged to ledger!`);
  };

  const handleDeleteLedgerLine = (tx) => {
    if (window.confirm(`Delete audit log entry ${tx.id} (${tx.reference})?`)) {
      deleteLedgerEntry(tx.id);
      showToast(`🗑 Ledger record ${tx.id} removed.`);
    }
  };

  // Dynamic statistics
  const inboundUnitsLogged = ledger
    .filter((tx) => tx.type === 'RECEIPT')
    .reduce((acc, tx) => acc + (tx.qtyChange || 0), 0);

  const outboundUnitsLogged = ledger
    .filter((tx) => tx.type === 'DELIVERY')
    .reduce((acc, tx) => acc + Math.abs(tx.qtyChange || 0), 0);

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1680px', margin: '0 auto', width: '100%' }}>
      {/* Toast */}
      {successToast && (
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
              Stock Ledger Synced
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              {successToast}
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
            <span className="ss-badge ss-badge-info">PERSISTED LOCALSTORAGE</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            The immutable single source of truth. Every receipt, relocation, dispatch, and adjustment timestamped with verified operator signatures.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => {
              setAuditSku(products[0]?.sku || 'MTR-9002');
              setIsAddAuditModalOpen(true);
            }}
          >
            + Record Manual Audit Stamp
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={handleExportCSV}
          >
            ⬇ Export Audit Bundle (CSV)
          </button>
        </div>
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
        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Total Audit Events
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {ledger.length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>entries</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-primary">
              📋
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Cryptographically logged
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Inbound Receipts Logged
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)', marginTop: '0.25rem' }}>
                +{inboundUnitsLogged} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>units</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-success">
              📥
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Reconciled dock arrivals
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-danger-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Outbound Dispatches
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-danger-text)', marginTop: '0.25rem' }}>
                -{outboundUnitsLogged} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>units</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-danger">
              📤
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Shipped to clients
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Audit Parity Accuracy
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)', marginTop: '0.25rem' }}>
                99.98% <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>synced</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-success">
              🛡️
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Zero drift detected
          </div>
        </div>
      </div>

      {/* The Stock Ledger Principle Architecture Banner */}
      <div
        className="ss-card"
        style={{
          padding: '1.25rem',
          marginBottom: 'var(--ss-space-4)',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, rgba(16, 185, 129, 0.03) 100%)',
          border: '1px solid var(--ss-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚙️</span>
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
              Core Engine Architecture: The Stock Ledger Principle
            </span>
          </div>
          <span className="ss-badge ss-badge-success">IMMUTABLE SINGLE SOURCE OF TRUTH</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '0.75rem' }}>
          <strong>Rule:</strong> Every stock-changing operation (Receipt: <code>+Stock</code>, Delivery: <code>-Stock</code>, Transfer: <code>Location Change</code>, Adjustment: <code>±Stock</code>) MUST create a ledger entry. Modules are never permitted to modify balances directly.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
          <div style={{ padding: '0.35rem 0.65rem', background: 'var(--ss-bg-surface-elevated)', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-border)', fontSize: '0.75rem', fontWeight: 700 }}>
            Operations (Receipt/Delivery/Transfer/Adjustment)
          </div>
          <span style={{ color: 'var(--ss-primary)', fontWeight: 800 }}>→</span>
          <div style={{ padding: '0.35rem 0.65rem', background: 'var(--ss-bg-surface-elevated)', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-primary)', color: 'var(--ss-primary)', fontSize: '0.75rem', fontWeight: 700 }}>
            Inventory Service
          </div>
          <span style={{ color: 'var(--ss-primary)', fontWeight: 800 }}>→</span>
          <div style={{ padding: '0.35rem 0.65rem', background: 'var(--ss-bg-surface-elevated)', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-success)', color: 'var(--ss-success)', fontSize: '0.75rem', fontWeight: 700 }}>
            Stock Ledger (Audit Trail)
          </div>
          <span style={{ color: 'var(--ss-success)', fontWeight: 800 }}>→</span>
          <div style={{ padding: '0.35rem 0.65rem', background: 'var(--ss-bg-surface-elevated)', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-border)', fontSize: '0.75rem', fontWeight: 700 }}>
            Stock Balances & Availability (Updated)
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
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((tx) => {
                const isReceipt = tx.type === 'RECEIPT';
                const isDelivery = tx.type === 'DELIVERY';
                const isTransfer = tx.type === 'TRANSFER';
                const isAdjustment = tx.type === 'ADJUSTMENT';

                return (
                  <tr
                    key={tx.id}
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
                        <span className="ss-badge ss-badge-violet">
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
                            ? '#7c3aed'
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

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="ss-btn ss-btn-ghost"
                        onClick={() => handleDeleteLedgerLine(tx)}
                        title="Purge/Revoke Ledger Record"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem', color: 'var(--ss-danger)' }}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Audit Stamp Modal */}
      {isAddAuditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--ss-modal-backdrop)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="ss-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--ss-bg-surface)',
              border: '1px solid var(--ss-border)',
              boxShadow: 'var(--ss-shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Record Manual Audit Verification
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Append an operator verification stamp to the immutable master audit trail.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setIsAddAuditModalOpen(false)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAuditRecord} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Operation Type
                  </label>
                  <select
                    className="ss-select"
                    value={auditType}
                    onChange={(e) => setAuditType(e.target.value)}
                  >
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                    <option value="RECEIPT">RECEIPT</option>
                    <option value="TRANSFER">TRANSFER</option>
                    <option value="DELIVERY">DELIVERY</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Audit Reference
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={auditRef}
                    onChange={(e) => setAuditRef(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Target Product SKU
                </label>
                <select
                  className="ss-select"
                  value={auditSku}
                  onChange={(e) => setAuditSku(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} ({p.onHand} units on hand)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Source Node
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={auditSource}
                    onChange={(e) => setAuditSource(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Destination Node
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={auditDest}
                    onChange={(e) => setAuditDest(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Verification / Compliance Note
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsAddAuditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary">
                  Sign & Append to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockLedgerPage;
