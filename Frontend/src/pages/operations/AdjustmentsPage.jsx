import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const AdjustmentsPage = () => {
  const { adjustments, products, addAdjustment, editAdjustment, deleteAdjustment, approveAdjustment, rejectAdjustment } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // New adjustment form
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'MTR-9002');
  const [deltaQty, setDeltaQty] = useState(-1);
  const [reasonCode, setReasonCode] = useState('Physical Damage / Forklift Snag');

  // Edit adjustment form
  const [editReason, setEditReason] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editOperator, setEditOperator] = useState('');

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const pendingCount = (adjustments || []).filter((a) => a.status === 'PENDING_APPROVAL').length;

  const filteredAdjustments = adjustments.filter((a) => {
    const matchesSearch =
      a.adjNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = reasonFilter === 'ALL' || a.reason.includes(reasonFilter);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && a.status === 'PENDING_APPROVAL') ||
      (statusFilter === 'APPROVED' && a.status === 'APPROVED') ||
      (statusFilter === 'REJECTED' && a.status === 'REJECTED');
    return matchesSearch && matchesReason && matchesStatus;
  });

  const handleCreateAdjustment = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === selectedSku) || products[0];
    const qty = parseInt(deltaQty, 10) || 0;

    const newAdj = addAdjustment({
      sku: prod.sku,
      delta: qty,
      reason: reasonCode,
      location: prod.primaryLocation,
      operator: 'Sarah Chen (Manager)',
      approvedBy: 'Sarah Chen (Manager)',
    });

    setIsModalOpen(false);
    showToast(`✓ Adjustment ${newAdj.adjNumber} logged for ${newAdj.sku} (${qty > 0 ? '+' : ''}${qty} units). Stock and ledger updated & saved!`);
  };

  const openEditModal = (a) => {
    setEditingAdjustment(a);
    setEditReason(a.reason);
    setEditLocation(a.location);
    setEditOperator(a.operator);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingAdjustment) return;

    editAdjustment(editingAdjustment.id, {
      reason: editReason,
      location: editLocation,
      operator: editOperator,
    });

    showToast(`✓ Adjustment ${editingAdjustment.adjNumber} updated and saved!`);
    setEditingAdjustment(null);
  };

  const handleDeleteAdjustment = (a) => {
    if (window.confirm(`Delete adjustment record ${a.adjNumber}? Note: For full audit compliance, adjustments are recorded in ledger.`)) {
      deleteAdjustment(a.id);
      showToast(`🗑 Adjustment record ${a.adjNumber} deleted.`);
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
            border: '1px solid var(--ss-warning)',
            borderRadius: 'var(--ss-radius-md)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-text-primary)',
          }}
        >
          <span style={{ color: 'var(--ss-warning-text)', fontSize: '1.25rem' }}>Δ</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-warning-text)' }}>
              Stock Adjustment Event
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
              Cycle Count & Inventory Adjustments
            </h1>
            <span className="ss-badge ss-badge-warning">LIFECYCLE: STAGE 4 (ADJUST)</span>
            <span className="ss-badge ss-badge-success">PERSISTED LOCALSTORAGE</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Physical floor reconciliation, scrap logging, and discrepancy corrections with mandatory audit reasons.
          </p>
        </div>

        <button
          type="button"
          className="ss-btn ss-btn-primary"
          onClick={() => {
            setSelectedSku(products[0]?.sku || 'MTR-9002');
            setIsModalOpen(true);
          }}
          style={{ background: 'var(--ss-warning)', color: '#000000', borderColor: 'var(--ss-warning-border)' }}
        >
          Δ Log Cycle Adjustment
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
        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Total Audit Corrections
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {adjustments.length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>logged</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-primary">
              Δ
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Physical floor count reconciliations
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-danger-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Damage & Scrap Write-Offs
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-danger-text)', marginTop: '0.25rem' }}>
                {adjustments.filter((a) => a.delta < 0).length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>entries</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-danger">
              📉
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Defects, breakages & shrink
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Found Unrecorded Stock
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)', marginTop: '0.25rem' }}>
                {adjustments.filter((a) => a.delta > 0).length} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>inflows</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-success">
              📈
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Physical overflow recovered
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-warning-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Net Variance Units
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)', marginTop: '0.25rem' }}>
                {adjustments.reduce((acc, a) => acc + (a.delta || 0), 0)} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>units</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-warning">
              ⚖️
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Net discrepancy signed off
          </div>
        </div>
      </div>

      {/* Pending Discrepancy Approval Banner for Manager */}
      {pendingCount > 0 && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 'var(--ss-radius-md)',
            marginBottom: 'var(--ss-space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              ⏳
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--ss-warning-text)' }}>
                {pendingCount} Floor Count Discrepanc{pendingCount > 1 ? 'ies' : 'y'} Awaiting Manager Approval
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                Warehouse floor operators have submitted physical audit counts with inventory variances. Authorize or reject to synchronize system stock and financial ledger.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="ss-btn ss-btn-secondary"
              onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              {statusFilter === 'PENDING' ? 'Show All Records' : `Filter Pending Only (${pendingCount})`}
            </button>
          </div>
        </div>
      )}

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
        <div style={{ flex: '1 1 240px' }}>
          <input
            type="text"
            className="ss-input"
            placeholder="Search by Adjustment #, SKU, Reason, or Operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--ss-bg-app)', padding: '3px', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-border)' }}>
          {[
            { id: 'ALL', label: 'All', count: adjustments.length },
            { id: 'PENDING', label: 'Pending Review', count: pendingCount, highlight: pendingCount > 0 },
            { id: 'APPROVED', label: 'Approved', count: adjustments.filter(a => a.status === 'APPROVED').length },
            { id: 'REJECTED', label: 'Rejected', count: adjustments.filter(a => a.status === 'REJECTED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                border: 'none',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--ss-radius-xs)',
                cursor: 'pointer',
                background: statusFilter === tab.id
                  ? (tab.highlight ? 'var(--ss-warning)' : 'var(--ss-primary)')
                  : 'transparent',
                color: statusFilter === tab.id
                  ? (tab.highlight ? '#000000' : '#ffffff')
                  : 'var(--ss-text-secondary)',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.625rem',
                  padding: '1px 5px',
                  borderRadius: '9999px',
                  background: statusFilter === tab.id ? 'rgba(0,0,0,0.15)' : 'var(--ss-bg-surface)',
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Reason:</span>
          <select
            className="ss-select"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Reasons</option>
            <option value="Damage">Physical Damage / Scrap</option>
            <option value="Found">Found Unrecorded</option>
            <option value="Cycle">Cycle Count Correction</option>
            <option value="Quarantine">Defective Batch Quarantine</option>
            <option value="Sample">Sample Pull for QA</option>
          </select>
        </div>
      </div>

      {/* Adjustments Data Table */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>ADJ # & TIMESTAMP</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>ITEM (SKU)</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>LOCATION</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>SYSTEM</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>PHYSICAL</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>VARIANCE DELTA</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>REASON CODE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>APPROVAL</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.map((a) => {
                const isPositive = a.delta > 0;

                return (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {a.adjNumber}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {a.timestamp}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{a.productName}</div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                        {a.sku}
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
                        {a.location}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-muted)' }}>
                      {a.systemQty}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 600 }}>
                      {a.physicalQty}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--ss-font-mono)',
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: isPositive ? 'var(--ss-success-text)' : 'var(--ss-danger-text)',
                        }}
                      >
                        {isPositive ? `+${a.delta}` : `${a.delta}`}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                        {a.reason}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                        Logged by: {a.operator}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {a.status === 'PENDING_APPROVAL' ? (
                        <div>
                          <span className="ss-badge ss-badge-warning" style={{ fontWeight: 700 }}>⏳ PENDING APPROVAL</span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-warning)', marginTop: '2px', fontWeight: 600 }}>
                            Staff Count Discrepancy
                          </div>
                        </div>
                      ) : a.status === 'REJECTED' ? (
                        <div>
                          <span className="ss-badge ss-badge-danger">✕ REJECTED</span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                            By {a.rejectedBy || 'Manager'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="ss-badge ss-badge-success">✓ {a.status}</span>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                            By {a.approvedBy}
                          </div>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem', flexWrap: 'nowrap' }}>
                        {/* ✓ Approve */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-primary"
                          onClick={() => {
                            if (a.status !== 'PENDING_APPROVAL') return;
                            approveAdjustment(a.id, 'Sarah Chen (Manager)');
                            showToast(`✓ Discrepancy for ${a.sku} approved! Stock and ledger synchronized.`);
                          }}
                          disabled={a.status !== 'PENDING_APPROVAL'}
                          title={a.status === 'PENDING_APPROVAL' ? 'Approve Discrepancy & Sync Ledger' : 'No pending approval'}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', backgroundColor: 'var(--ss-success)', borderColor: 'var(--ss-success)', opacity: a.status !== 'PENDING_APPROVAL' ? 0.35 : 1, cursor: a.status !== 'PENDING_APPROVAL' ? 'not-allowed' : 'pointer' }}
                        >
                          ✓ Approve
                        </button>

                        {/* ✕ Reject */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-ghost"
                          onClick={() => {
                            if (a.status !== 'PENDING_APPROVAL') return;
                            rejectAdjustment(a.id, 'Sarah Chen (Manager)', 'Discrepancy count rejected by manager');
                            showToast(`✕ Discrepancy for ${a.sku} rejected.`);
                          }}
                          disabled={a.status !== 'PENDING_APPROVAL'}
                          title={a.status === 'PENDING_APPROVAL' ? 'Reject Discrepancy' : 'No pending approval'}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--ss-danger)', opacity: a.status !== 'PENDING_APPROVAL' ? 0.35 : 1, cursor: a.status !== 'PENDING_APPROVAL' ? 'not-allowed' : 'pointer' }}
                        >
                          ✕ Reject
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => openEditModal(a)}
                          title="Edit Adjustment"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          ✎ Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-ghost"
                          onClick={() => handleDeleteAdjustment(a)}
                          title="Delete Adjustment Record"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem', color: 'var(--ss-danger)' }}
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

      {/* Log Adjustment Modal */}
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
                  Log Inventory Cycle Count / Adjustment
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Reconcile physical counts with double-entry variance justification (Saves to localStorage).
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

            <form onSubmit={handleCreateAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Target Product SKU
                </label>
                <select
                  className="ss-select"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} (Current: {p.onHand} units in {p.primaryLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--ss-bg-app)', border: '1px solid var(--ss-border)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Workflow 2: Physical Count vs Recorded Stock Comparison
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                      Recorded Stock (System)
                    </label>
                    <input
                      type="text"
                      className="ss-input"
                      value={`${products.find((p) => p.sku === selectedSku)?.onHand || 0} units`}
                      disabled
                      style={{ opacity: 0.85, fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                      Physical Count (Actual)
                    </label>
                    <input
                      type="number"
                      className="ss-input"
                      value={(products.find((p) => p.sku === selectedSku)?.onHand || 0) + deltaQty}
                      onChange={(e) => {
                        const count = parseInt(e.target.value, 10);
                        const cur = products.find((p) => p.sku === selectedSku)?.onHand || 0;
                        setDeltaQty(isNaN(count) ? 0 : count - cur);
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Live Comparison Result Banner */}
                {deltaQty === 0 ? (
                  <div style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--ss-radius-sm)', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--ss-success)', color: 'var(--ss-success)', fontSize: '0.75rem', fontWeight: 600 }}>
                    ✓ Physical Count matches Recorded Stock. No adjustment needed.
                  </div>
                ) : (
                  <div style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--ss-radius-sm)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--ss-warning)', color: 'var(--ss-warning-text)', fontSize: '0.75rem', fontWeight: 600 }}>
                    ⚠️ Discrepancy detected: Variance is {deltaQty > 0 ? `+${deltaQty}` : deltaQty} units. Will create Stock Ledger entry.
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Adjustment Reason Code
                </label>
                <select
                  className="ss-select"
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value)}
                >
                  <option value="Physical Damage / Forklift Snag">Physical Damage / Forklift Snag</option>
                  <option value="Cycle Count Variance / Misplacement">Cycle Count Variance / Misplacement</option>
                  <option value="Found Unrecorded Stock during Cycle Count">Found Unrecorded Stock</option>
                  <option value="Defective Batch Quarantine">Defective Batch Quarantine</option>
                  <option value="Sample Pull for QA Lab">Sample Pull for QA Lab</option>
                </select>
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  background: 'var(--ss-warning-bg)',
                  borderRadius: 'var(--ss-radius-md)',
                  border: '1px solid var(--ss-warning-border)',
                  fontSize: '0.75rem',
                  color: 'var(--ss-warning-text)',
                }}
              >
                <strong>Audit Requirement:</strong> All variance deltas write an unalterable signed event to the Stock Ledger and adjust on-hand inventory.
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
                  style={{ background: 'var(--ss-warning)', color: '#000000', borderColor: 'var(--ss-warning-border)' }}
                >
                  Authorize & Sign Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Adjustment Modal */}
      {editingAdjustment && (
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
                  Edit Adjustment ({editingAdjustment.adjNumber})
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Update location or reason justification note.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setEditingAdjustment(null)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Reason Code / Audit Justification
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Storage Bin / Location
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Auditing Operator
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editOperator}
                  onChange={(e) => setEditOperator(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingAdjustment(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentsPage;
