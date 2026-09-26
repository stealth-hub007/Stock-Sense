import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

export const StaffDashboard = ({ onNavigateTab }) => {
  const { user, activeWarehouse } = useAuth();
  const {
    products,
    receipts,
    deliveries,
    transfers,
    adjustments,
    confirmReceipt,
    advanceDeliveryStatus,
    executeTransfer,
    addReceipt,
    addDelivery,
    addTransfer,
    editReceipt,
    editDelivery,
    editTransfer,
    deleteReceipt,
    deleteDelivery,
    deleteTransfer,
  } = useInventory();

  // Operational metrics
  const pendingReceipts = (receipts || []).filter((r) => r.status !== 'RECEIVED');
  const pickingQueue = (deliveries || []).filter((d) => d.status === 'READY_TO_DISPATCH' || d.status === 'ALLOCATED');
  const packingQueue = (deliveries || []).filter((d) => d.status === 'PICKED');
  const scheduledTransfers = (transfers || []).filter((t) => t.status === 'SCHEDULED');
  const pendingCountReviews = (adjustments || []).filter((a) => a.status === 'PENDING_APPROVAL');

  const totalActionItems = pendingReceipts.length + pickingQueue.length + packingQueue.length + scheduledTransfers.length;

  // Table filters & search
  const [tableFilter, setTableFilter] = useState('ALL'); // 'ALL' | 'RECEIPTS' | 'PICKING' | 'PACKING' | 'TRANSFERS'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modals for CRUD on Dashboard
  const [viewingRecord, setViewingRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState('RECEIPT'); // 'RECEIPT' | 'DELIVERY' | 'TRANSFER'

  const [formData, setFormData] = useState({
    ref: '',
    sku: products[0]?.sku || 'MTR-9002',
    qty: 25,
    location: 'Bay 01 - Receiving',
    toLocation: 'Zone C (Rapid Dispatch)',
    partner: 'Apex Precision Motors Ltd',
    carrier: 'FastFreight Global',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Compile combined queue items
  const queueItems = [
    ...pendingReceipts.map((r) => ({
      id: r.id || r.poNumber,
      entityType: 'RECEIPT',
      typeBadge: 'info',
      typeIcon: '📥',
      typeLabel: 'RECEIPT',
      ref: r.poNumber,
      productName: r.productName || r.sku,
      sku: r.sku,
      location: r.dock || 'Bay 01 - Receiving',
      destLocation: r.targetLocation || 'Zone A (Main Rack)',
      qty: r.expectedQty,
      partner: r.supplier || 'Industrial Supplier Co',
      carrier: r.carrier || 'Freight Line',
      status: r.status,
      actionText: 'Receive',
      onExecute: () => {
        confirmReceipt(r.poNumber, r.expectedQty, 'Alex Rivera (Staff)');
        showToast(`✓ Inbound receipt ${r.poNumber} received (+${r.expectedQty} units)!`);
      },
    })),
    ...pickingQueue.map((d) => ({
      id: d.id || d.orderNo,
      entityType: 'DELIVERY_PICK',
      typeBadge: 'primary',
      typeIcon: '🔍',
      typeLabel: 'PICKING',
      ref: d.orderNo,
      productName: d.productName || d.sku,
      sku: d.sku,
      location: d.sourceLocation || 'Zone C (Rapid Dispatch)',
      destLocation: d.destination || 'Customer Dock',
      qty: d.qty,
      partner: d.customer || 'Commercial Client Corp',
      carrier: d.carrier || 'FedEx Priority',
      status: d.status,
      actionText: 'Pick',
      onExecute: () => {
        advanceDeliveryStatus(d.orderNo, 'PICKED', 'Alex Rivera (Staff)');
        showToast(`✓ Order ${d.orderNo} picked! (${d.qty} units moved to Packing Bench)`);
      },
    })),
    ...packingQueue.map((d) => ({
      id: d.id || d.orderNo,
      entityType: 'DELIVERY_PACK',
      typeBadge: 'warning',
      typeIcon: '📦',
      typeLabel: 'PACKING',
      ref: d.orderNo,
      productName: d.productName || d.sku,
      sku: d.sku,
      location: 'Packing Bench Station 01',
      destLocation: d.destination || 'Customer Delivery',
      qty: d.qty,
      partner: d.customer || 'Commercial Client Corp',
      carrier: d.carrier || 'UPS Air Freight',
      status: d.status,
      actionText: 'Pack & Seal',
      onExecute: () => {
        advanceDeliveryStatus(d.orderNo, 'PACKED', 'Alex Rivera (Staff)');
        showToast(`✓ Order ${d.orderNo} sealed and packed in carton!`);
      },
    })),
    ...scheduledTransfers.map((t) => ({
      id: t.id || t.transferNo,
      entityType: 'TRANSFER',
      typeBadge: 'success',
      typeIcon: '⇄',
      typeLabel: 'RELOCATION',
      ref: t.transferNo,
      productName: t.productName || t.sku,
      sku: t.sku,
      location: `${t.fromLocation} → ${t.toLocation}`,
      destLocation: t.toLocation,
      qty: t.qty,
      partner: t.reason || 'Buffer replenishment',
      carrier: 'Floor Forklift',
      status: t.status,
      actionText: 'Transfer',
      onExecute: () => {
        executeTransfer(t.transferNo, 'Alex Rivera (Staff)');
        showToast(`✓ Transfer ${t.transferNo} executed (+${t.qty} units to ${t.toLocation})!`);
      },
    })),
  ];

  const filteredQueueItems = queueItems.filter((item) => {
    if (tableFilter === 'RECEIPTS' && item.entityType !== 'RECEIPT') return false;
    if (tableFilter === 'PICKING' && item.entityType !== 'DELIVERY_PICK') return false;
    if (tableFilter === 'PACKING' && item.entityType !== 'DELIVERY_PACK') return false;
    if (tableFilter === 'TRANSFERS' && item.entityType !== 'TRANSFER') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.ref.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.partner || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Open Quick Add Modal
  const handleOpenQuickAdd = (type = 'RECEIPT') => {
    setQuickAddType(type);
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const firstProd = products[0] || { sku: 'MTR-9002', primaryLocation: 'Bay 01 - Receiving' };

    setFormData({
      ref: type === 'RECEIPT' ? `PO-${randNum}` : type === 'DELIVERY' ? `SO-${randNum}` : `TR-${randNum}`,
      sku: firstProd.sku,
      qty: type === 'DELIVERY' ? 10 : 25,
      location: type === 'TRANSFER' ? 'Rack A-02 (Bulk)' : 'Bay 01 - Receiving Dock',
      toLocation: 'Zone C (Rapid Dispatch)',
      partner: type === 'RECEIPT' ? 'Industrial Supplier Co' : 'Commercial Client Corp',
      carrier: 'FastFreight Global',
    });
    setIsQuickAddOpen(true);
  };

  const handleSaveQuickAdd = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === formData.sku) || products[0];

    if (quickAddType === 'RECEIPT') {
      addReceipt({
        poNumber: formData.ref,
        sku: formData.sku,
        productName: prod?.name || formData.sku,
        expectedQty: parseInt(formData.qty, 10) || 20,
        dock: formData.location,
        targetLocation: formData.toLocation,
        supplier: formData.partner,
        carrier: formData.carrier,
        status: 'PENDING',
      });
      showToast(`✓ Inbound PO ${formData.ref} created and queued on floor!`);
    } else if (quickAddType === 'DELIVERY') {
      addDelivery({
        orderNo: formData.ref,
        sku: formData.sku,
        productName: prod?.name || formData.sku,
        qty: parseInt(formData.qty, 10) || 10,
        sourceLocation: formData.location,
        destination: formData.toLocation,
        customer: formData.partner,
        carrier: formData.carrier,
        status: 'READY_TO_DISPATCH',
      });
      showToast(`✓ Delivery Order ${formData.ref} created and queued for picking!`);
    } else if (quickAddType === 'TRANSFER') {
      addTransfer({
        transferNo: formData.ref,
        sku: formData.sku,
        productName: prod?.name || formData.sku,
        qty: parseInt(formData.qty, 10) || 15,
        fromLocation: formData.location,
        toLocation: formData.toLocation,
        reason: 'Dashboard quick relocation',
        status: 'SCHEDULED',
      });
      showToast(`✓ Internal Transfer ${formData.ref} scheduled!`);
    }
    setIsQuickAddOpen(false);
  };

  // Handle Edit from Dashboard
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    const qty = parseInt(editingRecord.editQty, 10) || 1;

    if (editingRecord.entityType === 'RECEIPT') {
      editReceipt(editingRecord.ref, {
        poNumber: editingRecord.editRef,
        sku: editingRecord.editSku,
        expectedQty: qty,
        dock: editingRecord.editLocation,
        supplier: editingRecord.editPartner,
      });
      showToast(`✓ Receipt ${editingRecord.ref} updated!`);
    } else if (editingRecord.entityType === 'DELIVERY_PICK' || editingRecord.entityType === 'DELIVERY_PACK') {
      editDelivery(editingRecord.ref, {
        orderNo: editingRecord.editRef,
        sku: editingRecord.editSku,
        qty: qty,
        sourceLocation: editingRecord.editLocation,
        customer: editingRecord.editPartner,
      });
      showToast(`✓ Delivery order ${editingRecord.ref} updated!`);
    } else if (editingRecord.entityType === 'TRANSFER') {
      editTransfer(editingRecord.ref, {
        transferNo: editingRecord.editRef,
        sku: editingRecord.editSku,
        qty: qty,
        fromLocation: editingRecord.editLocation,
        reason: editingRecord.editPartner,
      });
      showToast(`✓ Transfer ${editingRecord.ref} updated!`);
    }
    setEditingRecord(null);
  };

  // Handle Delete from Dashboard
  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    if (deletingRecord.entityType === 'RECEIPT') {
      deleteReceipt(deletingRecord.ref);
      showToast(`🗑️ Receipt ${deletingRecord.ref} deleted!`, 'warning');
    } else if (deletingRecord.entityType === 'DELIVERY_PICK' || deletingRecord.entityType === 'DELIVERY_PACK') {
      deleteDelivery(deletingRecord.ref);
      showToast(`🗑️ Order ${deletingRecord.ref} deleted!`, 'warning');
    } else if (deletingRecord.entityType === 'TRANSFER') {
      deleteTransfer(deletingRecord.ref);
      showToast(`🗑️ Transfer ${deletingRecord.ref} deleted!`, 'warning');
    }
    setDeletingRecord(null);
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

      {/* Shift & Floor Status Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--ss-bg-surface)',
          border: '1px solid var(--ss-border)',
          borderRadius: 'var(--ss-radius-lg)',
          boxShadow: 'var(--ss-shadow-sm)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--ss-radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                Warehouse Floor Terminal
              </h1>
              <span className="ss-badge ss-badge-success" style={{ fontWeight: 700 }}>
                ● ACTIVE SHIFT
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              Operator: <strong style={{ color: 'var(--ss-text-primary)' }}>{user?.name || 'Alex Rivera'}</strong> • {activeWarehouse?.name || 'Main DC'} • Scanner Terminal #TC-52
            </div>
          </div>
        </div>

        {/* Quick Shift Summary Chips & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.4rem 0.75rem',
              backgroundColor: 'var(--ss-bg-app)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-md)',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--ss-text-muted)' }}>Tasks Pending: </span>
            <strong style={{ color: totalActionItems > 0 ? 'var(--ss-warning)' : 'var(--ss-success)', fontFamily: 'var(--ss-font-mono)' }}>
              {totalActionItems} Actions
            </strong>
          </div>

          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => handleOpenQuickAdd('RECEIPT')}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
          >
            + Quick Add
          </button>

          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={() => onNavigateTab('operations-hub')}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', fontWeight: 700 }}
          >
            🗄️ Operations Work Center →
          </button>
        </div>
      </div>

      {/* Operational Floor Metrics (Speed & Quantity Centric) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Metric 1: Pending Inbound */}
        <div
          className="ss-card"
          style={{
            padding: '1.25rem',
            borderTop: '4px solid var(--ss-info)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onClick={() => onNavigateTab('receipts')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Inbound Receiving
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {pendingReceipts.length}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>📥</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
            Shipments waiting at dock
          </div>
        </div>

        {/* Metric 2: Picking Queue */}
        <div
          className="ss-card"
          style={{
            padding: '1.25rem',
            borderTop: '4px solid var(--ss-primary)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onClick={() => onNavigateTab('deliveries')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Order Picking
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {pickingQueue.length}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>🔍</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
            Orders ready for bin pick
          </div>
        </div>

        {/* Metric 3: Packing Queue */}
        <div
          className="ss-card"
          style={{
            padding: '1.25rem',
            borderTop: '4px solid var(--ss-warning)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onClick={() => onNavigateTab('deliveries')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Packing Bench
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {packingQueue.length}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
            Picked orders to cartonize
          </div>
        </div>

        {/* Metric 4: Internal Transfers */}
        <div
          className="ss-card"
          style={{
            padding: '1.25rem',
            borderTop: '4px solid var(--ss-success)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onClick={() => onNavigateTab('transfers')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bin Relocations
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                {scheduledTransfers.length}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>⇄</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
            Scheduled store & rack shifts
          </div>
        </div>
      </div>

      {/* FAST OPERATIONAL ACTIONS (1-Click Floor Launch) */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚡</span>
          <span>Fast Operational Actions (1-Click Floor Launch)</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Action 1: Receive Goods */}
          <div className="ss-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📥</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                  Inbound Receiving
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Unload supplier trucks, confirm quantities, and increment stock at receiving docks.
              </p>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-primary"
              onClick={() => onNavigateTab('receipts')}
              style={{ justifyContent: 'center', width: '100%', padding: '0.55rem', fontWeight: 700 }}
            >
              Start Receiving ({pendingReceipts.length}) →
            </button>
          </div>

          {/* Action 2: Pick Orders */}
          <div className="ss-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🔍</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                  Order Picking
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Navigate to specific warehouse bins, verify SKU barcodes, and mark products as picked.
              </p>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-primary"
              onClick={() => onNavigateTab('deliveries')}
              style={{ justifyContent: 'center', width: '100%', padding: '0.55rem', fontWeight: 700 }}
            >
              Start Picking ({pickingQueue.length}) →
            </button>
          </div>

          {/* Action 3: Pack & Cartonize */}
          <div className="ss-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📦</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                  Packing Bench
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Verify picked items, select packing containers, and seal orders ready for carrier dispatch.
              </p>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-secondary"
              onClick={() => onNavigateTab('deliveries')}
              style={{ justifyContent: 'center', width: '100%', padding: '0.55rem', fontWeight: 700 }}
            >
              Open Packing Bench ({packingQueue.length}) →
            </button>
          </div>

          {/* Action 4: Stock Counting */}
          <div className="ss-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🎯</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                  Physical Stock Count
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Count physical bin inventory, calculate discrepancies live, and submit to manager for sign-off.
              </p>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-secondary"
              onClick={() => onNavigateTab('stock-counting')}
              style={{ justifyContent: 'center', width: '100%', padding: '0.55rem', fontWeight: 700 }}
            >
              Perform Stock Count →
            </button>
          </div>
        </div>
      </div>

      {/* LIVE OPERATIONAL FLOOR QUEUE TABLE WITH INLINE CRUD */}
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
              Live Operational Floor Queue
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              Active floor tasks: View details, edit parameters, execute workflows, or remove tasks
            </div>
          </div>

          {/* Table Quick Filters & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[
                { id: 'ALL', label: `All (${queueItems.length})` },
                { id: 'RECEIPTS', label: `📥 Inbound (${pendingReceipts.length})` },
                { id: 'PICKING', label: `🔍 Picking (${pickingQueue.length})` },
                { id: 'PACKING', label: `📦 Packing (${packingQueue.length})` },
                { id: 'TRANSFERS', label: `⇄ Transfers (${scheduledTransfers.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`ss-btn ${tableFilter === tab.id ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => setTableFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="ss-input"
              placeholder="Search floor queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', width: '180px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>TYPE</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>REFERENCE</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>PRODUCT & SKU</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>LOCATION / DOCK</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>QTY</th>
                <th style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueueItems.map((item) => (
                <tr key={`${item.entityType}-${item.id}`} style={{ borderBottom: '1px solid var(--ss-border-subtle)' }}>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <span className={`ss-badge ss-badge-${item.typeBadge}`}>
                      {item.typeIcon} {item.typeLabel}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                    {item.ref}
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-primary)', fontFamily: 'var(--ss-font-mono)' }}>{item.sku}</div>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--ss-text-secondary)', fontFamily: 'var(--ss-font-mono)', fontSize: '0.75rem' }}>
                    {item.location}
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                    {item.qty} units
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      {/* View */}
                      <button
                        type="button"
                        className="ss-btn ss-btn-secondary"
                        onClick={() => setViewingRecord(item)}
                        title="View details"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem', width: '30px', justifyContent: 'center' }}
                      >
                        👁️
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        className="ss-btn ss-btn-secondary"
                        onClick={() =>
                          setEditingRecord({
                            ...item,
                            editRef: item.ref,
                            editSku: item.sku,
                            editQty: item.qty,
                            editLocation: item.location,
                            editPartner: item.partner,
                          })
                        }
                        title="Edit record"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem', width: '30px', justifyContent: 'center' }}
                      >
                        ✏️
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className="ss-btn ss-btn-ghost"
                        onClick={() => setDeletingRecord(item)}
                        title="Delete task"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem', width: '30px', justifyContent: 'center', color: 'var(--ss-danger)' }}
                      >
                        🗑️
                      </button>

                      {/* Execute */}
                      <button
                        type="button"
                        className="ss-btn ss-btn-primary"
                        onClick={item.onExecute}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', fontWeight: 700, minWidth: '90px', justifyContent: 'center' }}
                      >
                        {item.actionText} →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredQueueItems.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                    ✓ No active tasks matching current filter! Great floor efficiency.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW DETAILS MODAL */}
      {viewingRecord && (
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
                <span style={{ fontSize: '1.5rem' }}>{viewingRecord.typeIcon}</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    {viewingRecord.ref}
                  </h3>
                  <span className={`ss-badge ss-badge-${viewingRecord.typeBadge}`}>{viewingRecord.typeLabel}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Product:</div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{viewingRecord.productName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-primary)', fontFamily: 'var(--ss-font-mono)' }}>SKU: {viewingRecord.sku}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Location:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{viewingRecord.location}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Quantity:</div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                    {viewingRecord.qty} units
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Partner / Note:</div>
                <div style={{ fontSize: '0.8125rem' }}>{viewingRecord.partner}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setViewingRecord(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-primary"
                onClick={() => {
                  const item = viewingRecord;
                  setViewingRecord(null);
                  item.onExecute();
                }}
                style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
              >
                Execute {viewingRecord.actionText} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT RECORD MODAL */}
      {editingRecord && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✏️</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Edit {editingRecord.typeLabel}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Reference: {editingRecord.ref}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Reference Identifier
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingRecord.editRef}
                  onChange={(e) => setEditingRecord({ ...editingRecord, editRef: e.target.value })}
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
                    value={editingRecord.editQty}
                    onChange={(e) => setEditingRecord({ ...editingRecord, editQty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editingRecord.editLocation}
                    onChange={(e) => setEditingRecord({ ...editingRecord, editLocation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Partner / Note
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingRecord.editPartner || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, editPartner: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingRecord(null)}
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

      {/* MODAL 3: DELETE CONFIRMATION MODAL */}
      {deletingRecord && (
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
                  Confirm Deletion
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  This item will be removed from the floor queue.
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--ss-text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Are you sure you want to delete <strong>{deletingRecord.typeLabel}</strong>{' '}
              <code style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>{deletingRecord.ref}</code>?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setDeletingRecord(null)}
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

      {/* MODAL 4: QUICK ADD MODAL */}
      {isQuickAddOpen && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                  Quick Add Floor Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Quick Type Selection */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', padding: '0.25rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
              {[
                { type: 'RECEIPT', label: '📥 Inbound PO' },
                { type: 'DELIVERY', label: '📦 Delivery Order' },
                { type: 'TRANSFER', label: '⇄ Transfer' },
              ].map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => handleOpenQuickAdd(t.type)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: quickAddType === t.type ? 700 : 500,
                    borderRadius: 'var(--ss-radius-sm)',
                    border: 'none',
                    background: quickAddType === t.type ? 'var(--ss-bg-surface)' : 'transparent',
                    boxShadow: quickAddType === t.type ? 'var(--ss-shadow-sm)' : 'none',
                    color: quickAddType === t.type ? 'var(--ss-primary)' : 'var(--ss-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveQuickAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Reference #
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={formData.ref}
                    onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Product / SKU
                  </label>
                  <select
                    className="ss-select"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
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
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Location / Dock
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  {quickAddType === 'RECEIPT' ? 'Supplier Name' : quickAddType === 'DELIVERY' ? 'Customer' : 'Relocation Reason'}
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={formData.partner}
                  onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsQuickAddOpen(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
