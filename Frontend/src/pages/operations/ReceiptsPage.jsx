import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import Pagination, { usePagination } from '../../components/common/Pagination';

export const ReceiptsPage = ({ onNavigateTab }) => {
  const { receipts, products, warehouses, activeWarehouse, addReceipt, editReceipt, deleteReceipt, confirmReceipt, shiftReceiptToLocation } = useInventory();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const { page, itemsPerPage, setPage, setItemsPerPage, paginate, resetPage } = usePagination(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [shiftingReceipt, setShiftingReceipt] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [toastAction, setToastAction] = useState(null);

  // New PO receipt form
  const [newPo, setNewPo] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [newSku, setNewSku] = useState(products[0]?.sku || 'MTR-9002');
  const [newQty, setNewQty] = useState(25);
  const [newDock, setNewDock] = useState('Bay 01 - Receiving');

  // Edit PO form
  const [editSupplier, setEditSupplier] = useState('');
  const [editQty, setEditQty] = useState(20);
  const [editDock, setEditDock] = useState('');
  const [editCarrier, setEditCarrier] = useState('');

  // Shift to store / rack form
  const [shiftStore, setShiftStore] = useState(warehouses[1]?.name || 'WH-02 Midwest Regional Logistics Hub');
  const [shiftLocation, setShiftLocation] = useState('Rack A-02 (Storage)');
  const [shiftQty, setShiftQty] = useState(20);
  const [shiftReason, setShiftReason] = useState('Putaway and Inter-Facility Store replenishment');

  const showToast = (msg, action = null) => {
    setSuccessToast(msg);
    setToastAction(action);
    setTimeout(() => {
      setSuccessToast(null);
      setToastAction(null);
    }, 6000);
  };

  const openShiftModal = (r) => {
    setShiftingReceipt(r);
    setShiftQty(r.expectedQty || r.receivedQty || 20);
    setShiftLocation(r.targetLocation || 'Rack A-02 (Storage)');
    setShiftStore(warehouses[1]?.name || 'WH-02 Midwest Regional Logistics Hub');
  };

  const handleConfirmShift = (e) => {
    e.preventDefault();
    if (!shiftingReceipt) return;

    const tr = shiftReceiptToLocation({
      poNumber: shiftingReceipt.poNumber,
      sku: shiftingReceipt.sku,
      qty: parseInt(shiftQty, 10) || shiftingReceipt.expectedQty,
      fromLocation: shiftingReceipt.dock || 'Bay 01 - Receiving',
      toLocation: shiftLocation,
      toWarehouse: shiftStore,
      reason: shiftReason,
      executeNow: true,
    });

    const targetPo = shiftingReceipt.poNumber;
    setShiftingReceipt(null);
    showToast(
      `✓ Successfully shifted ${shiftQty} units of ${shiftingReceipt.sku} to ${shiftStore} (${shiftLocation})!`,
      { label: 'View in Internal Transfers →', tab: 'transfers' }
    );
  };

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination slice
  const paginatedReceipts = paginate(filteredReceipts);
 

  const handleReceiveShipment = (poNumber, sku, qty) => {
    confirmReceipt(poNumber, qty, 'Sarah Chen (Manager)');
    showToast(`✓ Inbound PO ${poNumber} marked as RECEIVED! +${qty} units of ${sku} booked into stock ledger.`);
  };

  const handleCreateReceipt = (e) => {
    e.preventDefault();
    const created = addReceipt({
      poNumber: newPo,
      supplier: newSupplier,
      sku: newSku,
      expectedQty: newQty,
      dock: newDock,
    });
    setIsModalOpen(false);
    setNewPo('');
    setNewSupplier('');
    showToast(`✓ Inbound PO ${created.poNumber} created & saved to localStorage!`);
  };

  const openEditModal = (r) => {
    setEditingReceipt(r);
    setEditSupplier(r.supplier);
    setEditQty(r.expectedQty);
    setEditDock(r.dock);
    setEditCarrier(r.carrier || 'Express Freight');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingReceipt) return;

    editReceipt(editingReceipt.id, {
      supplier: editSupplier,
      expectedQty: parseInt(editQty, 10) || editingReceipt.expectedQty,
      dock: editDock,
      carrier: editCarrier,
    });

    showToast(`✓ Inbound PO ${editingReceipt.poNumber} updated!`);
    setEditingReceipt(null);
  };

  const handleDeleteReceipt = (r) => {
    if (window.confirm(`Delete Inbound PO ${r.poNumber}?`)) {
      deleteReceipt(r.id);
      showToast(`🗑 Inbound PO ${r.poNumber} deleted.`);
    }
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
              Inbound Receipt Operation Complete
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              {successToast}
            </div>
            {toastAction && (
              <button
                type="button"
                className="ss-btn ss-btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', marginTop: '0.4rem', background: '#8b5cf6', borderColor: '#7c3aed' }}
                onClick={() => onNavigateTab && onNavigateTab(toastAction.tab)}
              >
                {toastAction.label}
              </button>
            )}
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
              Inbound Receipts & PO Logistics
            </h1>
            <span className="ss-badge ss-badge-success">LIFECYCLE: STAGE 1 (RECEIVE)</span>
            <span className="ss-badge ss-badge-info">● REAL-TIME SYNC</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Validate incoming vendor shipments, edit delivery manifests, and confirm arrival with immediate stock increment.
          </p>
        </div>

        <button
          type="button"
          className="ss-btn ss-btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Create Inbound PO Receipt
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
        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Dock Ready Shipments
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)', marginTop: '0.25rem' }}>
                {receipts.filter((r) => r.status === 'READY_TO_RECEIVE').length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>orders</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-success">
              📥
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Awaiting dock validation
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-info-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                In-Transit On Water/Road
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-info-text)', marginTop: '0.25rem' }}>
                {receipts.filter((r) => r.status === 'IN_TRANSIT').length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>shipments</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-info">
              🚚
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            En route to facility
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid #64748b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Completed This Shift
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {receipts.filter((r) => r.status === 'RECEIVED').length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>received</span>
              </div>
            </div>
            <div className="ss-icon-avatar" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569' }}>
              ✓
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Signed & ledger reconciled
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Total Expected Units
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '0.25rem' }}>
                +{receipts.reduce((acc, r) => acc + (r.expectedQty || 0), 0)} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>units</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-primary">
              📦
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Cumulative pipeline intake
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
            placeholder="Search by PO #, Supplier, SKU, or Product..."
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
            <option value="ALL">All Receipts</option>
            <option value="READY_TO_RECEIVE">Ready to Receive</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RECEIVED">Received & Signed</option>
          </select>
        </div>
      </div>

      {/* Receipts Data Table */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>PO REFERENCE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>SUPPLIER & CARRIER</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>LINE ITEM (SKU)</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>RECEIVING BAY</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>EXPECTED QTY</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReceipts.map((r) => {
                const isReady = r.status === 'READY_TO_RECEIVE';
                const isReceived = r.status === 'RECEIVED';
                const isInTransit = r.status === 'IN_TRANSIT';

                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {r.poNumber}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        ETA: {r.eta}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{r.supplier}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        Carrier: {r.carrier}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{r.productName}</div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                        {r.sku} • Target: {r.targetLocation}
                      </div>
                      {r.transferredTo && (
                        <div style={{ marginTop: '3px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: '#6d28d9', background: '#f5f3ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ddd6fe' }}>
                          <span>⇄ Shifted:</span>
                          <strong>{r.transferredTo}</strong>
                          <span>[{r.shiftedToWarehouse || 'Regional Store'}]</span>
                        </div>
                      )}
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
                        {r.dock}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--ss-font-mono)',
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: 'var(--ss-success-text)',
                        }}
                      >
                        +{r.expectedQty}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isReady && <span className="ss-badge ss-badge-success">Docked / Ready</span>}
                      {isInTransit && <span className="ss-badge ss-badge-info">In Transit</span>}
                      {isReceived && (
                        <span className="ss-badge ss-badge-neutral" style={{ color: 'var(--ss-text-muted)' }}>
                          ✓ Received & Stocked
                        </span>
                      )}
                      {!isReady && !isReceived && !isInTransit && (
                        <span className="ss-badge ss-badge-warning">{r.status}</span>
                      )}
                    </td>

                    {/* CRUD ACTION BUTTONS */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        {isReady ? (
                          <button
                            type="button"
                            className="ss-btn ss-btn-primary"
                            onClick={() => handleReceiveShipment(r.poNumber, r.sku, r.expectedQty)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            Receive →
                          </button>
                        ) : null}

                        {isReceived && (
                          <button
                            type="button"
                            className="ss-btn"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.55rem',
                              backgroundColor: '#f5f3ff',
                              border: '1px solid #c4b5fd',
                              color: '#6d28d9',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            onClick={() => openShiftModal(r)}
                            title="Shift this received shipment to another warehouse/store or rack"
                          >
                            ⇄ Shift to Store
                          </button>
                        )}

                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => openEditModal(r)}
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.45rem' }}
                          title="Edit Inbound PO"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="ss-btn ss-btn-danger"
                          onClick={() => handleDeleteReceipt(r)}
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.45rem' }}
                          title="Delete Inbound PO"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalItems={filteredReceipts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => { setPage(p); window.scrollTo({top:0,behavior:'smooth'}); }}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Create Inbound PO Modal */}
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
                  Create Inbound PO Receipt
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Schedule incoming vendor delivery to receiving bay.
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

            <form onSubmit={handleCreateReceipt} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    PO Number
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    placeholder="e.g. PO-9410"
                    value={newPo}
                    onChange={(e) => setNewPo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    placeholder="e.g. Apex Industrial Systems"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Product Line Item
                </label>
                <select
                  className="ss-select"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Expected Quantity
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
                    Assigned Dock
                  </label>
                  <select
                    className="ss-select"
                    value={newDock}
                    onChange={(e) => setNewDock(e.target.value)}
                  >
                    <option value="Bay 01 - Receiving">Bay 01 - Receiving</option>
                    <option value="Bay 02 - Receiving">Bay 02 - Receiving</option>
                    <option value="Dock 03 - Bulk Freight">Dock 03 - Bulk Freight</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary">
                  Book Inbound PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inbound PO Modal */}
      {editingReceipt && (
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
                  Edit Inbound PO: {editingReceipt.poNumber}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Modify supplier info, intake dock, or expected delivery units.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setEditingReceipt(null)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Supplier Name
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editSupplier}
                  onChange={(e) => setEditSupplier(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Expected Quantity
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
                    Assigned Dock
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editDock}
                    onChange={(e) => setEditDock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Carrier
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editCarrier}
                  onChange={(e) => setEditCarrier(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingReceipt(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary">
                  Save PO Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Inbound Shipment to Store / Facility Modal */}
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
                  Shift Inbound PO to Store / Facility
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                  Move received inventory from inbound dock to another store, regional hub, or rack.
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
                <span style={{ color: 'var(--ss-text-muted)' }}>PO Number:</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>{shiftingReceipt.poNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                <span style={{ color: 'var(--ss-text-muted)' }}>Line Item:</span>
                <span style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{shiftingReceipt.productName} ({shiftingReceipt.sku})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                <span style={{ color: 'var(--ss-text-muted)' }}>Current Origin:</span>
                <span style={{ color: 'var(--ss-warning)' }}>{shiftingReceipt.dock || 'Bay 01 - Receiving'}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmShift} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Target Destination Facility / Store
                </label>
                <select
                  className="ss-select"
                  value={shiftStore}
                  onChange={(e) => setShiftStore(e.target.value)}
                  required
                >
                  {warehouses.map((w) => (
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
                    value={shiftLocation}
                    onChange={(e) => setShiftLocation(e.target.value)}
                    placeholder="e.g. Rack A-02 or Zone C"
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
                    value={shiftQty}
                    onChange={(e) => setShiftQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Shift Reason
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={shiftReason}
                  onChange={(e) => setShiftReason(e.target.value)}
                  placeholder="e.g. Buffer replenishment or Store shift"
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
                  Confirm & Shift to Store →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsPage;
