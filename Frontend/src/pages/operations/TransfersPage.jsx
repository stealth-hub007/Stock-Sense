import React, { useState } from 'react';
import { INITIAL_TRANSFERS_QUEUE, INITIAL_PRODUCTS } from '../../services/mockData';

export const TransfersPage = () => {
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS_QUEUE);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // New transfer form
  const [newSku, setNewSku] = useState(INITIAL_PRODUCTS[0].sku);
  const [newQty, setNewQty] = useState(15);
  const [newFrom, setNewFrom] = useState('Rack A-02');
  const [newTo, setNewTo] = useState('Zone C (Rapid Dispatch)');
  const [newReason, setNewReason] = useState('Fulfillment Staging');
  const [newPriority, setNewPriority] = useState('HIGH');

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.transferNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCompleteTransfer = (transferNo, sku, qty, toLoc) => {
    setTransfers((prev) =>
      prev.map((t) =>
        t.transferNo === transferNo
          ? {
              ...t,
              status: 'COMPLETED',
              completedAt: 'Just now',
            }
          : t
      )
    );

    setSuccessToast(`Transfer ${transferNo} completed! ${qty} units of ${sku} moved to ${toLoc}.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleScheduleTransfer = (e) => {
    e.preventDefault();
    const prod = INITIAL_PRODUCTS.find((p) => p.sku === newSku) || INITIAL_PRODUCTS[0];

    const newTransferItem = {
      id: `tr-${Date.now().toString().slice(-4)}`,
      transferNo: `TR-${Math.floor(7000 + Math.random() * 2000)}`,
      sku: prod.sku,
      productName: prod.name,
      qty: parseInt(newQty, 10) || 10,
      fromLocation: newFrom,
      toLocation: newTo,
      priority: newPriority,
      reason: newReason,
      status: 'SCHEDULED',
      requestedBy: 'Sarah Chen (Manager)',
    };

    setTransfers([newTransferItem, ...transfers]);
    setIsModalOpen(false);
    setSuccessToast(`Transfer ${newTransferItem.transferNo} scheduled from ${newFrom} → ${newTo}.`);
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
            border: '1px solid #8b5cf6',
            borderRadius: 'var(--ss-radius-md)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-text-primary)',
          }}
        >
          <span style={{ color: '#c084fc', fontSize: '1.25rem' }}>⇄</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#c084fc' }}>
              Internal Location Movement
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
              Internal Location Transfers
            </h1>
            <span className="ss-badge ss-badge-info">LIFECYCLE: STAGE 2 (RELOCATION)</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Move pallets and parts between receiving bays, high-bay storage racks, and rapid dispatch staging areas.
          </p>
        </div>

        <button
          type="button"
          className="ss-btn ss-btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#8b5cf6', borderColor: '#7c3aed' }}
        >
          ⇄ Schedule New Transfer
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
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>SCHEDULED MOVES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: '#c084fc' }}>
            {transfers.filter((t) => t.status === 'SCHEDULED').length} Relocations
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>HIGH PRIORITY STAGING</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)' }}>
            {transfers.filter((t) => t.priority === 'HIGH' && t.status === 'SCHEDULED').length} Urgent
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>COMPLETED TODAY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)' }}>
            {transfers.filter((t) => t.status === 'COMPLETED').length} Finished
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>UNITS IN RELOCATION</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
            {transfers.reduce((acc, t) => acc + t.qty, 0)} Units
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
            placeholder="Search by Transfer #, SKU, Zone, or Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Status Filter:</span>
          <select
            className="ss-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Moves</option>
            <option value="SCHEDULED">Scheduled / Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Transfers Data Table */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>TRANSFER #</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>ITEM (SKU)</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>SOURCE → DESTINATION</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>QTY MOVED</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>PRIORITY & REASON</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((t) => {
                const isScheduled = t.status === 'SCHEDULED';
                const isCompleted = t.status === 'COMPLETED';

                return (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {t.transferNo}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        By: {t.requestedBy}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{t.productName}</div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                        {t.sku}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                        <code>{t.fromLocation}</code>
                        <span style={{ color: '#c084fc', fontWeight: 700 }}>→</span>
                        <code>{t.toLocation}</code>
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--ss-font-mono)',
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: '#c084fc',
                        }}
                      >
                        ⇄ {t.qty}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span
                          className={`ss-badge ${
                            t.priority === 'HIGH' ? 'ss-badge-warning' : 'ss-badge-neutral'
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                          {t.reason}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isScheduled && <span className="ss-badge ss-badge-info">Scheduled</span>}
                      {isCompleted && (
                        <span className="ss-badge ss-badge-success">✓ Completed</span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {isScheduled ? (
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => handleCompleteTransfer(t.transferNo, t.sku, t.qty, t.toLocation)}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderColor: '#8b5cf6', color: '#c084fc' }}
                        >
                          Confirm Move →
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                          {t.completedAt}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Transfer Modal */}
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
                  Schedule Internal Location Transfer
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Relocate inventory without altering total warehouse stock.
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

            <form onSubmit={handleScheduleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Target Product SKU
                </label>
                <select
                  className="ss-select"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                >
                  {INITIAL_PRODUCTS.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} ({p.onHand} on hand)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Source Bin / Zone
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={newFrom}
                    onChange={(e) => setNewFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Destination Bin / Zone
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={newTo}
                    onChange={(e) => setNewTo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Quantity to Relocate
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Priority
                  </label>
                  <select
                    className="ss-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent Staging)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Transfer Reason
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Order staging or buffer replenishment"
                  required
                />
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
                  style={{ background: '#8b5cf6', borderColor: '#7c3aed' }}
                >
                  Schedule Location Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
