import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffTasksPage = ({ onNavigateTab }) => {
  const { receipts, deliveries, transfers, confirmReceipt, advanceDeliveryStatus, executeTransfer } = useInventory();
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'RECEIVING' | 'PICKING' | 'PACKING' | 'TRANSFERS'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Compile tasks
  const pendingReceipts = (receipts || [])
    .filter((r) => r.status === 'PENDING')
    .map((r) => ({
      id: r.id || r.poNumber,
      type: 'RECEIVING',
      typeLabel: 'Inbound Receiving',
      typeBadge: 'info',
      icon: '📥',
      ref: r.poNumber,
      title: `${r.productName || r.sku}`,
      sku: r.sku,
      location: r.dock || 'Bay 01 - Receiving',
      qty: r.expectedQty,
      priority: 'HIGH',
      supplier: r.supplier,
      actionText: 'Confirm & Receive Goods',
      onExecute: () => {
        confirmReceipt(r.poNumber, r.expectedQty, 'Alex Rivera (Staff)');
        showToast(`✓ Inbound receipt ${r.poNumber} verified! Received +${r.expectedQty} units.`);
      },
    }));

  const pickingTasks = (deliveries || [])
    .filter((d) => d.status === 'READY_TO_DISPATCH' || d.status === 'ALLOCATED')
    .map((d) => ({
      id: d.id || d.orderNo,
      type: 'PICKING',
      typeLabel: 'Order Picking',
      typeBadge: 'primary',
      icon: '🔍',
      ref: d.orderNo,
      title: `${d.productName || d.sku}`,
      sku: d.sku,
      location: d.sourceLocation || 'Zone C (Rapid Dispatch)',
      qty: d.qty,
      priority: d.priority || 'HIGH',
      customer: d.customer,
      actionText: 'Confirm Picked',
      onExecute: () => {
        advanceDeliveryStatus(d.orderNo, 'PICKED', 'Alex Rivera (Staff)');
        showToast(`✓ Order ${d.orderNo} picked (${d.qty} units from ${d.sourceLocation || 'Bin'})`);
      },
    }));

  const packingTasks = (deliveries || [])
    .filter((d) => d.status === 'PICKED')
    .map((d) => ({
      id: d.id || d.orderNo,
      type: 'PACKING',
      typeLabel: 'Order Packing',
      typeBadge: 'warning',
      icon: '📦',
      ref: d.orderNo,
      title: `${d.productName || d.sku}`,
      sku: d.sku,
      location: 'Packing Bench Station 01',
      qty: d.qty,
      priority: 'HIGH',
      carrier: d.carrier,
      actionText: 'Seal & Complete Packing',
      onExecute: () => {
        advanceDeliveryStatus(d.orderNo, 'PACKED', 'Alex Rivera (Staff)');
        showToast(`✓ Order ${d.orderNo} sealed and packed in carton!`);
      },
    }));

  const transferTasks = (transfers || [])
    .filter((t) => t.status === 'SCHEDULED')
    .map((t) => ({
      id: t.id || t.transferNo,
      type: 'TRANSFERS',
      typeLabel: 'Internal Transfer',
      typeBadge: 'success',
      icon: '⇄',
      ref: t.transferNo,
      title: `${t.productName || t.sku}`,
      sku: t.sku,
      location: `${t.fromLocation} → ${t.toLocation}`,
      qty: t.qty,
      priority: t.priority || 'MEDIUM',
      reason: t.reason,
      actionText: 'Confirm Movement',
      onExecute: () => {
        executeTransfer(t.transferNo, 'Alex Rivera (Staff)');
        showToast(`✓ Relocation ${t.transferNo} executed (+${t.qty} units to ${t.toLocation})`);
      },
    }));

  const allTasks = [...pendingReceipts, ...pickingTasks, ...packingTasks, ...transferTasks];

  const filteredTasks = allTasks.filter((task) => {
    const matchesType = filterType === 'ALL' || task.type === filterType;
    const matchesQuery =
      task.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
              My Operational Tasks
            </h1>
            <span className="ss-badge ss-badge-primary">
              {filteredTasks.length} PENDING
            </span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Unified high-speed task queue for receiving, picking, packing, and bin relocations.
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: `All (${allTasks.length})` },
            { key: 'RECEIVING', label: `Receiving (${pendingReceipts.length})` },
            { key: 'PICKING', label: `Picking (${pickingTasks.length})` },
            { key: 'PACKING', label: `Packing (${packingTasks.length})` },
            { key: 'TRANSFERS', label: `Transfers (${transferTasks.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`ss-btn ${filterType === tab.key ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setFilterType(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="ss-input"
          placeholder="Filter tasks by Order #, SKU, Location, or Product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Task Cards Grid (Mobile/Tablet Friendly & High-Touch) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="ss-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-lg)',
            }}
          >
            <div>
              {/* Card Header: Type Badge & Reference */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <span className={`ss-badge ss-badge-${task.typeBadge}`}>
                  {task.icon} {task.typeLabel}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--ss-font-mono)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    color: 'var(--ss-text-primary)',
                  }}
                >
                  {task.ref}
                </span>
              </div>

              {/* Product Info */}
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                {task.title}
              </div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '2px' }}>
                SKU: {task.sku}
              </div>

              {/* Location & Quantity Detail Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: 'var(--ss-bg-app)',
                  border: '1px solid var(--ss-border-subtle)',
                  borderRadius: 'var(--ss-radius-md)',
                  marginTop: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Target Location
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
                    {task.location}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Required Qty
                  </div>
                  <div
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      fontFamily: 'var(--ss-font-mono)',
                      color: 'var(--ss-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {task.qty} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>units</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              className="ss-btn ss-btn-primary"
              onClick={task.onExecute}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              ✓ {task.actionText}
            </button>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div
            className="ss-card"
            style={{
              gridColumn: '1 / -1',
              padding: '3rem 1rem',
              textAlign: 'center',
              color: 'var(--ss-text-muted)',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.5rem' }}>
              No Pending Floor Tasks
            </div>
            <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              All assigned receiving, picking, packing, and relocation jobs are currently completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffTasksPage;
