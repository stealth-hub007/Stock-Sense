import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

export const StaffDashboard = ({ onNavigateTab }) => {
  const { user, activeWarehouse } = useAuth();
  const { receipts, deliveries, transfers, adjustments } = useInventory();

  // Operational metrics (filtered for floor execution, not financial/strategic)
  const pendingReceipts = (receipts || []).filter((r) => r.status === 'PENDING');
  const pickingQueue = (deliveries || []).filter((d) => d.status === 'READY_TO_DISPATCH' || d.status === 'ALLOCATED');
  const packingQueue = (deliveries || []).filter((d) => d.status === 'PICKED');
  const scheduledTransfers = (transfers || []).filter((t) => t.status === 'SCHEDULED');
  const pendingCountReviews = (adjustments || []).filter((a) => a.status === 'PENDING_APPROVAL');

  const totalActionItems = pendingReceipts.length + pickingQueue.length + packingQueue.length + scheduledTransfers.length;

  return (
    <div style={{ padding: 'var(--ss-space-5)', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Shift & Floor Status Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--ss-bg-surface)',
          border: '1px solid var(--ss-border)',
          borderRadius: 'var(--ss-radius-lg)',
          boxShadow: 'var(--ss-shadow-sm)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--ss-radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                Warehouse Floor Terminal
              </h1>
              <span className="ss-badge ss-badge-success" style={{ fontWeight: 700 }}>
                ● ACTIVE SHIFT
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              Operator: <strong style={{ color: 'var(--ss-text-primary)' }}>{user?.name || 'Alex Rivera'}</strong> • {activeWarehouse?.name || 'Main DC'} • Scanner Terminal #TC-52
            </div>
          </div>
        </div>

        {/* Quick Shift Summary Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.4rem 0.75rem',
              backgroundColor: 'var(--ss-bg-app)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-md)',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--ss-text-muted)' }}>Tasks Pending: </span>
            <strong style={{ color: totalActionItems > 0 ? 'var(--ss-warning)' : 'var(--ss-success)', fontFamily: 'var(--ss-font-mono)' }}>
              {totalActionItems} Actions
            </strong>
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => onNavigateTab('tasks')}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
          >
            📋 Open Task Queue →
          </button>
        </div>
      </div>

      {/* Operational Floor Metrics (Speed & Quantity Centric) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Metric 1: Pending Inbound */}
        <div
          className="ss-card"
          style={{
            padding: '1.25rem',
            borderTop: '4px solid var(--ss-info)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onClick={() => onNavigateTab('receipts')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Inbound Receiving
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {pendingReceipts.length}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>📥</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
            Shipments waiting at dock
          </div>
        </div>

        {/* Metric 2: Picking Queue */}
        <div
          className="ss-card"
          style={{
            padding: '1.25rem',
            borderTop: '4px solid var(--ss-primary)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onClick={() => onNavigateTab('deliveries')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Order Picking
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {pickingQueue.length}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>🔍</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
            Orders ready for bin pick
          </div>
        </div>

        {/* Metric 3: Packing Queue */}
        <div
          className="ss-card"
          style={{
            padding: '1.25rem',
            borderTop: '4px solid var(--ss-warning)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onClick={() => onNavigateTab('deliveries')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Packing Bench
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {packingQueue.length}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
            Picked orders to cartonize
          </div>
        </div>

        {/* Metric 4: Internal Transfers */}
        <div
          className="ss-card"
          style={{
            padding: '1.25rem',
            borderTop: '4px solid var(--ss-success)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onClick={() => onNavigateTab('transfers')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bin Relocations
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {scheduledTransfers.length}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>⇄</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
            Scheduled store & rack shifts
          </div>
        </div>
      </div>

      {/* FAST OPERATIONAL ACTIONS (Large Clear Action Cards) */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚡</span>
          <span>Fast Operational Actions (1-Click Floor Launch)</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Action 1: Receive Goods */}
          <div
            className="ss-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              border: '1px solid var(--ss-border)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📥</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                  Inbound Receiving
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Unload supplier trucks, confirm quantities, and increment stock at receiving docks.
              </p>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-primary"
              onClick={() => onNavigateTab('receipts')}
              style={{ justifyContent: 'center', width: '100%', padding: '0.55rem', fontWeight: 700 }}
            >
              Start Receiving ({pendingReceipts.length}) →
            </button>
          </div>

          {/* Action 2: Pick Orders */}
          <div
            className="ss-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              border: '1px solid var(--ss-border)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🔍</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                  Order Picking
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Navigate to specific warehouse bins, verify SKU barcodes, and mark products as picked.
              </p>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-primary"
              onClick={() => onNavigateTab('deliveries')}
              style={{ justifyContent: 'center', width: '100%', padding: '0.55rem', fontWeight: 700 }}
            >
              Start Picking ({pickingQueue.length}) →
            </button>
          </div>

          {/* Action 3: Pack & Cartonize */}
          <div
            className="ss-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              border: '1px solid var(--ss-border)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📦</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                  Packing Bench
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Verify picked items, select packing containers, and seal orders ready for carrier dispatch.
              </p>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-secondary"
              onClick={() => onNavigateTab('deliveries')}
              style={{ justifyContent: 'center', width: '100%', padding: '0.55rem', fontWeight: 700 }}
            >
              Open Packing Bench ({packingQueue.length}) →
            </button>
          </div>

          {/* Action 4: Stock Counting */}
          <div
            className="ss-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              border: '1px solid var(--ss-border)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🎯</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                  Physical Stock Count
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Count physical bin inventory, calculate discrepancies live, and submit to manager for sign-off.
              </p>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-secondary"
              onClick={() => onNavigateTab('stock-counting')}
              style={{ justifyContent: 'center', width: '100%', padding: '0.55rem', fontWeight: 700 }}
            >
              Perform Stock Count →
            </button>
          </div>
        </div>
      </div>

      {/* Immediate Attention Tasks Table */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--ss-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ss-text-primary)', margin: 0 }}>
              Live Operational Floor Queue
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              High-priority operations requiring execution on the warehouse floor
            </div>
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-ghost"
            onClick={() => onNavigateTab('tasks')}
            style={{ fontSize: '0.75rem', color: 'var(--ss-primary)' }}
          >
            View All Tasks ({totalActionItems}) →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>TYPE</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>REFERENCE</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>PRODUCT & SKU</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>LOCATION / DOCK</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>QTY</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {/* Receipts in queue */}
              {pendingReceipts.slice(0, 3).map((r) => (
                <tr key={r.id || r.poNumber} style={{ borderBottom: '1px solid var(--ss-border-subtle)' }}>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <span className="ss-badge ss-badge-info">📥 RECEIPT</span>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                    {r.poNumber}
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{r.productName || r.sku}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)' }}>{r.sku}</div>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-secondary)' }}>
                    {r.dock || 'Bay 01 - Receiving'}
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                    {r.expectedQty} units
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="ss-btn ss-btn-primary"
                      onClick={() => onNavigateTab('receipts')}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Receive Goods →
                    </button>
                  </td>
                </tr>
              ))}

              {/* Delivery Picking in queue */}
              {pickingQueue.slice(0, 3).map((d) => (
                <tr key={d.id || d.orderNo} style={{ borderBottom: '1px solid var(--ss-border-subtle)' }}>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <span className="ss-badge ss-badge-primary">🔍 PICKING</span>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                    {d.orderNo}
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{d.productName || d.sku}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)' }}>{d.sku}</div>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-secondary)' }}>
                    {d.sourceLocation || 'Zone C (Rapid Dispatch)'}
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                    {d.qty} units
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="ss-btn ss-btn-secondary"
                      onClick={() => onNavigateTab('deliveries')}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Pick Items →
                    </button>
                  </td>
                </tr>
              ))}

              {/* Transfers in queue */}
              {scheduledTransfers.slice(0, 2).map((t) => (
                <tr key={t.id || t.transferNo} style={{ borderBottom: '1px solid var(--ss-border-subtle)' }}>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <span className="ss-badge ss-badge-success">⇄ SHIFT</span>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                    {t.transferNo}
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{t.productName || t.sku}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)' }}>{t.sku}</div>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-secondary)' }}>
                    {t.fromLocation} → {t.toLocation}
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                    {t.qty} units
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="ss-btn ss-btn-secondary"
                      onClick={() => onNavigateTab('transfers')}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Execute Transfer →
                    </button>
                  </td>
                </tr>
              ))}

              {totalActionItems === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                    ✓ All operational queues are clear! Excellent floor efficiency.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
