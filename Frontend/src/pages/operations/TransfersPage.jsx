import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const TransfersPage = ({ onNavigateTab }) => {
  const {
    transfers = [],
    products = [],
    receipts = [],
    warehouses = [],
    activeWarehouse,
    addTransfer,
    editTransfer,
    deleteTransfer,
    executeTransfer,
    shiftReceiptToLocation,
  } = useInventory();

  const safeTransfers = Array.isArray(transfers) ? transfers : [];
  const safeReceipts = Array.isArray(receipts) ? receipts : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeWarehouses = Array.isArray(warehouses) ? warehouses : [];

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [shiftingReceipt, setShiftingReceipt] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // New transfer form with Inbound PO Linking
  const [sourceType, setSourceType] = useState('RECEIPT'); // 'RECEIPT' | 'STORAGE'
  const [selectedPo, setSelectedPo] = useState(() => (safeReceipts[0]?.poNumber || ''));
  const [newSku, setNewSku] = useState(() => (safeReceipts[0]?.sku || safeProducts[0]?.sku || 'MTR-9002'));
  const [newQty, setNewQty] = useState(() => (safeReceipts[0]?.expectedQty || safeReceipts[0]?.receivedQty || 15));
  const [newFrom, setNewFrom] = useState(() => (safeReceipts[0]?.dock || 'Bay 01 - Receiving'));
  const [newTo, setNewTo] = useState('Rack A-02 (Storage)');
  const [newToWarehouse, setNewToWarehouse] = useState(() => (safeWarehouses[1]?.name || 'WH-02 Midwest Regional Logistics Hub'));
  const [newReason, setNewReason] = useState('Inbound Putaway & Store Shift');
  const [newPriority, setNewPriority] = useState('HIGH');

  // Quick shift receipt modal form
  const [quickShiftStore, setQuickShiftStore] = useState(() => (safeWarehouses[1]?.name || 'WH-02 Midwest Regional Logistics Hub'));
  const [quickShiftLocation, setQuickShiftLocation] = useState('Rack A-02 (Storage)');
  const [quickShiftQty, setQuickShiftQty] = useState(15);
  const [quickShiftReason, setQuickShiftReason] = useState('Putaway and Store Shift');

  // Edit transfer form
  const [editFrom, setEditFrom] = useState('');
  const [editTo, setEditTo] = useState('');
  const [editQty, setEditQty] = useState(10);
  const [editReason, setEditReason] = useState('');
  const [editPriority, setEditPriority] = useState('HIGH');

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleSelectPo = (poNumber) => {
    setSelectedPo(poNumber);
    const r = safeReceipts.find((rec) => rec.poNumber === poNumber || rec.id === poNumber);
    if (r) {
      setNewSku(r.sku);
      setNewQty(r.expectedQty || r.receivedQty || 15);
      setNewFrom(r.dock || 'Bay 01 - Receiving');
      setNewReason(`Putaway from PO ${r.poNumber}`);
    }
  };

  const handleSelectProduct = (sku) => {
    setNewSku(sku);
    const p = safeProducts.find((prod) => prod.sku === sku);
    if (p) {
      setNewFrom(p.primaryLocation || 'Rack A-02');
      setNewQty(Math.min(15, p.onHand || 10));
    }
  };

  const handleScheduleTransfer = (e) => {
    e.preventDefault();
    const created = addTransfer({
      sku: newSku,
      qty: parseInt(newQty, 10) || 10,
      fromLocation: newFrom,
      toLocation: newTo,
      fromWarehouse: activeWarehouse?.name || 'WH-01 Main DC (Bay Area)',
      toWarehouse: newToWarehouse,
      linkedPo: sourceType === 'RECEIPT' ? selectedPo : null,
      priority: newPriority,
      reason: newReason,
    });
    setIsModalOpen(false);
    showToast(`⇄ Transfer ${created.transferNo} scheduled! Relocating ${newQty} units from ${newFrom} → ${newTo} [${newToWarehouse}].`);
  };

  const openQuickShiftModal = (r) => {
    setShiftingReceipt(r);
    setQuickShiftQty(r.expectedQty || r.receivedQty || 15);
    setQuickShiftLocation(r.targetLocation || 'Rack A-02 (Storage)');
    setQuickShiftStore(safeWarehouses[1]?.name || 'WH-02 Midwest Regional Logistics Hub');
  };

  const handleExecuteQuickShift = (e) => {
    e.preventDefault();
    if (!shiftingReceipt) return;

    shiftReceiptToLocation({
      poNumber: shiftingReceipt.poNumber,
      sku: shiftingReceipt.sku,
      qty: parseInt(quickShiftQty, 10) || shiftingReceipt.expectedQty,
      fromLocation: shiftingReceipt.dock || 'Bay 01 - Receiving',
      toLocation: quickShiftLocation,
      toWarehouse: quickShiftStore,
      reason: quickShiftReason,
      executeNow: true,
    });

    const targetPo = shiftingReceipt.poNumber;
    setShiftingReceipt(null);
    showToast(`✓ Relocated ${quickShiftQty} units from Inbound PO ${targetPo} to ${quickShiftStore} (${quickShiftLocation})!`);
  };

  const handleCompleteTransfer = (transferNo, sku, qty, toLocation) => {
    executeTransfer(transferNo, 'Sarah Chen (Manager)');
    showToast(`✓ Transfer ${transferNo} completed! Relocated ${qty} units of ${sku} to ${toLocation}.`);
  };

  const openEditModal = (t) => {
    setEditingTransfer(t);
    setEditFrom(t.fromLocation);
    setEditTo(t.toLocation);
    setEditQty(t.qty);
    setEditReason(t.reason);
    setEditPriority(t.priority);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingTransfer) return;

    editTransfer(editingTransfer.id, {
      fromLocation: editFrom,
      toLocation: editTo,
      qty: parseInt(editQty, 10) || editingTransfer.qty,
      reason: editReason,
      priority: editPriority,
    });

    showToast(`✓ Transfer ${editingTransfer.transferNo} updated!`);
    setEditingTransfer(null);
  };

  const handleDeleteTransfer = (t) => {
    if (window.confirm(`Delete internal transfer ${t.transferNo}?`)) {
      deleteTransfer(t.id);
      showToast(`🗑 Transfer ${t.transferNo} deleted.`);
    }
  };

  // Filter transfers by status and search keyword
  const filteredTransfers = safeTransfers.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' ? true : t.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      (t.transferNo && t.transferNo.toLowerCase().includes(searchLower)) ||
      (t.sku && t.sku.toLowerCase().includes(searchLower)) ||
      (t.productName && t.productName.toLowerCase().includes(searchLower)) ||
      (t.fromLocation && t.fromLocation.toLowerCase().includes(searchLower)) ||
      (t.toLocation && t.toLocation.toLowerCase().includes(searchLower)) ||
      (t.toWarehouse && t.toWarehouse.toLowerCase().includes(searchLower)) ||
      (t.reason && t.reason.toLowerCase().includes(searchLower)) ||
      (t.linkedPo && t.linkedPo.toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

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
          <span style={{ color: '#7c3aed', fontSize: '1.25rem' }}>⇄</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#7c3aed' }}>
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
            <span className="ss-badge ss-badge-success">● AUDITED LOGS</span>
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
        <div className="ss-stat-card" style={{ borderTop: '3px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Scheduled Moves
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: '#7c3aed', marginTop: '0.25rem' }}>
                {safeTransfers.filter((t) => t.status === 'SCHEDULED').length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>moves</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-violet">
              ⇄
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Internal bay & rack shifts
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-warning-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                High Priority Staging
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)', marginTop: '0.25rem' }}>
                {safeTransfers.filter((t) => t.priority === 'HIGH' && t.status === 'SCHEDULED').length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>urgent</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-warning">
              ⚡
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Immediate forklift putaway
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Completed This Shift
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)', marginTop: '0.25rem' }}>
                {safeTransfers.filter((t) => t.status === 'COMPLETED').length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>done</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-success">
              ✓
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Relocations signed & audited
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Units In Relocation
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '0.25rem' }}>
                {safeTransfers.reduce((acc, t) => acc + (t.qty || 0), 0)} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>units</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-primary">
              📦
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Active volume in motion
          </div>
        </div>
      </div>

      {/* Synchronized Inbound Receipts Ready to Shift Banner */}
      <div
        className="ss-card"
        style={{
          padding: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-5)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.04))',
          border: '1px solid rgba(139, 92, 246, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.125rem' }}>📥</span>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                Inbound Shipments Available for Relocation & Inter-Store Shift
              </h2>
              <span className="ss-badge ss-badge-primary">
                {safeReceipts.length} Inbound POs
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
              Live synchronized dock receipts. Click "Shift to Store / Rack" on any shipment below to immediately move inventory to another warehouse or storage bay.
            </p>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              className="ss-btn ss-btn-secondary"
              onClick={() => onNavigateTab('receipts')}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              + Inbound Receipts Hub →
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
          {safeReceipts.map((r) => {
            const isReceived = r.status === 'RECEIVED';
            const isTransferred = !!r.transferredTo;

            return (
              <div
                key={r.id}
                style={{
                  background: 'var(--ss-bg-surface)',
                  border: isTransferred ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid var(--ss-border)',
                  borderRadius: 'var(--ss-radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 800, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
                      {r.poNumber}
                    </span>
                    <span
                      className={`ss-badge ${
                        isTransferred
                          ? 'ss-badge-neutral'
                          : isReceived
                          ? 'ss-badge-success'
                          : 'ss-badge-warning'
                      }`}
                      style={{ fontSize: '0.625rem' }}
                    >
                      {isTransferred
                        ? '✓ Shifted to Store'
                        : isReceived
                        ? 'Docked & Counted'
                        : 'Incoming Dock'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ss-text-primary)', marginBottom: '2px' }}>
                    {r.productName}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                    SKU: <strong>{r.sku}</strong> • Dock: <strong>{r.dock || 'Bay 01'}</strong>
                  </div>

                  {isTransferred && (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.6875rem', color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '2px 6px', borderRadius: '4px' }}>
                      Shifted: <strong>{r.transferredTo}</strong> [{r.shiftedToWarehouse || 'Midwest Store'}]
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
                  <span style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 800, fontSize: '0.875rem', color: '#7c3aed' }}>
                    +{r.expectedQty || r.receivedQty || 20} Units
                  </span>

                  <button
                    type="button"
                    className="ss-btn"
                    style={{
                      fontSize: '0.6875rem',
                      padding: '0.25rem 0.55rem',
                      background: '#f5f3ff',
                      border: '1px solid #c4b5fd',
                      color: '#6d28d9',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={() => openQuickShiftModal(r)}
                  >
                    ⇄ Shift to Store / Rack
                  </button>
                </div>
              </div>
            );
          })}
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
            placeholder="Search by Transfer #, SKU, Zone, Store, or Reason..."
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
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                    No location transfers found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((t) => {
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
                          By: {t.requestedBy || 'Sarah Chen'}
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{t.productName}</div>
                        <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                          {t.sku}
                        </div>
                        {t.linkedPo && (
                          <div style={{ marginTop: '3px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.6875rem', color: '#6d28d9', background: '#f5f3ff', padding: '1px 5px', borderRadius: '4px', border: '1px solid #ddd6fe' }}>
                            <span>Inbound:</span>
                            <strong>{t.linkedPo}</strong>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                          <code>{t.fromLocation}</code>
                          <span style={{ color: '#7c3aed', fontWeight: 700 }}>→</span>
                          <code>{t.toLocation}</code>
                        </div>
                        {t.toWarehouse && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                            Target Store: <strong>{t.toWarehouse}</strong>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <span
                          style={{
                            fontFamily: 'var(--ss-font-mono)',
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: '#7c3aed',
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

                      {/* CRUD ACTIONS */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', flexWrap: 'nowrap' }}>
                          <button
                            type="button"
                            className="ss-btn ss-btn-secondary"
                            onClick={() => isScheduled && handleCompleteTransfer(t.transferNo, t.sku, t.qty, t.toLocation)}
                            disabled={!isScheduled}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderColor: '#c4b5fd', color: '#6d28d9', background: '#f5f3ff', opacity: !isScheduled ? 0.35 : 1, cursor: !isScheduled ? 'not-allowed' : 'pointer' }}
                            title={isScheduled ? 'Confirm this stock move and update ledger' : 'Transfer already completed or cancelled'}
                          >
                            Confirm Move →
                          </button>

                          <button
                            type="button"
                            className="ss-btn ss-btn-secondary"
                            onClick={() => openEditModal(t)}
                            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.45rem' }}
                            title="Edit Location Transfer"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="ss-btn ss-btn-danger"
                            onClick={() => handleDeleteTransfer(t)}
                            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.45rem' }}
                            title="Delete Transfer"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
                  Schedule Transfer & Store Shift
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Relocate inventory between docks, storage racks, or inter-facility stores.
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
              {/* Origin Selection: Inbound Receipt vs Storage */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Source Inventory Origin
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType('RECEIPT');
                      if (safeReceipts.length > 0) handleSelectPo(safeReceipts[0].poNumber);
                    }}
                    className={`ss-btn ${sourceType === 'RECEIPT' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.4rem',
                      justifyContent: 'center',
                      background: sourceType === 'RECEIPT' ? '#8b5cf6' : 'transparent',
                      borderColor: sourceType === 'RECEIPT' ? '#7c3aed' : 'var(--ss-border)',
                    }}
                  >
                    📦 Inbound PO Arrival
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType('STORAGE');
                      if (safeProducts.length > 0) handleSelectProduct(safeProducts[0].sku);
                    }}
                    className={`ss-btn ${sourceType === 'STORAGE' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.4rem',
                      justifyContent: 'center',
                      background: sourceType === 'STORAGE' ? '#8b5cf6' : 'transparent',
                      borderColor: sourceType === 'STORAGE' ? '#7c3aed' : 'var(--ss-border)',
                    }}
                  >
                    🏢 Existing Rack Storage
                  </button>
                </div>

                {sourceType === 'RECEIPT' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                      Select Inbound PO Shipment:
                    </label>
                    <select
                      className="ss-select"
                      value={selectedPo}
                      onChange={(e) => handleSelectPo(e.target.value)}
                    >
                      {safeReceipts.map((r) => (
                        <option key={r.id} value={r.poNumber}>
                          {r.poNumber} — {r.productName} ({r.expectedQty || r.receivedQty} units at {r.dock || 'Bay 01'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                      Select Catalog SKU:
                    </label>
                    <select
                      className="ss-select"
                      value={newSku}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                    >
                      {safeProducts.map((p) => (
                        <option key={p.sku} value={p.sku}>
                          {p.sku} — {p.name} ({p.onHand} on hand at {p.primaryLocation})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Destination Facility / Store */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Target Destination Store / Facility
                </label>
                <select
                  className="ss-select"
                  value={newToWarehouse}
                  onChange={(e) => setNewToWarehouse(e.target.value)}
                >
                  {safeWarehouses.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} ({w.city})
                    </option>
                  ))}
                  <option value="Store #104 Downtown Retail Branch">Store #104 Downtown Retail Branch (Direct Sales)</option>
                  <option value="Distribution Depot B (Overstock Staging)">Distribution Depot B (Overstock Staging)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Source Location (Dock / Bin)
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
                    Destination Bin / Area
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

      {/* Edit Transfer Modal */}
      {editingTransfer && (
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
                  Edit Transfer: {editingTransfer.transferNo}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Modify locations, priority, or relocation volume.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setEditingTransfer(null)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Source Bin
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editFrom}
                    onChange={(e) => setEditFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Destination Bin
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editTo}
                    onChange={(e) => setEditTo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Priority
                  </label>
                  <select
                    className="ss-select"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Reason Note
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingTransfer(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary" style={{ background: '#8b5cf6', borderColor: '#7c3aed' }}>
                  Save Transfer Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Shift Modal for Inbound PO Relocation & Inter-Store Shift */}
      {shiftingReceipt && (
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
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#7c3aed' }}>⇄</span>
                  Shift Inbound PO: {shiftingReceipt.poNumber}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                  Move incoming dock inventory into storage rack or dispatch to another store.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setShiftingReceipt(null)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0.625rem 0.75rem', background: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-border)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--ss-text-muted)' }}>Product & SKU:</span>
                <span style={{ fontWeight: 700, color: 'var(--ss-text-primary)' }}>{shiftingReceipt.productName} ({shiftingReceipt.sku})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                <span style={{ color: 'var(--ss-text-muted)' }}>Receiving Origin:</span>
                <span style={{ color: 'var(--ss-warning)', fontWeight: 600 }}>{shiftingReceipt.dock || 'Bay 01 - Receiving'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                <span style={{ color: 'var(--ss-text-muted)' }}>Docked Quantity:</span>
                <span style={{ color: '#7c3aed', fontWeight: 800 }}>+{shiftingReceipt.expectedQty || shiftingReceipt.receivedQty || 15} Units</span>
              </div>
            </div>

            <form onSubmit={handleExecuteQuickShift} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Target Destination Facility / Store
                </label>
                <select
                  className="ss-select"
                  value={quickShiftStore}
                  onChange={(e) => setQuickShiftStore(e.target.value)}
                  required
                >
                  {safeWarehouses.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} ({w.city})
                    </option>
                  ))}
                  <option value="Store #104 Downtown Retail Branch">Store #104 Downtown Retail Branch (Direct Sales)</option>
                  <option value="Distribution Depot B (Overstock Staging)">Distribution Depot B (Overstock Staging)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Target Bin / Area
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={quickShiftLocation}
                    onChange={(e) => setQuickShiftLocation(e.target.value)}
                    placeholder="e.g. Rack A-02, Vault 01"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Quantity to Shift
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={quickShiftQty}
                    onChange={(e) => setQuickShiftQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Relocation Reason
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={quickShiftReason}
                  onChange={(e) => setQuickShiftReason(e.target.value)}
                  placeholder="e.g. Putaway and Inter-Facility Store replenishment"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setShiftingReceipt(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ background: '#8b5cf6', borderColor: '#7c3aed' }}
                >
                  Confirm & Relocate Now →
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
