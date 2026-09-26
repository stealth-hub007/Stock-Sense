import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffStockCountPage = () => {
  const { products, adjustments, addAdjustment, editAdjustment, deleteAdjustment } = useInventory();
  const [selectedLocation, setSelectedLocation] = useState('Zone C (Rapid Dispatch)');
  const [selectedSku, setSelectedSku] = useState('');
  const [physicalCountInput, setPhysicalCountInput] = useState(100);
  const [countReason, setCountReason] = useState('Cycle Count Discrepancy');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // CRUD Modals for Stock Counting
  const [viewingAdj, setViewingAdj] = useState(null);
  const [editingAdj, setEditingAdj] = useState(null);
  const [deletingAdj, setDeletingAdj] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Distinct locations from products
  const availableLocations = Array.from(
    new Set(
      products.flatMap((p) => [
        p.primaryLocation,
        ...(p.locations || []).map((l) => l.bin),
      ]).filter(Boolean)
    )
  );

  // Products filtered by selected location
  const productsInLocation = products.filter((p) => {
    if (selectedLocation === 'ALL') return true;
    return (
      p.primaryLocation === selectedLocation ||
      (p.locations || []).some((l) => l.bin === selectedLocation)
    );
  });

  const activeProduct =
    products.find((p) => p.sku === selectedSku) || productsInLocation[0] || products[0];

  const expectedQty = activeProduct?.onHand ?? 100;
  const countedQty = parseInt(physicalCountInput, 10) || 0;
  const difference = countedQty - expectedQty;

  const handleSubmitCount = (e) => {
    e.preventDefault();
    if (!activeProduct) return;

    if (difference === 0) {
      showToast(`✓ Stock count verified! ${activeProduct.sku} has an exact match (${expectedQty}/${countedQty} units). Floor audit recorded.`);
      return;
    }

    // Warehouse Staff submits discrepancy for Manager Approval
    const newAdj = addAdjustment({
      sku: activeProduct.sku,
      delta: difference,
      systemQty: expectedQty,
      physicalQty: countedQty,
      location: selectedLocation === 'ALL' ? activeProduct.primaryLocation : selectedLocation,
      reason: countReason,
      operator: 'Alex Rivera (Staff)',
      requiresApproval: true,
      status: 'PENDING_APPROVAL',
      submittedByRole: 'WAREHOUSE_STAFF',
    });

    showToast(
      `📋 Discrepancy of ${difference > 0 ? `+${difference}` : difference} units submitted! Manager Sarah Chen has been notified for authorization. (Ref: ${newAdj.adjNumber})`
    );
  };

  // Handle Edit Adjustment
  const handleOpenEdit = (adj) => {
    setEditingAdj({
      ...adj,
      editRef: adj.adjNumber,
      editPhysicalQty: adj.physicalQty,
      editReason: adj.reason || '',
      editLocation: adj.location || '',
      editStatus: adj.status,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingAdj) return;

    const physQty = parseInt(editingAdj.editPhysicalQty, 10) || 0;
    const delta = physQty - (editingAdj.systemQty || 0);

    editAdjustment(editingAdj.adjNumber, {
      adjNumber: editingAdj.editRef,
      physicalQty: physQty,
      delta,
      reason: editingAdj.editReason,
      location: editingAdj.editLocation,
      status: editingAdj.editStatus,
    });

    showToast(`✓ Stock adjustment ${editingAdj.adjNumber} updated successfully!`);
    setEditingAdj(null);
  };

  // Handle Delete Adjustment
  const handleConfirmDelete = () => {
    if (!deletingAdj) return;
    deleteAdjustment(deletingAdj.adjNumber);
    showToast(`🗑️ Stock count adjustment ${deletingAdj.adjNumber} deleted.`, 'warning');
    setDeletingAdj(null);
  };

  const filteredAdjustments = (adjustments || []).filter((a) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.adjNumber.toLowerCase().includes(q) ||
      a.sku.toLowerCase().includes(q) ||
      (a.productName || '').toLowerCase().includes(q) ||
      (a.location || '').toLowerCase().includes(q) ||
      (a.reason || '').toLowerCase().includes(q)
    );
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
            padding: '0.875rem 1.25rem',
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
          <div>{toast.msg}</div>
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
              Physical Stock Counting & Audit
            </h1>
            <span className="ss-badge ss-badge-warning">FLOOR CYCLE AUDIT</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Count physical floor inventory, calculate live variances, submit discrepancies, and manage audit records with complete precision.
          </p>
        </div>

        {/* Governance Notice */}
        <div
          style={{
            padding: '0.5rem 0.875rem',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--ss-radius-md)',
            fontSize: '0.75rem',
            color: 'var(--ss-warning-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🛡️</span>
          <span>
            <strong>Governance Rule:</strong> Staff count entries are submitted as <code>PENDING_APPROVAL</code> to Inventory Manager.
          </span>
        </div>
      </div>

      {/* Main Stock Counting Form Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.2fr)',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Step 1 & 2: Location & Product Selection */}
        <div
          className="ss-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
              1. Select Location & SKU
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              Choose the warehouse bin or shelf you are physically auditing.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
              Select Physical Location / Bin
            </label>
            <select
              className="ss-select"
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                const matchingProds = products.filter((p) =>
                  e.target.value === 'ALL' ? true : p.primaryLocation === e.target.value
                );
                if (matchingProds[0]) {
                  setSelectedSku(matchingProds[0].sku);
                  setPhysicalCountInput(matchingProds[0].onHand);
                }
              }}
              style={{ fontWeight: 600 }}
            >
              <option value="ALL">All Warehouse Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
              Select Product to Count ({productsInLocation.length} items in this bin)
            </label>
            <select
              className="ss-select"
              value={activeProduct?.sku || ''}
              onChange={(e) => {
                setSelectedSku(e.target.value);
                const p = products.find((prod) => prod.sku === e.target.value);
                if (p) setPhysicalCountInput(p.onHand);
              }}
              style={{ fontWeight: 600 }}
            >
              {productsInLocation.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} — {p.name} (Expected: {p.onHand} units)
                </option>
              ))}
            </select>
          </div>

          {/* Selected Product Summary Card */}
          {activeProduct && (
            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--ss-bg-app)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-md)',
              }}
            >
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                {activeProduct.name}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)' }}>SKU: </span>
                  <strong style={{ fontFamily: 'var(--ss-font-mono)' }}>{activeProduct.sku}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)' }}>Primary Bin: </span>
                  <strong>{activeProduct.primaryLocation}</strong>
                </div>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
              Reason for Discrepancy (if applicable)
            </label>
            <select
              className="ss-select"
              value={countReason}
              onChange={(e) => setCountReason(e.target.value)}
            >
              <option value="Cycle Count Discrepancy">Cycle Count Floor Discrepancy</option>
              <option value="Physical Damage / Forklift Snag">Physical Damage / Scrap Write-Off</option>
              <option value="Found Unrecorded Stock">Found Unrecorded Stock on Floor</option>
              <option value="Packaging Defect / Quarantine">Packaging Defect / Quarantine</option>
              <option value="Shrinkage / Unaccounted Loss">Shrinkage / Missing from Shelf</option>
            </select>
          </div>
        </div>

        {/* Step 3 & 4: Enter Physical Count & Live Difference Calculation */}
        <div
          className="ss-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.5rem',
            borderTop: '4px solid var(--ss-primary)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
              2. Enter Count & Review Variance
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              Live difference calculation matching the operational specification.
            </p>
          </div>

          {/* EXACT SPECIFICATION DISPLAY: Expected, Counted, Difference */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              textAlign: 'center',
            }}
          >
            {/* 1. EXPECTED */}
            <div
              style={{
                padding: '1rem 0.5rem',
                backgroundColor: 'var(--ss-bg-app)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-md)',
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Expected:
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--ss-font-mono)',
                  color: 'var(--ss-text-primary)',
                  marginTop: '0.25rem',
                }}
              >
                {expectedQty}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                System recorded
              </div>
            </div>

            {/* 2. COUNTED */}
            <div
              style={{
                padding: '1rem 0.5rem',
                backgroundColor: 'var(--ss-bg-app)',
                border: '1px solid var(--ss-primary-border)',
                borderRadius: 'var(--ss-radius-md)',
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Counted:
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--ss-font-mono)',
                  color: 'var(--ss-primary)',
                  marginTop: '0.25rem',
                }}
              >
                {countedQty}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                Physical on floor
              </div>
            </div>

            {/* 3. DIFFERENCE */}
            <div
              style={{
                padding: '1rem 0.5rem',
                backgroundColor:
                  difference === 0
                    ? 'rgba(16, 185, 129, 0.08)'
                    : difference < 0
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(59, 130, 246, 0.08)',
                border:
                  difference === 0
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : difference < 0
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 'var(--ss-radius-md)',
              }}
            >
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color:
                    difference === 0
                      ? 'var(--ss-success)'
                      : difference < 0
                      ? 'var(--ss-danger)'
                      : 'var(--ss-primary)',
                }}
              >
                Difference:
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--ss-font-mono)',
                  color:
                    difference === 0
                      ? 'var(--ss-success)'
                      : difference < 0
                      ? 'var(--ss-danger)'
                      : 'var(--ss-primary)',
                  marginTop: '0.25rem',
                }}
              >
                {difference > 0 ? `+${difference}` : difference}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                {difference === 0 ? 'Exact match' : 'Discrepancy variance'}
              </div>
            </div>
          </div>

          {/* Touch-Friendly Physical Count Stepper */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
              Physical Count Input (Use numpad or step buttons)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setPhysicalCountInput((prev) => Math.max(0, prev - 1))}
                style={{ fontSize: '1.25rem', width: '48px', height: '48px', justifyContent: 'center' }}
              >
                -1
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setPhysicalCountInput((prev) => Math.max(0, prev - 5))}
                style={{ fontSize: '0.8125rem', width: '48px', height: '48px', justifyContent: 'center' }}
              >
                -5
              </button>

              <input
                type="number"
                min="0"
                className="ss-input"
                value={physicalCountInput}
                onChange={(e) => setPhysicalCountInput(parseInt(e.target.value, 10) || 0)}
                style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--ss-font-mono)',
                  height: '48px',
                  color: 'var(--ss-primary)',
                }}
                required
              />

              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setPhysicalCountInput((prev) => prev + 1)}
                style={{ fontSize: '1.25rem', width: '48px', height: '48px', justifyContent: 'center' }}
              >
                +1
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setPhysicalCountInput((prev) => prev + 5)}
                style={{ fontSize: '0.8125rem', width: '48px', height: '48px', justifyContent: 'center' }}
              >
                +5
              </button>
            </div>
          </div>

          {/* Submit Count Action */}
          <form onSubmit={handleSubmitCount}>
            <button
              type="submit"
              className="ss-btn ss-btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
              }}
            >
              {difference === 0 ? '✓ Confirm Match (Zero Discrepancy)' : '📋 Submit Discrepancy for Approval →'}
            </button>
          </form>
        </div>
      </div>

      {/* RECENT FLOOR COUNTS & APPROVAL AUDIT LOG TABLE WITH FULL CRUD */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--ss-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ss-text-primary)', margin: 0 }}>
              Recent Floor Counts & Discrepancy Approval Status
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              Floor audit log: View details, edit count parameters, or remove records
            </div>
          </div>

          <input
            type="text"
            className="ss-input"
            placeholder="Search adjustments by Ref, SKU, location, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', width: '240px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, width: '120px' }}>REF #</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '170px' }}>PRODUCT & SKU</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '130px' }}>LOCATION</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '100px' }}>EXPECTED</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '100px' }}>COUNTED</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '110px' }}>VARIANCE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'left', minWidth: '170px' }}>APPROVAL STATUS</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '180px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.map((adj) => {
                const isPending = adj.status === 'PENDING_APPROVAL';

                return (
                  <tr key={adj.id || adj.adjNumber} style={{ borderBottom: '1px solid var(--ss-border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                      {adj.adjNumber}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{adj.productName || adj.sku}</div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>{adj.sku}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-secondary)' }}>
                      {adj.location}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)' }}>
                      {adj.systemQty}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 600 }}>
                      {adj.physicalQty}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 800 }}>
                      <span style={{ color: adj.delta < 0 ? 'var(--ss-danger)' : adj.delta > 0 ? 'var(--ss-primary)' : 'var(--ss-success)' }}>
                        {adj.delta > 0 ? `+${adj.delta}` : adj.delta}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isPending ? (
                        <div>
                          <span className="ss-badge ss-badge-warning" style={{ fontWeight: 700 }}>
                            ⏳ PENDING APPROVAL
                          </span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-warning-text)', marginTop: '2px', fontWeight: 600 }}>
                            Awaiting Manager Review
                          </div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--ss-text-muted)', marginTop: '1px' }}>
                            🔔 Alert sent to Sarah Chen
                          </div>
                        </div>
                      ) : adj.status === 'REJECTED' ? (
                        <div>
                          <span className="ss-badge ss-badge-danger">✕ REJECTED</span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                            By {adj.rejectedBy || 'Manager'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="ss-badge ss-badge-success">✓ APPROVED</span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                            By {adj.approvedBy || 'Sarah Chen (Manager)'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => setViewingAdj(adj)}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', width: '60px', justifyContent: 'center' }}
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => handleOpenEdit(adj)}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', width: '56px', justifyContent: 'center' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="ss-btn ss-btn-ghost"
                          onClick={() => setDeletingAdj(adj)}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', width: '32px', justifyContent: 'center', color: 'var(--ss-danger)' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAdjustments.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                    No physical count adjustments recorded matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW AUDIT DETAILS */}
      {viewingAdj && (
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
                <span style={{ fontSize: '1.5rem' }}>🎯</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Audit Ref: {viewingAdj.adjNumber}
                  </h3>
                  <span className={`ss-badge ${viewingAdj.status === 'APPROVED' ? 'ss-badge-success' : viewingAdj.status === 'REJECTED' ? 'ss-badge-danger' : 'ss-badge-warning'}`}>
                    {viewingAdj.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingAdj(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Product & Bin:</div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{viewingAdj.productName || viewingAdj.sku} ({viewingAdj.sku})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>Bin Location: <strong>{viewingAdj.location}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>System Qty</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)' }}>{viewingAdj.systemQty}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-primary)', textTransform: 'uppercase', fontWeight: 600 }}>Physical Qty</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>{viewingAdj.physicalQty}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: viewingAdj.delta < 0 ? 'var(--ss-danger)' : 'var(--ss-success)', textTransform: 'uppercase', fontWeight: 600 }}>Variance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: viewingAdj.delta < 0 ? 'var(--ss-danger)' : 'var(--ss-success)' }}>
                    {viewingAdj.delta > 0 ? `+${viewingAdj.delta}` : viewingAdj.delta}
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Reason & Operator:</div>
                <div style={{ fontSize: '0.8125rem' }}>{viewingAdj.reason || 'Cycle Count'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                  Logged by: {viewingAdj.operator || 'Staff Operator'}
                </div>
              </div>

              {/* Approval Authority & Notification Status Box */}
              <div
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: 'var(--ss-radius-md)',
                  backgroundColor: viewingAdj.status === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${viewingAdj.status === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: viewingAdj.status === 'PENDING_APPROVAL' ? 'var(--ss-warning-text)' : 'var(--ss-success)' }}>
                    {viewingAdj.status === 'PENDING_APPROVAL' ? '⏳ Manager Approval Workflow' : '✓ Governance Sign-off Complete'}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                    Role Authority
                  </span>
                </div>

                {viewingAdj.status === 'PENDING_APPROVAL' ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', lineHeight: 1.4 }}>
                    <div><strong>Designated Approver:</strong> Sarah Chen (Operations & Inventory Lead)</div>
                    <div style={{ marginTop: '2px' }}><strong>Notification Status:</strong> 🔔 Alert dispatched to Manager Notification Center</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '4px' }}>
                      *Staff operators cannot directly approve write-offs. Manager authorization synchronizes the Stock Ledger.
                    </div>
                  </div>
                ) : viewingAdj.status === 'REJECTED' ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-danger)' }}>
                    <strong>Rejected by:</strong> {viewingAdj.rejectedBy || 'Manager'} ({viewingAdj.rejectReason || 'Discrepancy count rejected'})
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                    <div><strong>Approved by:</strong> {viewingAdj.approvedBy || 'Sarah Chen (Manager)'}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-success)', marginTop: '2px' }}>
                      ✓ Stock on-hand balance and financial ledger reconciled.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setViewingAdj(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT AUDIT RECORD */}
      {editingAdj && (
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
                Edit Count Record: {editingAdj.adjNumber}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAdj(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Physical Counted Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="ss-input"
                    value={editingAdj.editPhysicalQty}
                    onChange={(e) => setEditingAdj({ ...editingAdj, editPhysicalQty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Status
                  </label>
                  <select
                    className="ss-select"
                    value={editingAdj.editStatus}
                    onChange={(e) => setEditingAdj({ ...editingAdj, editStatus: e.target.value })}
                  >
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Audited Location
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingAdj.editLocation}
                  onChange={(e) => setEditingAdj({ ...editingAdj, editLocation: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Discrepancy Reason
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingAdj.editReason}
                  onChange={(e) => setEditingAdj({ ...editingAdj, editReason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingAdj(null)}
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

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deletingAdj && (
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
                  Delete Count Record
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  This will remove the count audit adjustment record.
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--ss-text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Are you sure you want to delete Audit Record{' '}
              <code style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>{deletingAdj.adjNumber}</code> ({deletingAdj.sku})?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setDeletingAdj(null)}
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
    </div>
  );
};

export default StaffStockCountPage;
