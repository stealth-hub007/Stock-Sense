import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const ReceiptsPage = () => {
  const { receipts, products, addReceipt, editReceipt, deleteReceipt, confirmReceipt } = useInventory();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

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

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 5000);
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
            <span className="ss-badge ss-badge-info">● PERSISTED CRUD</span>
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
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>DOCK READY SHIPMENTS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)' }}>
            {receipts.filter((r) => r.status === 'READY_TO_RECEIVE').length} Orders
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>IN-TRANSIT ON WATER/ROAD</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-info-text)' }}>
            {receipts.filter((r) => r.status === 'IN_TRANSIT').length} Shipments
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>COMPLETED THIS SHIFT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
            {receipts.filter((r) => r.status === 'RECEIVED').length} Received
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>TOTAL EXPECTED UNITS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
            +{receipts.reduce((acc, r) => acc + (r.expectedQty || 0), 0)} Units
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
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>CRUD ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((r) => {
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
      </div>

      {/* Create Inbound PO Modal */}
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
    </div>
  );
};

export default ReceiptsPage;
