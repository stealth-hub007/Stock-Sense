import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffReceiptsPage = () => {
  const { products, receipts, addReceipt, editReceipt, deleteReceipt, confirmReceipt } = useInventory();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'RECEIVED'
  const [toast, setToast] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null); // For Receive action
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [deletingReceipt, setDeletingReceipt] = useState(null);

  // Receive Modal form
  const [receivedQtyInput, setReceivedQtyInput] = useState(0);
  const [receivedDock, setReceivedDock] = useState('');

  // Create Modal form
  const [createForm, setCreateForm] = useState({
    poNumber: '',
    supplier: '',
    sku: products[0]?.sku || 'MTR-9002',
    expectedQty: 25,
    dock: 'Bay 01 - Receiving',
    targetLocation: 'Zone A (Main Rack)',
    carrier: 'FastFreight Global',
    notes: 'Incoming supplier shipment',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredReceipts = (receipts || []).filter((r) => {
    const isPending = r.status !== 'RECEIVED';
    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'PENDING' && isPending) ||
      (activeFilter === 'RECEIVED' && !isPending);

    const matchesSearch =
      r.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.dock || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pagination computations
  const totalReceipts = filteredReceipts.length;
  const totalPages = Math.ceil(totalReceipts / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReceipts = filteredReceipts.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  // Open Receive Goods Modal
  const openReceiveModal = (receipt) => {
    setSelectedReceipt(receipt);
    setReceivedQtyInput(receipt.expectedQty);
    setReceivedDock(receipt.dock || 'Bay 01 - Receiving');
  };

  const handleConfirmReceive = (e) => {
    e.preventDefault();
    if (!selectedReceipt) return;

    const qty = parseInt(receivedQtyInput, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid positive quantity to receive.');
      return;
    }

    confirmReceipt(selectedReceipt.poNumber, qty, 'Alex Rivera (Staff)');
    showToast(`✓ Received +${qty} units of ${selectedReceipt.sku} at ${receivedDock}! Stock updated.`);
    setSelectedReceipt(null);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const firstProd = products[0] || { sku: 'MTR-9002', primaryLocation: 'Rack A-01' };
    setCreateForm({
      poNumber: `PO-${randNum}`,
      supplier: 'Apex Precision Motors Ltd',
      sku: firstProd.sku,
      expectedQty: 30,
      dock: 'Bay 01 - Receiving Dock',
      targetLocation: firstProd.primaryLocation || 'Zone A (Main Rack)',
      carrier: 'FastFreight Global',
      notes: 'Scheduled pallet arrival',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === createForm.sku) || products[0];

    const created = addReceipt({
      poNumber: createForm.poNumber,
      sku: createForm.sku,
      productName: prod?.name || createForm.sku,
      expectedQty: parseInt(createForm.expectedQty, 10) || 20,
      dock: createForm.dock,
      targetLocation: createForm.targetLocation,
      supplier: createForm.supplier,
      carrier: createForm.carrier,
      status: 'PENDING',
    });

    showToast(`✓ Inbound PO ${created.poNumber} created and ready for intake!`);
    setIsCreateModalOpen(false);
  };

  // Open Edit Modal
  const handleOpenEditModal = (r) => {
    setEditingReceipt({
      ...r,
      editPoNumber: r.poNumber,
      editSupplier: r.supplier || '',
      editSku: r.sku,
      editExpectedQty: r.expectedQty,
      editDock: r.dock || 'Bay 01 - Receiving',
      editCarrier: r.carrier || '',
      editStatus: r.status,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingReceipt) return;

    editReceipt(editingReceipt.poNumber, {
      poNumber: editingReceipt.editPoNumber,
      supplier: editingReceipt.editSupplier,
      sku: editingReceipt.editSku,
      expectedQty: parseInt(editingReceipt.editExpectedQty, 10) || 1,
      dock: editingReceipt.editDock,
      carrier: editingReceipt.editCarrier,
      status: editingReceipt.editStatus,
    });

    showToast(`✓ Receipt ${editingReceipt.poNumber} updated successfully!`);
    setEditingReceipt(null);
  };

  // Delete Receipt
  const handleConfirmDelete = () => {
    if (!deletingReceipt) return;
    deleteReceipt(deletingReceipt.poNumber);
    showToast(`🗑️ Inbound PO ${deletingReceipt.poNumber} deleted.`, 'warning');
    setDeletingReceipt(null);
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
              Inbound Receiving & Putaway
            </h1>
            <span className="ss-badge ss-badge-info">FLOOR RECEIVING</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Inspect incoming supplier shipments, verify physical quantities, and intake stock into the active facility.
          </p>
        </div>

        {/* Action Buttons: + Create Receipt & Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={handleOpenCreateModal}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', fontWeight: 700 }}
          >
            + Create Inbound Receipt
          </button>

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              type="button"
              className={`ss-btn ${activeFilter === 'ALL' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setActiveFilter('ALL')}
            >
              All ({(receipts || []).length})
            </button>
            <button
              type="button"
              className={`ss-btn ${activeFilter === 'PENDING' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setActiveFilter('PENDING')}
            >
              Pending ({ (receipts || []).filter((r) => r.status !== 'RECEIVED').length })
            </button>
            <button
              type="button"
              className={`ss-btn ${activeFilter === 'RECEIVED' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setActiveFilter('RECEIVED')}
            >
              Completed ({ (receipts || []).filter((r) => r.status === 'RECEIVED').length })
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="ss-input"
          placeholder="Search by PO Number, Supplier, SKU, Product name, or Dock assignment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inbound Intake Register Table */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, width: '140px' }}>PO NUMBER</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '160px' }}>SUPPLIER</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '180px' }}>PRODUCT & SKU</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '160px' }}>DOCK ASSIGNMENT</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '130px' }}>EXPECTED QTY</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'center', width: '140px' }}>STATUS</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '270px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReceipts.map((r) => {
                const isPending = r.status !== 'RECEIVED';

                return (
                  <tr
                    key={r.id || r.poNumber}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      backgroundColor: isPending ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {r.poNumber}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {r.createdAt || 'Today'}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                        {r.supplier || 'Industrial Supplier Co'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        Carrier: {r.carrier || 'Standard Freight'}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                        {r.productName || r.sku}
                      </div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                        {r.sku}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--ss-font-mono)',
                          background: 'var(--ss-bg-app)',
                          border: '1px solid var(--ss-border)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--ss-radius-xs)',
                          color: 'var(--ss-text-secondary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {r.dock || 'Bay 01 - Receiving'}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 700, fontSize: '0.9375rem' }}>
                      {r.status === 'RECEIVED' ? (
                        <span style={{ color: 'var(--ss-success)' }}>{r.receivedQty || r.expectedQty} units</span>
                      ) : (
                        <span>{r.expectedQty} units</span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {isPending ? (
                        <span className="ss-badge ss-badge-warning">● PENDING INTAKE</span>
                      ) : (
                        <div>
                          <span className="ss-badge ss-badge-success">✓ RECEIVED</span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                            By {r.receivedBy || 'Staff'}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Perfectly Aligned Actions with Fixed Slots */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => setViewingReceipt(r)}
                          title="View receipt details"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: '64px', justifyContent: 'center' }}
                        >
                          👁️ View
                        </button>

                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => handleOpenEditModal(r)}
                          title="Edit PO parameters"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: '60px', justifyContent: 'center' }}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="ss-btn ss-btn-ghost"
                          onClick={() => setDeletingReceipt(r)}
                          title="Delete PO receipt"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem', width: '32px', justifyContent: 'center', color: 'var(--ss-danger)' }}
                        >
                          🗑️
                        </button>

                        {/* Slot 4: 84px Fixed Width for Receive Button */}
                        <div style={{ width: '84px', display: 'flex', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="ss-btn ss-btn-primary"
                            onClick={() => isPending && openReceiveModal(r)}
                            disabled={!isPending}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              width: '100%',
                              justifyContent: 'center',
                              fontWeight: 700,
                              opacity: !isPending ? 0.4 : 1,
                              cursor: !isPending ? 'not-allowed' : 'pointer',
                              background: !isPending ? 'var(--ss-bg-surface-hover)' : undefined,
                              color: !isPending ? 'var(--ss-text-muted)' : undefined,
                              borderColor: !isPending ? 'var(--ss-border)' : undefined,
                            }}
                            title={isPending ? 'Mark shipment received' : '✓ Already received'}
                          >
                            {isPending ? 'Receive →' : '✓ Done'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                    No inbound shipments found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Clean, Responsive Pagination Bar */}
        {totalReceipts > 0 && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--ss-bg-app)',
              borderTop: '1px solid var(--ss-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              fontSize: '0.8125rem',
            }}
          >
            {/* Range Counter */}
            <div style={{ color: 'var(--ss-text-muted)' }}>
              Showing <strong style={{ color: 'var(--ss-text-primary)' }}>{(safeCurrentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong style={{ color: 'var(--ss-text-primary)' }}>{Math.min(safeCurrentPage * pageSize, totalReceipts)}</strong> of{' '}
              <strong style={{ color: 'var(--ss-text-primary)' }}>{totalReceipts}</strong> inbound receipts
            </div>

            {/* Rows Per Page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--ss-text-muted)', fontSize: '0.75rem' }}>Rows per page:</span>
              <select
                className="ss-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', width: 'auto', fontWeight: 600 }}
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>

            {/* Page Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  opacity: safeCurrentPage === 1 ? 0.4 : 1,
                  cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                }}
                title="First Page"
              >
                ⇤
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  opacity: safeCurrentPage === 1 ? 0.4 : 1,
                  cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                }}
                title="Previous Page"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((pageNum) => {
                  return pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - safeCurrentPage) <= 1;
                })
                .map((pageNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  const hasGap = prev && pageNum - prev > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {hasGap && <span style={{ padding: '0 0.25rem', color: 'var(--ss-text-muted)' }}>...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          minWidth: '28px',
                          height: '28px',
                          padding: '0 0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: safeCurrentPage === pageNum ? 700 : 500,
                          borderRadius: 'var(--ss-radius-sm)',
                          border:
                            safeCurrentPage === pageNum
                              ? '1px solid var(--ss-primary)'
                              : '1px solid var(--ss-border)',
                          backgroundColor:
                            safeCurrentPage === pageNum ? 'var(--ss-primary)' : 'var(--ss-bg-surface)',
                          color: safeCurrentPage === pageNum ? '#ffffff' : 'var(--ss-text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  opacity: safeCurrentPage === totalPages ? 0.4 : 1,
                  cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
                title="Next Page"
              >
                Next →
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  opacity: safeCurrentPage === totalPages ? 0.4 : 1,
                  cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
                title="Last Page"
              >
                ⇥
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE RECEIPT */}
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
                <span style={{ fontSize: '1.5rem' }}>📥</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                  Create Inbound Receipt PO
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
                    PO Number
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={createForm.poNumber}
                    onChange={(e) => setCreateForm({ ...createForm, poNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Supplier
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={createForm.supplier}
                    onChange={(e) => setCreateForm({ ...createForm, supplier: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Product / SKU
                  </label>
                  <select
                    className="ss-select"
                    value={createForm.sku}
                    onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                  >
                    {products.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Expected Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={createForm.expectedQty}
                    onChange={(e) => setCreateForm({ ...createForm, expectedQty: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Receiving Dock
                  </label>
                  <select
                    className="ss-select"
                    value={createForm.dock}
                    onChange={(e) => setCreateForm({ ...createForm, dock: e.target.value })}
                  >
                    <option value="Bay 01 - Receiving">Bay 01 - Receiving</option>
                    <option value="Bay 02 - Inbound Freight">Bay 02 - Inbound Freight</option>
                    <option value="Bay 03 - Cross-Dock">Bay 03 - Cross-Dock</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Carrier
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={createForm.carrier}
                    onChange={(e) => setCreateForm({ ...createForm, carrier: e.target.value })}
                  />
                </div>
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
                  ✓ Save Receipt PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW RECEIPT DETAILS */}
      {viewingReceipt && (
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
                <span style={{ fontSize: '1.5rem' }}>📥</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Receipt Details: {viewingReceipt.poNumber}
                  </h3>
                  <span className={`ss-badge ${viewingReceipt.status === 'RECEIVED' ? 'ss-badge-success' : 'ss-badge-warning'}`}>
                    {viewingReceipt.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Product Name:</div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{viewingReceipt.productName || viewingReceipt.sku}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-primary)', fontFamily: 'var(--ss-font-mono)' }}>SKU: {viewingReceipt.sku}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Supplier:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{viewingReceipt.supplier || 'Industrial Supplier Co'}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Dock:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{viewingReceipt.dock || 'Bay 01 - Receiving'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Expected Quantity:</div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', fontFamily: 'var(--ss-font-mono)' }}>
                    {viewingReceipt.expectedQty} units
                  </div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Carrier:</div>
                  <div style={{ fontSize: '0.8125rem' }}>{viewingReceipt.carrier || 'Freight Express'}</div>
                </div>
              </div>

              {viewingReceipt.receivedAt && (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--ss-radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-success)' }}>
                    ✓ Confirmed Received: {viewingReceipt.receivedQty} units
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                    Intake by {viewingReceipt.receivedBy || 'Staff'} ({viewingReceipt.receivedAt})
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setViewingReceipt(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
              {viewingReceipt.status !== 'RECEIVED' && (
                <button
                  type="button"
                  className="ss-btn ss-btn-primary"
                  onClick={() => {
                    const r = viewingReceipt;
                    setViewingReceipt(null);
                    openReceiveModal(r);
                  }}
                  style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
                >
                  Receive Goods →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT RECEIPT */}
      {editingReceipt && (
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
                Edit Receipt: {editingReceipt.poNumber}
              </h3>
              <button
                type="button"
                onClick={() => setEditingReceipt(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  PO Number
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingReceipt.editPoNumber}
                  onChange={(e) => setEditingReceipt({ ...editingReceipt, editPoNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Supplier Name
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingReceipt.editSupplier}
                  onChange={(e) => setEditingReceipt({ ...editingReceipt, editSupplier: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Expected Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={editingReceipt.editExpectedQty}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, editExpectedQty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Status
                  </label>
                  <select
                    className="ss-select"
                    value={editingReceipt.editStatus}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, editStatus: e.target.value })}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="READY_TO_RECEIVE">READY_TO_RECEIVE</option>
                    <option value="RECEIVED">RECEIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Receiving Dock
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingReceipt.editDock}
                  onChange={(e) => setEditingReceipt({ ...editingReceipt, editDock: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingReceipt(null)}
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
      {deletingReceipt && (
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
                  Delete Receipt PO
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  This will remove PO record permanently.
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--ss-text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Are you sure you want to delete Inbound Receipt PO{' '}
              <code style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>{deletingReceipt.poNumber}</code> ({deletingReceipt.sku})?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setDeletingReceipt(null)}
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
                Yes, Delete PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RECEIVE GOODS DIALOG */}
      {selectedReceipt && (
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📥</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Confirm Goods Receipt
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', fontFamily: 'var(--ss-font-mono)' }}>
                    Order Ref: {selectedReceipt.poNumber}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--ss-bg-app)',
                borderRadius: 'var(--ss-radius-md)',
                border: '1px solid var(--ss-border)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                {selectedReceipt.productName || selectedReceipt.sku}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)' }}>SKU: </span>
                  <strong style={{ fontFamily: 'var(--ss-font-mono)' }}>{selectedReceipt.sku}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)' }}>Supplier: </span>
                  <strong>{selectedReceipt.supplier || 'Industrial Supplier Co'}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmReceive} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Receiving Dock / Unloading Bay
                </label>
                <select
                  className="ss-select"
                  value={receivedDock}
                  onChange={(e) => setReceivedDock(e.target.value)}
                >
                  <option value="Bay 01 - Receiving">Bay 01 - Receiving Dock</option>
                  <option value="Bay 02 - Inbound Freight">Bay 02 - Inbound Freight</option>
                  <option value="Bay 03 - Cross-Dock">Bay 03 - Cross-Dock Rapid Intake</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)' }}>
                    Confirmed Physical Quantity
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                    Expected: <strong>{selectedReceipt.expectedQty} units</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setReceivedQtyInput((prev) => Math.max(1, prev - 1))}
                    style={{ fontSize: '1.25rem', width: '42px', height: '42px', justifyContent: 'center', padding: 0 }}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={receivedQtyInput}
                    onChange={(e) => setReceivedQtyInput(parseInt(e.target.value, 10) || 0)}
                    style={{
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      fontFamily: 'var(--ss-font-mono)',
                      height: '42px',
                    }}
                    required
                  />

                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setReceivedQtyInput((prev) => prev + 1)}
                    style={{ fontSize: '1.25rem', width: '42px', height: '42px', justifyContent: 'center', padding: 0 }}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setReceivedQtyInput(selectedReceipt.expectedQty)}
                    style={{ fontSize: '0.75rem', padding: '0 0.75rem', height: '42px' }}
                  >
                    Match Full ({selectedReceipt.expectedQty})
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setSelectedReceipt(null)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Confirm & Receive Goods
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReceiptsPage;
