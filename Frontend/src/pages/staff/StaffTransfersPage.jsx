import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffTransfersPage = () => {
  const { products, transfers, addTransfer, editTransfer, deleteTransfer, executeTransfer } = useInventory();

  // Filters & State
  const [activeFilter, setActiveFilter] = useState('SCHEDULED'); // 'SCHEDULED' | 'ALL' | 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null); // For execute modal
  const [viewingTransfer, setViewingTransfer] = useState(null);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [deletingTransfer, setDeletingTransfer] = useState(null);
  const [scannedBinConfirmed, setScannedBinConfirmed] = useState(true);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    transferNo: '',
    sku: products[0]?.sku || 'MTR-9002',
    qty: 15,
    fromLocation: 'Rack A-02 (Bulk)',
    toLocation: 'Zone C (Rapid Dispatch)',
    priority: 'HIGH',
    reason: 'Stage for outgoing orders',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredTransfers = (transfers || []).filter((t) => {
    const isPending = t.status === 'SCHEDULED';
    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'SCHEDULED' && isPending) ||
      (activeFilter === 'COMPLETED' && !isPending);

    const matchesSearch =
      t.transferNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.reason || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const randNum = Math.floor(7000 + Math.random() * 2000);
    const firstProd = products[0] || { sku: 'MTR-9002', primaryLocation: 'Rack A-02' };
    setCreateForm({
      transferNo: `TR-${randNum}`,
      sku: firstProd.sku,
      qty: 15,
      fromLocation: firstProd.primaryLocation || 'Rack A-02 (Bulk)',
      toLocation: 'Zone C (Rapid Dispatch)',
      priority: 'HIGH',
      reason: 'Buffer inventory replenishment',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === createForm.sku) || products[0];

    const created = addTransfer({
      transferNo: createForm.transferNo,
      sku: createForm.sku,
      productName: prod?.name || createForm.sku,
      qty: parseInt(createForm.qty, 10) || 10,
      fromLocation: createForm.fromLocation,
      toLocation: createForm.toLocation,
      priority: createForm.priority,
      reason: createForm.reason,
      status: 'SCHEDULED',
    });

    showToast(`✓ Internal Transfer ${created.transferNo} created and scheduled!`);
    setIsCreateModalOpen(false);
  };

  // Open Edit Modal
  const handleOpenEditModal = (t) => {
    setEditingTransfer({
      ...t,
      editTransferNo: t.transferNo,
      editSku: t.sku,
      editQty: t.qty,
      editFromLocation: t.fromLocation,
      editToLocation: t.toLocation,
      editReason: t.reason || '',
      editPriority: t.priority || 'MEDIUM',
      editStatus: t.status,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingTransfer) return;

    editTransfer(editingTransfer.transferNo, {
      transferNo: editingTransfer.editTransferNo,
      sku: editingTransfer.editSku,
      qty: parseInt(editingTransfer.editQty, 10) || 1,
      fromLocation: editingTransfer.editFromLocation,
      toLocation: editingTransfer.editToLocation,
      reason: editingTransfer.editReason,
      priority: editingTransfer.editPriority,
      status: editingTransfer.editStatus,
    });

    showToast(`✓ Transfer ${editingTransfer.transferNo} updated successfully!`);
    setEditingTransfer(null);
  };

  // Delete Transfer
  const handleConfirmDelete = () => {
    if (!deletingTransfer) return;
    deleteTransfer(deletingTransfer.transferNo);
    showToast(`🗑️ Transfer ${deletingTransfer.transferNo} deleted.`, 'warning');
    setDeletingTransfer(null);
  };

  // Confirm Movement Execution
  const handleConfirmMovement = (e) => {
    e.preventDefault();
    if (!selectedTransfer) return;

    executeTransfer(selectedTransfer.transferNo, 'Alex Rivera (Staff)');
    showToast(
      `✓ Movement confirmed! Relocated ${selectedTransfer.qty} units of ${selectedTransfer.sku} to ${selectedTransfer.toLocation}.`
    );
    setSelectedTransfer(null);
  };

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
            border: `1px solid ${toast.type === 'warning' ? 'var(--ss-warning)' : 'var(--ss-success)'}`,
            borderRadius: 'var(--ss-radius-md)',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: toast.type === 'warning' ? 'var(--ss-warning-text)' : 'var(--ss-success)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <span>{toast.type === 'warning' ? '🗑️' : '✓'}</span>
          <span>{toast.msg}</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
              Internal Transfers & Bin Relocation
            </h1>
            <span className="ss-badge ss-badge-success">FLOOR MOVEMENT</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Execute and manage scheduled inventory shifts between docks, buffer racks, and picking shelves with complete relocation tracking.
          </p>
        </div>

        {/* Action Buttons: + Create Transfer & Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={handleOpenCreateModal}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', fontWeight: 700 }}
          >
            + Create Transfer Order
          </button>

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              type="button"
              className={`ss-btn ${activeFilter === 'SCHEDULED' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setActiveFilter('SCHEDULED')}
            >
              Pending ({(transfers || []).filter((t) => t.status === 'SCHEDULED').length})
            </button>
            <button
              type="button"
              className={`ss-btn ${activeFilter === 'ALL' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setActiveFilter('ALL')}
            >
              All ({(transfers || []).length})
            </button>
            <button
              type="button"
              className={`ss-btn ${activeFilter === 'COMPLETED' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setActiveFilter('COMPLETED')}
            >
              Completed ({(transfers || []).filter((t) => t.status === 'COMPLETED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="ss-input"
          placeholder="Filter transfers by Transfer #, SKU, Product, Location, or Reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Transfers Cards Grid with Complete CRUD Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredTransfers.map((t) => {
          const isPending = t.status === 'SCHEDULED';

          return (
            <div
              key={t.id || t.transferNo}
              className="ss-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                border: '1px solid var(--ss-border)',
                borderTop: isPending ? '4px solid var(--ss-success)' : '4px solid var(--ss-border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                    {t.transferNo}
                  </span>
                  <span className={`ss-badge ${isPending ? 'ss-badge-warning' : 'ss-badge-success'}`}>
                    {isPending ? '⏳ SCHEDULED' : '✓ COMPLETED'}
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                  {t.productName || t.sku}
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '2px' }}>
                  SKU: {t.sku}
                </div>

                {/* VISUAL SOURCE TO DESTINATION PATH */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--ss-bg-app)',
                    border: '1px solid var(--ss-border)',
                    borderRadius: 'var(--ss-radius-md)',
                    marginTop: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                        SOURCE (FROM)
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-danger-text)', fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                        {t.fromLocation}
                      </div>
                    </div>

                    <div style={{ fontSize: '1.25rem', color: 'var(--ss-text-muted)', fontWeight: 800 }}>
                      ➔
                    </div>

                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                        DESTINATION (TO)
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-success-text)', fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                        {t.toLocation}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Movement Quantity:</span>
                    <strong style={{ fontSize: '1.125rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                      {t.qty} units
                    </strong>
                  </div>
                </div>

                {t.reason && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
                    Reason: <strong>{t.reason}</strong>
                  </div>
                )}
              </div>

              {/* ACTION TOOLBAR: VIEW, EDIT, DELETE, AND EXECUTE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setViewingTransfer(t)}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                  >
                    👁️ View
                  </button>
                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => handleOpenEditModal(t)}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="ss-btn ss-btn-ghost"
                    onClick={() => setDeletingTransfer(t)}
                    style={{ padding: '0.3rem 0.5rem', color: 'var(--ss-danger)', fontSize: '0.75rem' }}
                    title="Delete Transfer"
                  >
                    🗑️
                  </button>
                </div>

                {isPending ? (
                  <button
                    type="button"
                    className="ss-btn ss-btn-primary"
                    onClick={() => setSelectedTransfer(t)}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '0.625rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    }}
                  >
                    ✓ Confirm Movement ({t.qty} units)
                  </button>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', textAlign: 'center', padding: '0.35rem 0' }}>
                    ✓ Shift completed {t.completedAt || 'earlier'}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredTransfers.length === 0 && (
          <div
            className="ss-card"
            style={{ gridColumn: '1 / -1', padding: '3rem 1rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}
          >
            <span style={{ fontSize: '2.5rem' }}>⇄</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.5rem' }}>
              No Transfer Tasks Found
            </div>
            <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              All scheduled physical bin shifts are up to date. Click "+ Create Transfer Order" to schedule a relocation.
            </p>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE TRANSFER ORDER */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--ss-modal-backdrop)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="ss-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem',
              borderRadius: 'var(--ss-radius-lg)',
              backgroundColor: 'var(--ss-bg-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⇄</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                  Create Internal Transfer Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Transfer #
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={createForm.transferNo}
                    onChange={(e) => setCreateForm({ ...createForm, transferNo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Product / SKU
                  </label>
                  <select
                    className="ss-select"
                    value={createForm.sku}
                    onChange={(e) => {
                      const p = products.find((prod) => prod.sku === e.target.value);
                      setCreateForm({
                        ...createForm,
                        sku: e.target.value,
                        fromLocation: p?.primaryLocation || createForm.fromLocation,
                      });
                    }}
                  >
                    {products.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Transfer Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={createForm.qty}
                    onChange={(e) => setCreateForm({ ...createForm, qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Priority
                  </label>
                  <select
                    className="ss-select"
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Source (From Bin)
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={createForm.fromLocation}
                    onChange={(e) => setCreateForm({ ...createForm, fromLocation: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Destination (To Bin)
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={createForm.toLocation}
                    onChange={(e) => setCreateForm({ ...createForm, toLocation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Relocation Reason
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={createForm.reason}
                  onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Schedule Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW TRANSFER DETAILS */}
      {viewingTransfer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--ss-modal-backdrop)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="ss-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '1.75rem',
              borderRadius: 'var(--ss-radius-lg)',
              backgroundColor: 'var(--ss-bg-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⇄</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Transfer: {viewingTransfer.transferNo}
                  </h3>
                  <span className={`ss-badge ${viewingTransfer.status === 'COMPLETED' ? 'ss-badge-success' : 'ss-badge-warning'}`}>
                    {viewingTransfer.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingTransfer(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Product:</div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{viewingTransfer.productName || viewingTransfer.sku}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-primary)', fontFamily: 'var(--ss-font-mono)' }}>SKU: {viewingTransfer.sku}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Origin:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{viewingTransfer.fromLocation}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Destination:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{viewingTransfer.toLocation}</div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Quantity & Reason:</div>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                  {viewingTransfer.qty} units
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                  {viewingTransfer.reason || 'Buffer replenishment'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setViewingTransfer(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT TRANSFER */}
      {editingTransfer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--ss-modal-backdrop)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="ss-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '1.75rem',
              borderRadius: 'var(--ss-radius-lg)',
              backgroundColor: 'var(--ss-bg-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                Edit Transfer: {editingTransfer.transferNo}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTransfer(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Transfer #
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingTransfer.editTransferNo}
                  onChange={(e) => setEditingTransfer({ ...editingTransfer, editTransferNo: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={editingTransfer.editQty}
                    onChange={(e) => setEditingTransfer({ ...editingTransfer, editQty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Status
                  </label>
                  <select
                    className="ss-select"
                    value={editingTransfer.editStatus}
                    onChange={(e) => setEditingTransfer({ ...editingTransfer, editStatus: e.target.value })}
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Origin (From Bin)
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editingTransfer.editFromLocation}
                    onChange={(e) => setEditingTransfer({ ...editingTransfer, editFromLocation: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Destination (To Bin)
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editingTransfer.editToLocation}
                    onChange={(e) => setEditingTransfer({ ...editingTransfer, editToLocation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Reason / Purpose
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingTransfer.editReason}
                  onChange={(e) => setEditingTransfer({ ...editingTransfer, editReason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingTransfer(null)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingTransfer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--ss-modal-backdrop)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="ss-card"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '1.75rem',
              borderRadius: 'var(--ss-radius-lg)',
              backgroundColor: 'var(--ss-bg-surface)',
              border: '1px solid var(--ss-danger-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🗑️</span>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-danger-text)', margin: 0 }}>
                  Delete Transfer Order
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  This will remove the relocation order.
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--ss-text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Are you sure you want to delete Transfer{' '}
              <code style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>{deletingTransfer.transferNo}</code> ({deletingTransfer.sku})?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setDeletingTransfer(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-danger"
                onClick={handleConfirmDelete}
                style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRM MOVEMENT DIALOG */}
      {selectedTransfer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--ss-modal-backdrop)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="ss-card"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '1.75rem',
              borderRadius: 'var(--ss-radius-lg)',
              backgroundColor: 'var(--ss-bg-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⇄</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Execute Physical Relocation
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', fontFamily: 'var(--ss-font-mono)' }}>
                    Ref: {selectedTransfer.transferNo}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTransfer(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0.875rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700 }}>{selectedTransfer.productName || selectedTransfer.sku}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ss-primary)', fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                SKU: {selectedTransfer.sku}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                <span>From: <strong>{selectedTransfer.fromLocation}</strong></span>
                <span>➔</span>
                <span>To: <strong>{selectedTransfer.toLocation}</strong></span>
              </div>
            </div>

            <form onSubmit={handleConfirmMovement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--ss-radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                  <input
                    type="checkbox"
                    checked={scannedBinConfirmed}
                    onChange={(e) => setScannedBinConfirmed(e.target.checked)}
                  />
                  <span>Destination Bin barcode scanned & verified</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setSelectedTransfer(null)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  disabled={!scannedBinConfirmed}
                  style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Confirm Movement ({selectedTransfer.qty} units)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTransfersPage;
