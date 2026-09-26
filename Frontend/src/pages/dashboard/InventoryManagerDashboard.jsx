import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

export const InventoryManagerDashboard = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const {
    products = [],
    receipts = [],
    transfers = [],
    deliveries = [],
    ledger = [],
    metrics = {},
    zones = [],
    activeWarehouse,
    confirmReceipt,
    executeTransfer,
    dispatchDelivery,
    addAdjustment,
    addReceipt,
    addTransfer,
    triggerReorderPO,
  } = useInventory();

  const safeProducts = Array.isArray(products) ? products : [];
  const safeReceipts = Array.isArray(receipts) ? receipts : [];
  const safeTransfers = Array.isArray(transfers) ? transfers : [];
  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
  const safeLedger = Array.isArray(ledger) ? ledger : [];
  const safeZones = Array.isArray(zones) ? zones : [];

  // Active view tab for the operations work center
  const [activeQueueTab, setActiveQueueTab] = useState('WATCHLIST'); // 'WATCHLIST' | 'RECEIPTS' | 'TRANSFERS' | 'DELIVERIES'
  const [searchFilter, setSearchFilter] = useState('');

  // Modal states
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Form input states for Receipt Modal
  const [selectedSku, setSelectedSku] = useState(() => safeProducts[0]?.sku || 'MTR-9002');
  const [modalSupplier, setModalSupplier] = useState('Apex Industrial Components');
  const [modalDock, setModalDock] = useState('Bay 01 - Receiving Inbound');
  const [modalQty, setModalQty] = useState(25);

  // Form input states for Transfer Modal
  const [transferSku, setTransferSku] = useState(() => safeProducts[0]?.sku || 'MTR-9002');
  const [transferFrom, setTransferFrom] = useState('Bay 01 - Receiving');
  const [transferTo, setTransferTo] = useState('Rack A-02 (Storage)');
  const [transferToStore, setTransferToStore] = useState('WH-02 Midwest Regional Logistics Hub');
  const [transferQty, setTransferQty] = useState(15);
  const [transferPriority, setTransferPriority] = useState('HIGH');
  const [transferReason, setTransferReason] = useState('Putaway to Storage Buffer');

  // Form input states for Cycle Adjustment Modal
  const [adjSku, setAdjSku] = useState(() => safeProducts[0]?.sku || 'MTR-9002');
  const [adjCountedQty, setAdjCountedQty] = useState(() => {
    const p = safeProducts[0];
    return p ? p.onHand : 30;
  });
  const [adjReason, setAdjReason] = useState('CYCLE_COUNT_CORRECTION');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. ONE-CLICK / MODAL RECEIPT
  const handleExecuteReceipt = (sku, qty, poNumber) => {
    const targetPo = poNumber || `PO-${Math.floor(9000 + Math.random() * 1000)}`;
    const operator = `${user?.name || 'Sarah Chen'} (Manager)`;
    confirmReceipt(targetPo, qty, operator);
    showToast(`✓ Received +${qty} units of ${sku} (${targetPo})! Stock on-hand and audit ledger updated.`);
    setIsReceiptModalOpen(false);
  };

  // 2. ONE-CLICK / MODAL TRANSFER
  const handleExecuteTransfer = (transferNo) => {
    const operator = `${user?.name || 'Sarah Chen'} (Manager)`;
    executeTransfer(transferNo, operator);
    showToast(`⇄ Transfer ${transferNo} completed! Relocated stock reflected in ledger.`);
    setIsTransferModalOpen(false);
  };

  // 3. ONE-CLICK DELIVERY DISPATCH
  const handleExecuteDelivery = (orderNo) => {
    const operator = `${user?.name || 'Sarah Chen'} (Manager)`;
    dispatchDelivery(orderNo, operator);
    showToast(`📤 Order ${orderNo} dispatched! Stock deducted and recorded in double-entry ledger.`);
  };

  // 4. ONE-CLICK QUICK REORDER PO
  const handleQuickReorder = (sku) => {
    if (triggerReorderPO) {
      const newPo = triggerReorderPO(sku);
      showToast(`⚡ Replenishment PO ${newPo?.poNumber || 'Created'} queued for ${sku}! Appended to Inbound Receipts.`);
      setActiveQueueTab('RECEIPTS');
    } else {
      showToast(`⚡ Reorder PO triggered for ${sku}.`);
    }
  };

  // 5. SCHEDULE NEW LOCATION TRANSFER
  const handleScheduleTransfer = (e) => {
    e.preventDefault();
    const created = addTransfer({
      sku: transferSku,
      qty: parseInt(transferQty, 10) || 10,
      fromLocation: transferFrom,
      toLocation: transferTo,
      fromWarehouse: activeWarehouse?.name || 'WH-01 Main DC (Bay Area)',
      toWarehouse: transferToStore,
      priority: transferPriority,
      reason: transferReason,
      requestedBy: `${user?.name || 'Sarah Chen'} (Manager)`,
    });
    setIsTransferModalOpen(false);
    showToast(`⇄ Scheduled Transfer ${created.transferNo}: Moving ${transferQty} units of ${transferSku} → ${transferTo}`);
    setActiveQueueTab('TRANSFERS');
  };

  // 6. EXECUTE CYCLE COUNT ADJUSTMENT
  const handleExecuteAdjustment = (e) => {
    e.preventDefault();
    const targetProduct = safeProducts.find((p) => p.sku === adjSku);
    if (!targetProduct) return;

    const counted = parseInt(adjCountedQty, 10);
    if (isNaN(counted)) return;

    const delta = counted - targetProduct.onHand;

    addAdjustment({
      sku: adjSku,
      delta,
      reason: adjReason,
      location: targetProduct.primaryLocation,
      operator: `${user?.name || 'Sarah Chen'} (Manager)`,
      approvedBy: `${user?.name || 'Sarah Chen'} (Manager)`,
    });

    showToast(`Δ Cycle adjustment of ${delta > 0 ? '+' : ''}${delta} units approved for ${adjSku}. Reconciled balance: ${counted} units.`);
    setIsAdjustmentModalOpen(false);
  };

  // Search filtering logic across current tab
  const searchLower = searchFilter.toLowerCase().trim();

  const filteredProducts = safeProducts.filter((p) => {
    const isWatchlist = p.status !== 'IN_STOCK';
    const matchesSearch =
      searchLower === '' ||
      p.sku.toLowerCase().includes(searchLower) ||
      p.name.toLowerCase().includes(searchLower) ||
      p.primaryLocation.toLowerCase().includes(searchLower);
    return isWatchlist && matchesSearch;
  });

  const filteredReceipts = safeReceipts.filter((r) => {
    const isPending = r.status !== 'RECEIVED';
    const matchesSearch =
      searchLower === '' ||
      r.poNumber.toLowerCase().includes(searchLower) ||
      r.productName.toLowerCase().includes(searchLower) ||
      r.sku.toLowerCase().includes(searchLower) ||
      (r.supplier && r.supplier.toLowerCase().includes(searchLower)) ||
      (r.dock && r.dock.toLowerCase().includes(searchLower));
    return isPending && matchesSearch;
  });

  const filteredTransfers = safeTransfers.filter((t) => {
    const isPending = t.status !== 'COMPLETED';
    const matchesSearch =
      searchLower === '' ||
      t.transferNo.toLowerCase().includes(searchLower) ||
      t.sku.toLowerCase().includes(searchLower) ||
      t.productName.toLowerCase().includes(searchLower) ||
      t.fromLocation.toLowerCase().includes(searchLower) ||
      t.toLocation.toLowerCase().includes(searchLower) ||
      (t.toWarehouse && t.toWarehouse.toLowerCase().includes(searchLower));
    return isPending && matchesSearch;
  });

  const filteredDeliveries = safeDeliveries.filter((d) => {
    const isPending = d.status !== 'DISPATCHED';
    const matchesSearch =
      searchLower === '' ||
      d.orderNo.toLowerCase().includes(searchLower) ||
      d.sku.toLowerCase().includes(searchLower) ||
      d.productName.toLowerCase().includes(searchLower) ||
      d.customer.toLowerCase().includes(searchLower) ||
      d.destination.toLowerCase().includes(searchLower);
    return isPending && matchesSearch;
  });

  // Calculate product for adjustment preview
  const currentAdjProduct = safeProducts.find((p) => p.sku === adjSku);
  const adjVariance = currentAdjProduct ? (parseInt(adjCountedQty, 10) || 0) - currentAdjProduct.onHand : 0;

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
          <span style={{ color: 'var(--ss-primary)', fontSize: '1.25rem' }}>✓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-primary)' }}>
              Action Executed & Verified
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

      {/* Manager Welcome Banner & Command Ribbon */}
      <div
        className="ss-card"
        style={{
          padding: 'var(--ss-space-5)',
          marginBottom: 'var(--ss-space-5)',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(139, 92, 246, 0.04) 50%, #ffffff 100%)',
          border: '1px solid var(--ss-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--ss-space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--ss-success)',
                boxShadow: '0 0 10px var(--ss-success)',
                display: 'inline-block',
              }}
            />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ss-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Inventory Operations Command
            </h1>
            <span className="ss-badge ss-badge-primary" style={{ fontSize: '0.6875rem' }}>
              MANAGER CONTROL PANEL
            </span>
            <span className="ss-badge ss-badge-success" style={{ fontSize: '0.6875rem' }}>
              PARITY: 99.98% VERIFIED
            </span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Logged in as <strong>{user?.name || 'Sarah Chen'}</strong> (Senior Operations Lead). Overseeing facility inventory, live stock flow, and multi-facility relocations.
          </p>
        </div>

        {/* Global Fast Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => {
              setTransferSku(safeProducts[0]?.sku || 'MTR-9002');
              setIsTransferModalOpen(true);
            }}
            style={{ fontSize: '0.8125rem' }}
          >
            ⇄ Relocate / Shift
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => {
              const p = safeProducts[0];
              setAdjSku(p?.sku || 'MTR-9002');
              setAdjCountedQty(p ? p.onHand : 20);
              setIsAdjustmentModalOpen(true);
            }}
            style={{ fontSize: '0.8125rem' }}
          >
            Δ Floor Recount
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={() => {
              setSelectedSku(safeProducts[0]?.sku || 'MTR-9002');
              setModalQty(25);
              setIsReceiptModalOpen(true);
            }}
            style={{ fontSize: '0.8125rem' }}
          >
            + Inbound PO Receipt
          </button>
        </div>
      </div>

      {/* 6 Interactive Primary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-5)',
        }}
      >
        {/* KPI 1: TOTAL STOCK */}
        <div
          className="ss-stat-card"
          style={{
            cursor: 'pointer',
            borderTop: '3px solid var(--ss-primary)',
          }}
          onClick={() => onNavigateTab && onNavigateTab('products')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Total Stock On-Hand
              </span>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {(metrics.totalStockUnits || 0).toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>units</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-primary">
              📦
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border-subtle)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-success-text)', fontWeight: 700 }}>${(metrics.totalInventoryValuation || 0).toLocaleString()} val</span>
            <span className="ss-badge ss-badge-primary" style={{ fontSize: '0.625rem' }}>+{metrics.valuationGrowthPct || 4.8}% m/m</span>
          </div>
        </div>

        {/* KPI 2: LOW & OUT OF STOCK */}
        <div
          className="ss-stat-card"
          style={{
            cursor: 'pointer',
            borderTop: '3px solid var(--ss-warning)',
            boxShadow: activeQueueTab === 'WATCHLIST' ? '0 0 0 2px var(--ss-warning), var(--ss-shadow-md)' : undefined,
            background: activeQueueTab === 'WATCHLIST' ? 'linear-gradient(180deg, #fffdfa 0%, #ffffff 100%)' : 'var(--ss-bg-surface)',
          }}
          onClick={() => setActiveQueueTab('WATCHLIST')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-warning-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Low & Out of Stock
              </span>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)', marginTop: '0.25rem' }}>
                {metrics.lowStockCount || 0} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>SKUs</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-warning">
              ⚠️
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border-subtle)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-danger-text)', fontWeight: 700 }}>{metrics.criticalOutCount || 0} Stockouts</span>
            <span className="ss-badge ss-badge-warning" style={{ fontSize: '0.625rem' }}>Action Required</span>
          </div>
        </div>

        {/* KPI 3: PENDING INBOUND RECEIPTS */}
        <div
          className="ss-stat-card"
          style={{
            cursor: 'pointer',
            borderTop: '3px solid var(--ss-success)',
            boxShadow: activeQueueTab === 'RECEIPTS' ? '0 0 0 2px var(--ss-success), var(--ss-shadow-md)' : undefined,
            background: activeQueueTab === 'RECEIPTS' ? 'linear-gradient(180deg, #fafffc 0%, #ffffff 100%)' : 'var(--ss-bg-surface)',
          }}
          onClick={() => setActiveQueueTab('RECEIPTS')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Pending Inbound Dock
              </span>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)', marginTop: '0.25rem' }}>
                {metrics.activeInboundPOs || 0} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>POs</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-success">
              📥
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border-subtle)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-text-primary)', fontWeight: 700 }}>+{metrics.inboundUnitsPending || 0} units</span>
            <span className="ss-badge ss-badge-success" style={{ fontSize: '0.625rem' }}>Stage 1 Dock</span>
          </div>
        </div>

        {/* KPI 4: SCHEDULED TRANSFERS */}
        <div
          className="ss-stat-card"
          style={{
            cursor: 'pointer',
            borderTop: '3px solid #7c3aed',
            boxShadow: activeQueueTab === 'TRANSFERS' ? '0 0 0 2px #7c3aed, var(--ss-shadow-md)' : undefined,
            background: activeQueueTab === 'TRANSFERS' ? 'linear-gradient(180deg, #fdfaff 0%, #ffffff 100%)' : 'var(--ss-bg-surface)',
          }}
          onClick={() => setActiveQueueTab('TRANSFERS')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Scheduled Relocations
              </span>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: '#7c3aed', marginTop: '0.25rem' }}>
                {metrics.scheduledTransfersCount || 0} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>Moves</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-violet">
              ⇄
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border-subtle)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-text-primary)', fontWeight: 700 }}>{metrics.transferUnitsScheduled || 0} units</span>
            <span className="ss-badge ss-badge-violet" style={{ fontSize: '0.625rem' }}>Stage 2 Move</span>
          </div>
        </div>

        {/* KPI 5: PENDING DELIVERIES */}
        <div
          className="ss-stat-card"
          style={{
            cursor: 'pointer',
            borderTop: '3px solid var(--ss-info)',
            boxShadow: activeQueueTab === 'DELIVERIES' ? '0 0 0 2px var(--ss-info), var(--ss-shadow-md)' : undefined,
            background: activeQueueTab === 'DELIVERIES' ? 'linear-gradient(180deg, #fafcff 0%, #ffffff 100%)' : 'var(--ss-bg-surface)',
          }}
          onClick={() => setActiveQueueTab('DELIVERIES')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-info-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Outbound Fulfillment
              </span>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-info-text)', marginTop: '0.25rem' }}>
                {metrics.pendingDeliveriesCount || 0} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>Orders</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-info">
              📤
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border-subtle)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-text-primary)', fontWeight: 700 }}>-{metrics.outboundUnitsPending || 0} units</span>
            <span className="ss-badge ss-badge-info" style={{ fontSize: '0.625rem' }}>Stage 3 Ship</span>
          </div>
        </div>

        {/* KPI 6: STOCK LEDGER INTEGRITY */}
        <div
          className="ss-stat-card"
          style={{
            cursor: 'pointer',
            borderTop: '3px solid #059669',
          }}
          onClick={() => onNavigateTab && onNavigateTab('ledger')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Ledger Audit Proof
              </span>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)', marginTop: '0.25rem' }}>
                {metrics.ledgerSyncAccuracy || 99.98}%
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-success">
              🛡️
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border-subtle)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--ss-success-text)', fontWeight: 700 }}>0 Drift Verified</span>
            <span className="ss-badge ss-badge-success" style={{ fontSize: '0.625rem' }}>{(metrics.totalLedgerEntries || safeLedger.length)} txs</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Operations Work Center (Left) + Intelligence Stream (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: 'var(--ss-space-5)', alignItems: 'start' }}>
        {/* Left Column: Interactive Operations Work Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ss-space-5)' }}>
          {/* Work Center Tabs & Search Toolbar */}
          <div className="ss-card" style={{ padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Operation Category Filter Segmented Tabs */}
              <div className="ss-segmented-control">
                <button
                  type="button"
                  onClick={() => setActiveQueueTab('WATCHLIST')}
                  className={`ss-segment-btn ${activeQueueTab === 'WATCHLIST' ? 'active' : ''}`}
                >
                  <span>⚠️ Low Stock</span>
                  <span className={`ss-badge ${activeQueueTab === 'WATCHLIST' ? 'ss-badge-warning' : 'ss-badge-neutral'}`} style={{ fontSize: '0.625rem', padding: '0.05rem 0.4rem' }}>
                    {safeProducts.filter((p) => p.status !== 'IN_STOCK').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQueueTab('RECEIPTS')}
                  className={`ss-segment-btn ${activeQueueTab === 'RECEIPTS' ? 'active' : ''}`}
                >
                  <span>📥 Inbound Dock</span>
                  <span className={`ss-badge ${activeQueueTab === 'RECEIPTS' ? 'ss-badge-success' : 'ss-badge-neutral'}`} style={{ fontSize: '0.625rem', padding: '0.05rem 0.4rem' }}>
                    {safeReceipts.filter((r) => r.status !== 'RECEIVED').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQueueTab('TRANSFERS')}
                  className={`ss-segment-btn ${activeQueueTab === 'TRANSFERS' ? 'active' : ''}`}
                >
                  <span>⇄ Transfers</span>
                  <span className={`ss-badge ${activeQueueTab === 'TRANSFERS' ? 'ss-badge-violet' : 'ss-badge-neutral'}`} style={{ fontSize: '0.625rem', padding: '0.05rem 0.4rem' }}>
                    {safeTransfers.filter((t) => t.status !== 'COMPLETED').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQueueTab('DELIVERIES')}
                  className={`ss-segment-btn ${activeQueueTab === 'DELIVERIES' ? 'active' : ''}`}
                >
                  <span>📤 Deliveries</span>
                  <span className={`ss-badge ${activeQueueTab === 'DELIVERIES' ? 'ss-badge-info' : 'ss-badge-neutral'}`} style={{ fontSize: '0.625rem', padding: '0.05rem 0.4rem' }}>
                    {safeDeliveries.filter((d) => d.status !== 'DISPATCHED').length}
                  </span>
                </button>
              </div>

              {/* Instant Search Bar */}
              <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                <input
                  type="text"
                  className="ss-input"
                  placeholder="Quick filter SKU, PO, Order, Bin..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                />
              </div>
            </div>
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
                  background: 'rgba(245, 158, 11, 0.04)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                    Inventory Health & Reorder Watchlist
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                    Bin quantities below safety buffer threshold. Click "1-Click Reorder" to generate immediate PO.
                  </span>
                </div>
                <button
                  type="button"
                  className="ss-btn ss-btn-ghost"
                  onClick={() => onNavigateTab && onNavigateTab('products')}
                  style={{ fontSize: '0.75rem' }}
                >
                  All Products ({safeProducts.length}) →
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                  <div style={{ fontWeight: 600, color: 'var(--ss-success)' }}>All Products Healthy!</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>No items currently below minimum safety thresholds.</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                        <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>SKU / PRODUCT</th>
                        <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>LOCATION</th>
                        <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>STOCK HEALTH</th>
                        <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ON-HAND / MIN</th>
                        <th style={{ padding: '0.625rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => {
                        const isOut = p.status === 'OUT_OF_STOCK' || p.onHand <= 0;
                        const healthPct = Math.min(100, Math.round((p.onHand / Math.max(1, p.minThreshold)) * 100));

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

                            <td style={{ padding: '0.75rem 1rem', minWidth: '130px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                                {isOut ? (
                                  <span className="ss-badge ss-badge-danger" style={{ fontSize: '0.625rem' }}>Out of Stock</span>
                                ) : (
                                  <span className="ss-badge ss-badge-warning" style={{ fontSize: '0.625rem' }}>Low Stock</span>
                                )}
                                <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>{healthPct}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', background: 'var(--ss-bg-app)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.max(5, healthPct)}%`,
                                    background: isOut ? 'var(--ss-danger)' : 'var(--ss-warning)',
                                  }}
                                />
                              </div>
                            </td>

                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--ss-font-mono)',
                                  fontWeight: 800,
                                  fontSize: '0.9375rem',
                                  color: isOut ? 'var(--ss-danger-text)' : 'var(--ss-warning-text)',
                                }}
                              >
                                {p.onHand}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}> / {p.minThreshold}</span>
                            </td>

                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  className="ss-btn ss-btn-secondary"
                                  onClick={() => handleQuickReorder(p.sku)}
                                  style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', color: 'var(--ss-warning)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                                  title="Immediately trigger replenishment PO"
                                >
                                  ⚡ Reorder
                                </button>
                                <button
                                  type="button"
                                  className="ss-btn ss-btn-primary"
                                  onClick={() => {
                                    setSelectedSku(p.sku);
                                    setModalQty(Math.max(25, (p.minThreshold * 2) - p.onHand));
                                    setIsReceiptModalOpen(true);
                                  }}
                                  style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}
                                >
                                  + Receive
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
                  background: 'rgba(16, 185, 129, 0.04)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--ss-success-text)' }}>
                    📥 Inbound Shipments Awaiting Dock Validation
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                    Verify arrival count to book inventory into primary stock and record an immutable ledger entry.
                  </span>
                </div>
                <button
                  type="button"
                  className="ss-btn ss-btn-ghost"
                  onClick={() => onNavigateTab && onNavigateTab('receipts')}
                  style={{ fontSize: '0.75rem' }}
                >
                  All Receipts Hub →
                </button>
              </div>

              {filteredReceipts.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                  <div style={{ fontWeight: 600, color: 'var(--ss-success)' }}>All Inbound POs Received & Processed!</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>No shipments currently waiting at receiving bays.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredReceipts.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--ss-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                            {item.poNumber}
                          </span>
                          <span className="ss-badge ss-badge-success">{item.dock || 'Bay 01'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>ETA: {item.eta || 'Today'}</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                          {item.productName} ({item.sku}) • Supplier: <strong>{item.supplier}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                          Target Storage: <code>{item.targetLocation || 'Rack A-02'}</code>
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
                          style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                        >
                          ✓ Verify & Receive
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
                  background: 'rgba(139, 92, 246, 0.04)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#7c3aed' }}>
                    ⇄ Scheduled Location Moves & Inter-Store Shifts
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                    Physical putaway and store transfers. Confirming shifts items to target location.
                  </span>
                </div>
                <button
                  type="button"
                  className="ss-btn ss-btn-ghost"
                  onClick={() => onNavigateTab && onNavigateTab('transfers')}
                  style={{ fontSize: '0.75rem' }}
                >
                  All Transfers Hub →
                </button>
              </div>

              {filteredTransfers.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                  <div style={{ fontWeight: 600, color: '#7c3aed' }}>All Location Moves Completed!</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>No internal relocations currently in queue.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredTransfers.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--ss-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                            {item.transferNo}
                          </span>
                          <span className={`ss-badge ${item.priority === 'HIGH' ? 'ss-badge-warning' : 'ss-badge-neutral'}`}>
                            {item.priority}
                          </span>
                          {item.linkedPo && (
                            <span className="ss-badge ss-badge-violet" style={{ fontSize: '0.625rem' }}>PO: {item.linkedPo}</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                          {item.productName} ({item.sku}) • Reason: <em>{item.reason}</em>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <code>{item.fromLocation}</code>
                          <span style={{ color: '#7c3aed', fontWeight: 800 }}>→</span>
                          <code>{item.toLocation}</code>
                          {item.toWarehouse && (
                            <span style={{ color: 'var(--ss-text-muted)' }}>[{item.toWarehouse}]</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 800, fontSize: '1.125rem', color: '#7c3aed' }}>
                            ⇄ {item.qty}
                          </span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>units</div>
                        </div>

                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => handleExecuteTransfer(item.transferNo)}
                          style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', borderColor: '#c4b5fd', color: '#6d28d9', background: '#f5f3ff' }}
                        >
                          ✓ Confirm Move
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: PENDING DELIVERIES QUEUE */}
          {activeQueueTab === 'DELIVERIES' && (
            <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: 'var(--ss-space-4) var(--ss-space-5)',
                  borderBottom: '1px solid var(--ss-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(6, 182, 212, 0.04)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--ss-info-text)' }}>
                    📤 Outbound Delivery Pick & Dispatch Queue
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                    Dispatched orders deduct on-hand stock and sign the outbound customer ledger line.
                  </span>
                </div>
                <button
                  type="button"
                  className="ss-btn ss-btn-ghost"
                  onClick={() => onNavigateTab && onNavigateTab('deliveries')}
                  style={{ fontSize: '0.75rem' }}
                >
                  All Deliveries Hub →
                </button>
              </div>

              {filteredDeliveries.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                  <div style={{ fontWeight: 600, color: 'var(--ss-info-text)' }}>All Orders Dispatched!</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>No shipments waiting in dispatch staging corridor.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredDeliveries.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--ss-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                            {item.orderNo}
                          </span>
                          <span className="ss-badge ss-badge-info">{item.carrier || 'Standard Freight'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>{item.deadline || 'Today'}</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                          {item.productName} ({item.sku}) • Customer: <strong>{item.customer}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                          Destination: <strong>{item.destination}</strong> (Pick: <code>{item.sourceLocation}</code>)
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
                          onClick={() => handleExecuteDelivery(item.orderNo)}
                          style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', background: '#0284c7', borderColor: '#0369a1' }}
                        >
                          ✓ Dispatch Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Facility Intelligence & Live Double-Entry Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ss-space-5)' }}>
          {/* Facility Zone Capacity Breakdown */}
          <div className="ss-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                Facility Volumetric Capacity & Zones
              </h3>
              <span className="ss-badge ss-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                {activeWarehouse?.name?.split(' ')[0] || 'WH-01'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: 'var(--ss-space-4)' }}>
              Real-time pallet rack density and floor footprint.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {safeZones.map((zone) => {
                const isFullWarning = zone.occupancy > 85;
                const isMedium = zone.occupancy > 60;
                return (
                  <div key={zone.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{zone.name}</span>
                      <span style={{ color: isFullWarning ? 'var(--ss-danger-text)' : isMedium ? 'var(--ss-warning-text)' : 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
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
                            : isMedium
                            ? 'linear-gradient(90deg, #3b82f6, #f59e0b)'
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

          {/* Real-Time Double-Entry Stock Ledger Stream */}
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
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                    Live Stock Ledger Audit Stream
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
                <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  Immutable record of every verified physical stock delta.
                </span>
              </div>

              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => onNavigateTab && onNavigateTab('ledger')}
                style={{ fontSize: '0.75rem' }}
              >
                Full Ledger →
              </button>
            </div>

            {/* Ledger Stream Entries */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {safeLedger.slice(0, 6).map((tx, idx) => {
                const isReceipt = tx.type === 'RECEIPT';
                const isDelivery = tx.type === 'DELIVERY';
                const isTransfer = tx.type === 'TRANSFER';

                return (
                  <div
                    key={tx.id ? tx.id + idx : idx}
                    style={{
                      padding: '0.75rem 1.25rem',
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
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--ss-radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8125rem',
                          background: isReceipt
                            ? 'var(--ss-success-bg)'
                            : isDelivery
                            ? 'var(--ss-danger-bg)'
                            : isTransfer
                            ? 'rgba(139, 92, 246, 0.15)'
                            : 'var(--ss-warning-bg)',
                          border: `1px solid ${
                            isReceipt
                              ? 'var(--ss-success-border)'
                              : isDelivery
                              ? 'var(--ss-danger-border)'
                              : isTransfer
                              ? 'rgba(139, 92, 246, 0.35)'
                              : 'var(--ss-warning-border)'
                          }`,
                        }}
                      >
                        {isReceipt ? '📥' : isDelivery ? '📤' : isTransfer ? '⇄' : 'Δ'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--ss-font-mono)', fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
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

                        <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '2px' }}>
                          {tx.source} <span style={{ color: 'var(--ss-primary)' }}>→</span> {tx.destination}
                        </div>

                        <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', display: 'flex', gap: '0.4rem' }}>
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
                            ? '#7c3aed'
                            : 'var(--ss-warning-text)',
                        }}
                      >
                        {isReceipt && `+${tx.qtyChange}`}
                        {isDelivery && `${tx.qtyChange}`}
                        {isTransfer && `⇄ ${tx.qtyChange}`}
                        {!isReceipt && !isDelivery && !isTransfer && `${tx.qtyChange > 0 ? '+' : ''}${tx.qtyChange}`}
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

      {/* MODAL 1: INBOUND RECEIPT PROCESSOR */}
      {isReceiptModalOpen && (
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
                  Process Inbound PO Shipment
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Validate arrival of supplier shipment & increment active stock.
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Target Product SKU
                </label>
                <select
                  className="ss-select"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  {safeProducts.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} (Current: {p.onHand} units at {p.primaryLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Supplier / Vendor
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={modalSupplier}
                  onChange={(e) => setModalSupplier(e.target.value)}
                  placeholder="e.g. Apex Industrial Components"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                    value={modalDock}
                    onChange={(e) => setModalDock(e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: 'var(--ss-radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.75rem',
                  color: 'var(--ss-text-secondary)',
                }}
              >
                <strong style={{ color: 'var(--ss-success-text)' }}>Consequence:</strong> Validating this shipment increments catalog stock by <strong>+{modalQty} units</strong> and writes an immutable receipt transaction to the Stock Ledger.
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

      {/* MODAL 2: SCHEDULE TRANSFER / STORE SHIFT */}
      {isTransferModalOpen && (
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
              border: '1px solid #8b5cf6',
              boxShadow: 'var(--ss-shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Schedule Relocation / Store Shift
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Move parts between docks, high-bay racks, or inter-facility stores.
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

            <form onSubmit={handleScheduleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Target Product SKU
                </label>
                <select
                  className="ss-select"
                  value={transferSku}
                  onChange={(e) => {
                    setTransferSku(e.target.value);
                    const p = safeProducts.find((prod) => prod.sku === e.target.value);
                    if (p) setTransferFrom(p.primaryLocation);
                  }}
                >
                  {safeProducts.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} ({p.onHand} on hand at {p.primaryLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Target Destination Facility / Store
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={transferToStore}
                  onChange={(e) => setTransferToStore(e.target.value)}
                  placeholder="e.g. WH-02 Midwest Regional Logistics Hub"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Origin Bin / Dock
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Destination Bin
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Quantity to Relocate
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={transferQty}
                    onChange={(e) => setTransferQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Priority
                  </label>
                  <select
                    className="ss-select"
                    value={transferPriority}
                    onChange={(e) => setTransferPriority(e.target.value)}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High (Urgent Staging)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Relocation Reason
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
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

      {/* MODAL 3: CYCLE COUNT ADJUSTMENT */}
      {isAdjustmentModalOpen && (
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
                  Log Inventory Floor Count / Adjustment
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Reconcile physical warehouse counts with reason-code audit attribution.
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

            <form onSubmit={handleExecuteAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Target Product SKU
                </label>
                <select
                  className="ss-select"
                  value={adjSku}
                  onChange={(e) => {
                    setAdjSku(e.target.value);
                    const p = safeProducts.find((prod) => prod.sku === e.target.value);
                    if (p) setAdjCountedQty(p.onHand);
                  }}
                >
                  {safeProducts.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} (Current System Count: {p.onHand} units)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Physical Floor Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="ss-input"
                    value={adjCountedQty}
                    onChange={(e) => setAdjCountedQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Calculated Variance Delta
                  </label>
                  <div
                    style={{
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 0.75rem',
                      borderRadius: 'var(--ss-radius-sm)',
                      background: 'var(--ss-bg-app)',
                      border: '1px solid var(--ss-border)',
                      fontFamily: 'var(--ss-font-mono)',
                      fontWeight: 800,
                      color: adjVariance === 0 ? 'var(--ss-success)' : adjVariance > 0 ? 'var(--ss-success-text)' : 'var(--ss-danger-text)',
                    }}
                  >
                    {adjVariance > 0 ? `+${adjVariance}` : adjVariance} units
                  </div>
                </div>
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
                  <option value="CYCLE_COUNT_CORRECTION">Cycle Count Floor Recount</option>
                  <option value="DAMAGED_SCRAP">Physical Scrap / Damaged Goods</option>
                  <option value="FOUND_STOCK">Found Unrecorded Pallet</option>
                  <option value="EXPIRED_WARRANTY">Defective Batch Quarantine</option>
                </select>
              </div>

              <div
                style={{
                  padding: '0.625rem 0.75rem',
                  background: 'var(--ss-bg-app)',
                  borderRadius: 'var(--ss-radius-sm)',
                  border: '1px solid var(--ss-border)',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ss-text-muted)' }}>
                  <span>Authorized Operator:</span>
                  <strong style={{ color: 'var(--ss-text-primary)' }}>{user?.name || 'Sarah Chen'} (Manager)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ss-text-muted)', marginTop: '4px' }}>
                  <span>Ledger Consequence:</span>
                  <span style={{ color: 'var(--ss-warning-text)', fontWeight: 600 }}>Adjust balance to {adjCountedQty} units</span>
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
                  Authorize Adjustment
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
