import React, { useState } from 'react';
import { INITIAL_ADJUSTMENTS, INITIAL_PRODUCTS } from '../../services/mockData';

export const AdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState(INITIAL_ADJUSTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // New adjustment form
  const [selectedSku, setSelectedSku] = useState(INITIAL_PRODUCTS[0].sku);
  const [deltaQty, setDeltaQty] = useState(-1);
  const [reasonCode, setReasonCode] = useState('Physical Damage / Forklift Snag');

  const filteredAdjustments = adjustments.filter((a) => {
    const matchesSearch =
      a.adjNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = reasonFilter === 'ALL' || a.reason.includes(reasonFilter);
    return matchesSearch && matchesReason;
  });

  const handleCreateAdjustment = (e) => {
    e.preventDefault();
    const prod = INITIAL_PRODUCTS.find((p) => p.sku === selectedSku) || INITIAL_PRODUCTS[0];
    const qty = parseInt(deltaQty, 10) || 0;

    const newAdj = {
      id: `adj-${Date.now().toString().slice(-4)}`,
      adjNumber: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: prod.sku,
      productName: prod.name,
      location: prod.primaryLocation,
      systemQty: prod.onHand,
      physicalQty: prod.onHand + qty,
      delta: qty,
      reason: reasonCode,
      operator: 'Sarah Chen (Manager)',
      approvedBy: 'Sarah Chen (Manager)',
      timestamp: 'Just now',
      status: 'APPROVED',
    };

    setAdjustments([newAdj, ...adjustments]);
    setIsModalOpen(false);
    setSuccessToast(`Adjustment ${newAdj.adjNumber} logged for ${newAdj.sku} (${qty > 0 ? '+' : ''}${qty} units). Ledger updated.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

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
            border: '1px solid var(--ss-warning)',
            borderRadius: 'var(--ss-radius-md)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-text-primary)',
          }}
        >
          <span style={{ color: 'var(--ss-warning-text)', fontSize: '1.25rem' }}>Δ</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-warning-text)' }}>
              Stock Adjustment Approved
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
              Cycle Count & Inventory Adjustments
            </h1>
            <span className="ss-badge ss-badge-warning">LIFECYCLE: STAGE 4 (ADJUST)</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Physical floor reconciliation, scrap logging, and discrepancy corrections with mandatory audit reasons.
          </p>
        </div>

        <button
          type="button"
          className="ss-btn ss-btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ background: 'var(--ss-warning)', color: '#000000', borderColor: 'var(--ss-warning-border)' }}
        >
          Δ Log Cycle Adjustment
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
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>TOTAL AUDIT CORRECTIONS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
            {adjustments.length} Logged
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>DAMAGE & SCRAP WRITE-OFFS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-danger-text)' }}>
            {adjustments.filter((a) => a.delta < 0).length} Discrepancies
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>FOUND UNRECORDED STOCK</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)' }}>
            {adjustments.filter((a) => a.delta > 0).length} Inflows
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>NET VARIANCE UNITS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)' }}>
            {adjustments.reduce((acc, a) => acc + a.delta, 0)} Units Net
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
            placeholder="Search by Adjustment #, SKU, Reason, or Operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Reason Filter:</span>
          <select
            className="ss-select"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Reasons</option>
            <option value="Damage">Physical Damage / Scrap</option>
            <option value="Found">Found Unrecorded</option>
            <option value="Cycle">Cycle Count Correction</option>
          </select>
        </div>
      </div>

      {/* Adjustments Data Table */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>ADJ # & TIMESTAMP</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>ITEM (SKU)</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>LOCATION</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>SYSTEM</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>PHYSICAL</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>VARIANCE DELTA</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>REASON CODE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>APPROVAL</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.map((a) => {
                const isPositive = a.delta > 0;

                return (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {a.adjNumber}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {a.timestamp}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{a.productName}</div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                        {a.sku}
                      </div>
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
                          color: 'var(--ss-text-secondary)',
                        }}
                      >
                        {a.location}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-muted)' }}>
                      {a.systemQty}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 600 }}>
                      {a.physicalQty}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--ss-font-mono)',
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: isPositive ? 'var(--ss-success-text)' : 'var(--ss-danger-text)',
                        }}
                      >
                        {isPositive ? `+${a.delta}` : `${a.delta}`}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                        {a.reason}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                        Logged by: {a.operator}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="ss-badge ss-badge-success">✓ {a.status}</span>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                        By {a.approvedBy}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Adjustment Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 15, 23, 0.8)',
            backdropFilter: 'blur(4px)',
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
                  Log Inventory Cycle Count / Adjustment
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Reconcile physical counts with double-entry variance justification.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setIsModalOpen(false)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Target Product SKU
                </label>
                <select
                  className="ss-select"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  {INITIAL_PRODUCTS.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} (Current: {p.onHand} units in {p.primaryLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Variance Delta (e.g. -2 or +5)
                  </label>
                  <input
                    type="number"
                    className="ss-input"
                    value={deltaQty}
                    onChange={(e) => setDeltaQty(parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Reason Code
                  </label>
                  <select
                    className="ss-select"
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value)}
                  >
                    <option value="Physical Damage / Forklift Snag">Physical Damage / Scrap</option>
                    <option value="Found Unrecorded Stock during Cycle Count">Found Stock</option>
                    <option value="Defective Batch Quarantine">Defective Batch Quarantine</option>
                    <option value="Sample Pull for QA Lab">Sample Pull for QA Lab</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  background: 'var(--ss-warning-bg)',
                  borderRadius: 'var(--ss-radius-md)',
                  border: '1px solid var(--ss-warning-border)',
                  fontSize: '0.75rem',
                  color: 'var(--ss-warning-text)',
                }}
              >
                <strong>Audit Requirement:</strong> All variance deltas write an unalterable signed event to the Stock Ledger.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ background: 'var(--ss-warning)', color: '#000000', borderColor: 'var(--ss-warning-border)' }}
                >
                  Authorize & Sign Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentsPage;
