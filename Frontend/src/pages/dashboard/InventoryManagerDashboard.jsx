import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  INITIAL_PRODUCTS,
  INITIAL_LEDGER,
  INITIAL_METRICS,
  INITIAL_ZONES,
  INITIAL_RECEIPTS_QUEUE,
  INITIAL_TRANSFERS_QUEUE,
  INITIAL_DELIVERIES_QUEUE,
} from '../../services/mockData';

export const InventoryManagerDashboard = ({ onNavigateTab }) => {
  const { user } = useAuth();

  // Dynamic state for real-time operational reactivity
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [receiptsQueue, setReceiptsQueue] = useState(INITIAL_RECEIPTS_QUEUE);
  const [transfersQueue, setTransfersQueue] = useState(INITIAL_TRANSFERS_QUEUE);
  const [deliveriesQueue, setDeliveriesQueue] = useState(INITIAL_DELIVERIES_QUEUE);

  // Active view tab for the operations work center
  const [activeQueueTab, setActiveQueueTab] = useState('WATCHLIST'); // 'WATCHLIST' | 'RECEIPTS' | 'TRANSFERS' | 'DELIVERIES'

  // Modal states
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Form input states
  const [selectedSku, setSelectedSku] = useState('VLV-3011');
  const [modalQty, setModalQty] = useState(25);
  const [adjReason, setAdjReason] = useState('DAMAGED_SCRAP');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. EXECUTE INBOUND RECEIPT (Stock Increases)
  const handleExecuteReceipt = (sku, qty, poNumber = 'PO-MANUAL') => {
    const targetProduct = products.find((p) => p.sku === sku);
    if (!targetProduct) return;

    const newOnHand = targetProduct.onHand + qty;
    const newAvailable = targetProduct.available + qty;
    const newStatus = newOnHand > targetProduct.minThreshold ? 'IN_STOCK' : 'LOW_STOCK';

    // Update Product State
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === sku ? { ...p, onHand: newOnHand, available: newAvailable, status: newStatus } : p
      )
    );

    // Write to Ledger
    const newTx = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      type: 'RECEIPT',
      reference: poNumber,
      sku: targetProduct.sku,
      productName: targetProduct.name,
      source: 'Receiving Dock A',
      destination: targetProduct.primaryLocation,
      qtyChange: +qty,
      balanceAfter: newOnHand,
      operator: `${user?.name || 'Sarah Chen'} (Manager)`,
      note: 'Supplier PO arrival verified & stocked',
    };
    setLedger((prev) => [newTx, ...prev]);

    // Update Metrics
    setMetrics((prev) => ({
      ...prev,
      totalStockUnits: prev.totalStockUnits + qty,
      totalInventoryValuation: prev.totalInventoryValuation + qty * targetProduct.unitCost,
      activeInboundPOs: Math.max(0, prev.activeInboundPOs - 1),
      inboundUnitsPending: Math.max(0, prev.inboundUnitsPending - qty),
      lowStockCount: targetProduct.status === 'LOW_STOCK' && newStatus === 'IN_STOCK' ? Math.max(0, prev.lowStockCount - 1) : prev.lowStockCount,
      criticalOutCount: targetProduct.status === 'OUT_OF_STOCK' ? Math.max(0, prev.criticalOutCount - 1) : prev.criticalOutCount,
      totalLedgerEntries: prev.totalLedgerEntries + 1,
    }));

    // Remove from queue if applicable
    setReceiptsQueue((prev) => prev.filter((r) => r.poNumber !== poNumber));

    showToast(`✓ Received +${qty} units of ${targetProduct.sku}. Stock increased to ${newOnHand} in ${targetProduct.primaryLocation}.`);
    setIsReceiptModalOpen(false);
  };

  // 2. EXECUTE INTERNAL TRANSFER (Location Changes)
  const handleExecuteTransfer = (transferNo, sku, qty, fromLoc, toLoc) => {
    const targetProduct = products.find((p) => p.sku === sku);
    if (!targetProduct) return;

    // Write to Ledger
    const newTx = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      type: 'TRANSFER',
      reference: transferNo || `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: targetProduct.sku,
      productName: targetProduct.name,
      source: fromLoc,
      destination: toLoc,
      qtyChange: qty,
      isRelocation: true,
      balanceAfter: targetProduct.onHand,
      operator: `${user?.name || 'Sarah Chen'} (Manager)`,
      note: `Relocated ${qty} units: ${fromLoc} → ${toLoc}`,
    };
    setLedger((prev) => [newTx, ...prev]);

    // Update Metrics
    setMetrics((prev) => ({
      ...prev,
      scheduledTransfersCount: Math.max(0, prev.scheduledTransfersCount - 1),
      transferUnitsScheduled: Math.max(0, prev.transferUnitsScheduled - qty),
      totalLedgerEntries: prev.totalLedgerEntries + 1,
    }));

    // Remove from queue
    setTransfersQueue((prev) => prev.filter((t) => t.transferNo !== transferNo));

    showToast(`⇄ Relocated ${qty} units of ${targetProduct.sku} to ${toLoc}. Location updated in ledger.`);
    setIsTransferModalOpen(false);
  };

  // 3. EXECUTE DELIVERY (Stock Decreases)
  const handleExecuteDelivery = (orderNo, sku, qty, customer) => {
    const targetProduct = products.find((p) => p.sku === sku);
    if (!targetProduct) return;

    const newOnHand = Math.max(0, targetProduct.onHand - qty);
    const newStatus = newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand <= targetProduct.minThreshold ? 'LOW_STOCK' : 'IN_STOCK';

    // Update Product State
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === sku ? { ...p, onHand: newOnHand, status: newStatus } : p
      )
    );

    // Write to Ledger
    const newTx = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      type: 'DELIVERY',
      reference: orderNo,
      sku: targetProduct.sku,
      productName: targetProduct.name,
      source: 'Zone C (Rapid Dispatch)',
      destination: `Customer: ${customer}`,
      qtyChange: -qty,
      balanceAfter: newOnHand,
      operator: `${user?.name || 'Sarah Chen'} (Manager)`,
      note: `Order ${orderNo} dispatched via freight`,
    };
    setLedger((prev) => [newTx, ...prev]);

    // Update Metrics
    setMetrics((prev) => ({
      ...prev,
      totalStockUnits: prev.totalStockUnits - qty,
      totalInventoryValuation: prev.totalInventoryValuation - qty * targetProduct.unitCost,
      pendingDeliveriesCount: Math.max(0, prev.pendingDeliveriesCount - 1),
      outboundUnitsPending: Math.max(0, prev.outboundUnitsPending - qty),
      totalLedgerEntries: prev.totalLedgerEntries + 1,
    }));

    // Remove from queue
    setDeliveriesQueue((prev) => prev.filter((d) => d.orderNo !== orderNo));

    showToast(`📤 Order ${orderNo} dispatched (-${qty} units of ${targetProduct.sku}). Stock deducted in ledger.`);
  };

  // 4. EXECUTE CYCLE ADJUSTMENT (Variance Correction)
  const handleExecuteAdjustment = (e) => {
    e.preventDefault();
    const qty = parseInt(modalQty, 10);
    const targetProduct = products.find((p) => p.sku === selectedSku);
    if (!targetProduct || isNaN(qty)) return;

    const newOnHand = Math.max(0, targetProduct.onHand + qty);
    const newStatus = newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand <= targetProduct.minThreshold ? 'LOW_STOCK' : 'IN_STOCK';

    // Update Product State
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === selectedSku ? { ...p, onHand: newOnHand, status: newStatus } : p
      )
    );

    // Write to Ledger
    const newTx = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      type: 'ADJUSTMENT',
      reference: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: targetProduct.sku,
      productName: targetProduct.name,
      source: targetProduct.primaryLocation,
      destination: qty < 0 ? 'Scrap Bin / Audit Discrepancy' : 'Physical Recount Inflow',
      qtyChange: qty,
      balanceAfter: newOnHand,
      operator: `${user?.name || 'Sarah Chen'} (Manager)`,
      note: `Cycle count: ${adjReason}`,
    };
    setLedger((prev) => [newTx, ...prev]);

    // Update Metrics
    setMetrics((prev) => ({
      ...prev,
      totalStockUnits: prev.totalStockUnits + qty,
      totalInventoryValuation: prev.totalInventoryValuation + qty * targetProduct.unitCost,
      totalLedgerEntries: prev.totalLedgerEntries + 1,
    }));

    showToast(`Δ Cycle adjustment of ${qty > 0 ? '+' : ''}${qty} units logged for ${targetProduct.sku}. Reason: ${adjReason}`);
    setIsAdjustmentModalOpen(false);
  };

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1680px', margin: '0 auto', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            background: 'var(--ss-bg-surface-elevated)',
            border: '1px solid var(--ss-primary)',
            borderRadius: 'var(--ss-radius-md)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-text-primary)',
            animation: 'fadeIn 200ms ease',
          }}
        >
          <span style={{ color: 'var(--ss-primary)', fontSize: '1.25rem' }}>ℹ️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-primary)' }}>
              Operational Event Signed & Recorded
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              {toastMessage}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('ledger')}
            className="ss-btn ss-btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', marginLeft: '0.5rem' }}
          >
            Audit Ledger →
          </button>
        </div>
      )}

      {/* Page Header */}
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
              Inventory Operations Command
            </h1>
            <span className="ss-badge ss-badge-info">STRATEGIC OVERSIGHT</span>
            <span className="ss-badge ss-badge-success">● LIVE STREAMING</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Real-time physical-to-digital inventory parity across storage bins, docks, and dispatch corridors.
          </p>
        </div>

        {/* Global Action Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ss-space-3)' }}>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => setIsTransferModalOpen(true)}
          >
            ⇄ Schedule Transfer
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => setIsAdjustmentModalOpen(true)}
          >
            Δ Log Adjustment
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={() => {
              setSelectedSku('VLV-3011');
              setModalQty(30);
              setIsReceiptModalOpen(true);
            }}
          >
            + Inbound PO Receipt
          </button>
        </div>
      </div>

      {/* =========================================================================
          THE FULL GLORY 6-KPI OPERATIONAL METRIC STRIP
         ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-4)',
        }}
      >
        {/* KPI 1: TOTAL STOCK */}
        <div
          className="ss-card"
          style={{ borderLeft: '4px solid var(--ss-primary)', cursor: 'pointer' }}
          onClick={() => setActiveQueueTab('WATCHLIST')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', letterSpacing: '0.06em' }}>
              TOTAL STOCK ON-HAND
            </span>
            <span style={{ fontSize: '1.25rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
            {metrics.totalStockUnits.toLocaleString()} <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>units</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-success)', fontWeight: 600 }}>${metrics.totalInventoryValuation.toLocaleString()} val</span>
            <span style={{ color: 'var(--ss-text-muted)' }}>• +{metrics.valuationGrowthPct}% m/m</span>
          </div>
        </div>

        {/* KPI 2: LOW & OUT OF STOCK */}
        <div
          className="ss-card"
          style={{ borderLeft: '4px solid var(--ss-warning)', cursor: 'pointer' }}
          onClick={() => setActiveQueueTab('WATCHLIST')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', letterSpacing: '0.06em' }}>
              LOW & OUT OF STOCK
            </span>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)' }}>
            {metrics.lowStockCount} <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>SKUs Low</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-danger)', fontWeight: 700 }}>{metrics.criticalOutCount} Out of Stock</span>
            <span style={{ color: 'var(--ss-text-muted)' }}>• Needs PO replenishment</span>
          </div>
        </div>

        {/* KPI 3: PENDING INBOUND RECEIPTS */}
        <div
          className="ss-card"
          style={{ borderLeft: '4px solid var(--ss-success)', cursor: 'pointer' }}
          onClick={() => setActiveQueueTab('RECEIPTS')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', letterSpacing: '0.06em' }}>
              PENDING INBOUND RECEIPTS
            </span>
            <span style={{ fontSize: '1.25rem' }}>📥</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)' }}>
            {metrics.activeInboundPOs} <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>POs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-text-primary)', fontWeight: 600 }}>+{metrics.inboundUnitsPending} units expected</span>
            <span style={{ color: 'var(--ss-text-muted)' }}>• 2 Docked</span>
          </div>
        </div>

        {/* KPI 4: PENDING DELIVERIES */}
        <div
          className="ss-card"
          style={{ borderLeft: '4px solid var(--ss-info)', cursor: 'pointer' }}
          onClick={() => setActiveQueueTab('DELIVERIES')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', letterSpacing: '0.06em' }}>
              PENDING DELIVERIES
            </span>
            <span style={{ fontSize: '1.25rem' }}>📤</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-info-text)' }}>
            {metrics.pendingDeliveriesCount} <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>Orders</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-text-primary)', fontWeight: 600 }}>-{metrics.outboundUnitsPending} units allocated</span>
            <span style={{ color: 'var(--ss-text-muted)' }}>• 3 Express</span>
          </div>
        </div>

        {/* KPI 5: SCHEDULED INTERNAL TRANSFERS */}
        <div
          className="ss-card"
          style={{ borderLeft: '4px solid #8b5cf6', cursor: 'pointer' }}
          onClick={() => setActiveQueueTab('TRANSFERS')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', letterSpacing: '0.06em' }}>
              SCHEDULED TRANSFERS
            </span>
            <span style={{ fontSize: '1.25rem' }}>⇄</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: '#c084fc' }}>
            {metrics.scheduledTransfersCount} <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>Moves</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-text-primary)', fontWeight: 600 }}>{metrics.transferUnitsScheduled} units relocating</span>
            <span style={{ color: 'var(--ss-text-muted)' }}>• Zone Staging</span>
          </div>
        </div>

        {/* KPI 6: STOCK LEDGER INTEGRITY */}
        <div
          className="ss-card"
          style={{ borderLeft: '4px solid #10b981', cursor: 'pointer' }}
          onClick={() => onNavigateTab && onNavigateTab('ledger')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', letterSpacing: '0.06em' }}>
              LEDGER AUDIT INTEGRITY
            </span>
            <span style={{ fontSize: '1.25rem' }}>🛡️</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
            {metrics.ledgerSyncAccuracy}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-success)', fontWeight: 600 }}>Zero discrepancies</span>
            <span style={{ color: 'var(--ss-text-muted)' }}>• {metrics.totalLedgerEntries.toLocaleString()} signed txs</span>
          </div>
        </div>
      </div>

      {/* Secondary Pulse Bar: Space Capacity & SLA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--ss-bg-surface-elevated)',
          border: '1px solid var(--ss-border)',
          borderRadius: 'var(--ss-radius-md)',
          padding: '0.5rem 1rem',
          marginBottom: 'var(--ss-space-6)',
          fontSize: '0.8125rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <span style={{ color: 'var(--ss-text-muted)' }}>Facility Space Utilization: </span>
            <strong style={{ color: 'var(--ss-text-primary)', fontFamily: 'var(--ss-font-mono)' }}>{metrics.warehouseCapacityPct}%</strong>
            <span style={{ color: 'var(--ss-warning-text)', marginLeft: '6px' }}>(Zone C High)</span>
          </div>
          <span style={{ color: 'var(--ss-border)' }}>|</span>
          <div>
            <span style={{ color: 'var(--ss-text-muted)' }}>Same-Day Dispatch SLA: </span>
            <strong style={{ color: 'var(--ss-success-text)', fontFamily: 'var(--ss-font-mono)' }}>{metrics.dailyFulfillmentSlaPct}%</strong>
          </div>
        </div>

        <div style={{ color: 'var(--ss-text-muted)', fontSize: '0.75rem' }}>
          Clicking any operational card below mutates the warehouse balance and appends an immutable line to the live ledger.
        </div>
      </div>

      {/* =========================================================================
          MAIN WORKSPACE: INTERACTIVE QUEUES (LEFT) + LIVE LEDGER STREAM (RIGHT)
         ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: 'var(--ss-space-6)', alignItems: 'start' }}>
        {/* Left Column: Interactive Operations Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ss-space-6)' }}>
          {/* Operation Category Filter Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid var(--ss-border)',
              paddingBottom: 'var(--ss-space-3)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveQueueTab('WATCHLIST')}
              className="ss-btn"
              style={{
                background: activeQueueTab === 'WATCHLIST' ? 'var(--ss-primary)' : 'var(--ss-bg-surface)',
                color: activeQueueTab === 'WATCHLIST' ? '#ffffff' : 'var(--ss-text-secondary)',
                border: '1px solid var(--ss-border)',
                fontSize: '0.8125rem',
              }}
            >
              ⚠️ Low Stock Watchlist ({products.filter((p) => p.status !== 'IN_STOCK').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveQueueTab('RECEIPTS')}
              className="ss-btn"
              style={{
                background: activeQueueTab === 'RECEIPTS' ? 'var(--ss-success)' : 'var(--ss-bg-surface)',
                color: activeQueueTab === 'RECEIPTS' ? '#ffffff' : 'var(--ss-text-secondary)',
                border: '1px solid var(--ss-border)',
                fontSize: '0.8125rem',
              }}
            >
              📥 Inbound Receipts Queue ({receiptsQueue.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveQueueTab('TRANSFERS')}
              className="ss-btn"
              style={{
                background: activeQueueTab === 'TRANSFERS' ? '#8b5cf6' : 'var(--ss-bg-surface)',
                color: activeQueueTab === 'TRANSFERS' ? '#ffffff' : 'var(--ss-text-secondary)',
                border: '1px solid var(--ss-border)',
                fontSize: '0.8125rem',
              }}
            >
              ⇄ Scheduled Transfers ({transfersQueue.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveQueueTab('DELIVERIES')}
              className="ss-btn"
              style={{
                background: activeQueueTab === 'DELIVERIES' ? 'var(--ss-info)' : 'var(--ss-bg-surface)',
                color: activeQueueTab === 'DELIVERIES' ? '#ffffff' : 'var(--ss-text-secondary)',
                border: '1px solid var(--ss-border)',
                fontSize: '0.8125rem',
              }}
            >
              📤 Pending Deliveries ({deliveriesQueue.length})
            </button>
          </div>

          {/* VIEW 1: LOW STOCK WATCHLIST */}
          {activeQueueTab === 'WATCHLIST' && (
            <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: 'var(--ss-space-4) var(--ss-space-5)',
                  borderBottom: '1px solid var(--ss-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                    Inventory Status & Reorder Watchlist
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                    Bin on-hand counts vs minimum threshold triggers
                  </span>
                </div>
                <button
                  type="button"
                  className="ss-btn ss-btn-ghost"
                  onClick={() => onNavigateTab && onNavigateTab('products')}
                  style={{ fontSize: '0.75rem' }}
                >
                  All Products ({products.length}) →
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                      <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>SKU / PRODUCT</th>
                      <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>LOCATION</th>
                      <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ON-HAND</th>
                      <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>MIN LEVEL</th>
                      <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>STATUS</th>
                      <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const isLow = p.status === 'LOW_STOCK';
                      const isOut = p.status === 'OUT_OF_STOCK';

                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: '1px solid var(--ss-border-subtle)',
                            transition: 'background 150ms ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                              {p.sku}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                              {p.name}
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
                              {p.primaryLocation}
                            </span>
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <span
                              style={{
                                fontFamily: 'var(--ss-font-mono)',
                                fontWeight: 700,
                                fontSize: '0.9375rem',
                                color: isOut ? 'var(--ss-danger-text)' : isLow ? 'var(--ss-warning-text)' : 'var(--ss-text-primary)',
                              }}
                            >
                              {p.onHand}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginLeft: '4px' }}>units</span>
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-muted)' }}>
                            {p.minThreshold}
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            {isOut && <span className="ss-badge ss-badge-danger">Out of Stock</span>}
                            {isLow && <span className="ss-badge ss-badge-warning">Low Stock</span>}
                            {!isLow && !isOut && <span className="ss-badge ss-badge-success">Healthy</span>}
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="ss-btn ss-btn-secondary"
                              onClick={() => {
                                setSelectedSku(p.sku);
                                setModalQty(30);
                                setIsReceiptModalOpen(true);
                              }}
                              style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}
                            >
                              + Receive PO
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: PENDING INBOUND RECEIPTS QUEUE */}
          {activeQueueTab === 'RECEIPTS' && (
            <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: 'var(--ss-space-4) var(--ss-space-5)',
                  borderBottom: '1px solid var(--ss-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(16, 185, 129, 0.05)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ss-success-text)' }}>
                    📥 Inbound Shipments Awaiting Dock Validation
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                    Confirming receipt increases available stock and appends a green ledger entry.
                  </span>
                </div>
              </div>

              {receiptsQueue.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                  All scheduled inbound shipments have been verified and received!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {receiptsQueue.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--ss-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                            {item.poNumber}
                          </span>
                          <span className="ss-badge ss-badge-success">{item.dock}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>ETA: {item.eta}</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                          {item.productName} ({item.sku}) • Supplier: <strong>{item.supplier}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                          Putaway Target: <code>{item.targetLocation}</code>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--ss-success-text)' }}>
                            +{item.expectedQty}
                          </span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>units</div>
                        </div>

                        <button
                          type="button"
                          className="ss-btn ss-btn-primary"
                          onClick={() => handleExecuteReceipt(item.sku, item.expectedQty, item.poNumber)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          Receive & Put Away →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: SCHEDULED INTERNAL TRANSFERS QUEUE */}
          {activeQueueTab === 'TRANSFERS' && (
            <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: 'var(--ss-space-4) var(--ss-space-5)',
                  borderBottom: '1px solid var(--ss-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(139, 92, 246, 0.05)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#c084fc' }}>
                    ⇄ Scheduled Relocations & Buffer Transfers
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                    Executing moves updates bin allocations without altering aggregate totals.
                  </span>
                </div>
              </div>

              {transfersQueue.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                  All scheduled warehouse bin transfers have been completed!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {transfersQueue.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--ss-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                            {item.transferNo}
                          </span>
                          <span className="ss-badge ss-badge-info">{item.priority} PRIORITY</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                          {item.productName} ({item.sku}) • {item.reason}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-primary)', marginTop: '4px' }}>
                          <code>{item.fromLocation}</code> <span style={{ color: '#c084fc' }}>→</span> <code>{item.toLocation}</code>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 800, fontSize: '1.125rem', color: '#c084fc' }}>
                            ⇄ {item.qty}
                          </span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>units</div>
                        </div>

                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => handleExecuteTransfer(item.transferNo, item.sku, item.qty, item.fromLocation, item.toLocation)}
                          style={{ fontSize: '0.75rem', borderColor: '#8b5cf6', color: '#c084fc' }}
                        >
                          Confirm Move →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: PENDING OUTBOUND DELIVERIES QUEUE */}
          {activeQueueTab === 'DELIVERIES' && (
            <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: 'var(--ss-space-4) var(--ss-space-5)',
                  borderBottom: '1px solid var(--ss-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(6, 182, 212, 0.05)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ss-info-text)' }}>
                    📤 Outbound Customer Orders Ready for Dispatch
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                    Dispatching releases reserved items, decrements on-hand count, and records an outbound ledger line.
                  </span>
                </div>
              </div>

              {deliveriesQueue.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                  All pending outbound customer shipments have been dispatched!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {deliveriesQueue.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--ss-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                            {item.orderNo}
                          </span>
                          <span className="ss-badge ss-badge-info">{item.carrier}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Deadline: {item.deadline}</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                          {item.productName} ({item.sku}) • Customer: <strong>{item.customer}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                          Pick Location: <code>{item.sourceLocation}</code>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--ss-danger-text)' }}>
                            -{item.qty}
                          </span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>units</div>
                        </div>

                        <button
                          type="button"
                          className="ss-btn ss-btn-primary"
                          onClick={() => handleExecuteDelivery(item.orderNo, item.sku, item.qty, item.customer)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          Dispatch Order →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Facility Zone Capacity Breakdown */}
          <div className="ss-card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginBottom: '0.25rem' }}>
              Facility Zone Occupancy & Volumetric Density
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: 'var(--ss-space-4)' }}>
              Live volumetric space utilization inside WH-01 Main DC
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {INITIAL_ZONES.map((zone) => {
                const isFullWarning = zone.occupancy > 85;
                return (
                  <div key={zone.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{zone.name}</span>
                      <span style={{ color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)', fontSize: '0.75rem' }}>
                        {zone.capacity} ({zone.occupancy}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: 'var(--ss-bg-app)',
                        borderRadius: 'var(--ss-radius-full)',
                        overflow: 'hidden',
                        border: '1px solid var(--ss-border)',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${zone.occupancy}%`,
                          background: isFullWarning
                            ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                            : 'linear-gradient(90deg, #3b82f6, #10b981)',
                          borderRadius: 'var(--ss-radius-full)',
                          transition: 'width 300ms ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Double-Entry Stock Ledger Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ss-space-6)' }}>
          <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: 'var(--ss-space-4) var(--ss-space-5)',
                borderBottom: '1px solid var(--ss-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                    Live Stock Ledger Stream
                  </h3>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--ss-success)',
                      boxShadow: '0 0 8px var(--ss-success)',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                  Chronological, immutable record of every inventory delta
                </span>
              </div>

              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => onNavigateTab && onNavigateTab('ledger')}
                style={{ fontSize: '0.75rem' }}
              >
                Full Audit Trail →
              </button>
            </div>

            {/* Ledger Stream Entries */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ledger.slice(0, 8).map((tx, idx) => {
                const isReceipt = tx.type === 'RECEIPT';
                const isDelivery = tx.type === 'DELIVERY';
                const isTransfer = tx.type === 'TRANSFER';
                const isAdjustment = tx.type === 'ADJUSTMENT';

                return (
                  <div
                    key={tx.id + idx}
                    style={{
                      padding: '0.875rem 1.25rem',
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--ss-radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          background: isReceipt
                            ? 'var(--ss-success-bg)'
                            : isDelivery
                            ? 'var(--ss-danger-bg)'
                            : isTransfer
                            ? 'var(--ss-info-bg)'
                            : 'var(--ss-warning-bg)',
                          border: `1px solid ${
                            isReceipt
                              ? 'var(--ss-success-border)'
                              : isDelivery
                              ? 'var(--ss-danger-border)'
                              : isTransfer
                              ? 'var(--ss-info-border)'
                              : 'var(--ss-warning-border)'
                          }`,
                        }}
                      >
                        {isReceipt ? '📥' : isDelivery ? '📤' : isTransfer ? '⇄' : 'Δ'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
                            {tx.sku}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              padding: '0.1rem 0.35rem',
                              borderRadius: 'var(--ss-radius-xs)',
                              background: 'var(--ss-bg-app)',
                              border: '1px solid var(--ss-border)',
                              color: 'var(--ss-text-muted)',
                              fontFamily: 'var(--ss-font-mono)',
                            }}
                          >
                            {tx.reference}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '4px' }}>
                          {tx.source} <span style={{ color: 'var(--ss-primary)' }}>→</span> {tx.destination}
                        </div>

                        <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', display: 'flex', gap: '0.5rem' }}>
                          <span>{tx.operator}</span>
                          <span>•</span>
                          <span>{tx.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Numeric Delta & Balance After */}
                    <div style={{ textAlign: 'right' }}>
                      <div
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
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                        Bal: {tx.balanceAfter}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL ACTION MODALS
         ========================================================================= */}

      {/* 1. Inbound Receipt Modal */}
      {isReceiptModalOpen && (
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
                  Process Inbound PO Shipment
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Validate arrival of supplier shipment & increment stock.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setIsReceiptModalOpen(false)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Target Product SKU
                </label>
                <select
                  className="ss-select"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} (Current: {p.onHand} units)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Received Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={modalQty}
                    onChange={(e) => setModalQty(parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Receiving Dock
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value="Bay 01 - Receiving Inbound"
                    readOnly
                    style={{ color: 'var(--ss-text-muted)' }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  background: 'var(--ss-primary-subtle)',
                  borderRadius: 'var(--ss-radius-md)',
                  border: '1px solid var(--ss-primary-border)',
                  fontSize: '0.75rem',
                  color: 'var(--ss-text-primary)',
                }}
              >
                <strong>Consequence:</strong> Confirming this receipt increments on-hand stock and writes an immutable receipt line to the Stock Ledger.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsReceiptModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ss-btn ss-btn-primary"
                  onClick={() => handleExecuteReceipt(selectedSku, modalQty)}
                >
                  Confirm & Receive (+{modalQty} units)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Internal Transfer Modal */}
      {isTransferModalOpen && (
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
                  Schedule Internal Bin Transfer
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Relocate stock between warehouse zones without changing total stock.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setIsTransferModalOpen(false)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Product SKU to Move
                </label>
                <select
                  className="ss-select"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} ({p.onHand} on hand)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Source Location
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value="Rack A-02 (Bulk Bay)"
                    readOnly
                    style={{ color: 'var(--ss-text-muted)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Destination Location
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value="Zone C - Rapid Dispatch"
                    readOnly
                    style={{ color: 'var(--ss-text-muted)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Transfer Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  className="ss-input"
                  value={modalQty}
                  onChange={(e) => setModalQty(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsTransferModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ss-btn ss-btn-primary"
                  onClick={() => handleExecuteTransfer(null, selectedSku, modalQty, 'Rack A-02', 'Zone C - Rapid Dispatch')}
                >
                  Execute Transfer (⇄ {modalQty} units)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cycle Count Adjustment Modal */}
      {isAdjustmentModalOpen && (
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
                  Reconcile physical floor counts with reason code attribution.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setIsAdjustmentModalOpen(false)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Target Product SKU
                </label>
                <select
                  className="ss-select"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} (Current: {p.onHand} units)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Adjustment Delta (e.g. -2 or +5)
                  </label>
                  <input
                    type="number"
                    className="ss-input"
                    value={modalQty}
                    onChange={(e) => setModalQty(parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Reason Code
                  </label>
                  <select
                    className="ss-select"
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                  >
                    <option value="DAMAGED_SCRAP">Physical Damage / Scrap</option>
                    <option value="FOUND_STOCK">Found Unrecorded Stock</option>
                    <option value="CYCLE_COUNT_CORRECTION">Cycle Count Discrepancy</option>
                    <option value="EXPIRED_WARRANTY">Defective Batch Return</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagerDashboard;
