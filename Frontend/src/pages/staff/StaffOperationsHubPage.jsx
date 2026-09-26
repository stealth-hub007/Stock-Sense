import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffOperationsHubPage = ({ onNavigateTab }) => {
  const {
    products,
    receipts,
    addReceipt,
    editReceipt,
    deleteReceipt,
    confirmReceipt,
    deliveries,
    addDelivery,
    editDelivery,
    deleteDelivery,
    advanceDeliveryStatus,
    transfers,
    addTransfer,
    editTransfer,
    deleteTransfer,
    executeTransfer,
    adjustments,
    addAdjustment,
    editAdjustment,
    deleteAdjustment,
  } = useInventory();

  // Tab & Filters
  const [activeEntityTab, setActiveEntityTab] = useState('ALL'); // 'ALL' | 'RECEIPTS' | 'DELIVERIES' | 'TRANSFERS' | 'COUNTS' | 'PRODUCTS'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeEntityTab, statusFilter]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState('RECEIPT'); // 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'COUNT'

  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // New Record Form States
  const [formData, setFormData] = useState({
    ref: '',
    sku: products[0]?.sku || 'MTR-9002',
    qty: 20,
    location: 'Bay 01 - Receiving',
    toLocation: 'Zone C (Rapid Dispatch)',
    partner: 'Apex Precision Motors Ltd',
    carrier: 'FastFreight Global',
    priority: 'HIGH',
    reason: 'Routine warehouse operation',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Compile Unified Records
  const unifiedRecords = useMemo(() => {
    const list = [];

    // Receipts
    (receipts || []).forEach((r) => {
      const isComplete = r.status === 'RECEIVED';
      list.push({
        id: r.id || r.poNumber,
        rawId: r.id,
        ref: r.poNumber,
        entityType: 'RECEIPT',
        typeLabel: 'Inbound Receipt',
        icon: '📥',
        typeBadge: 'info',
        sku: r.sku,
        productName: r.productName || r.sku,
        sourceLocation: r.dock || 'Bay 01 - Receiving',
        destLocation: r.targetLocation || 'Zone A (Main Rack)',
        qty: r.status === 'RECEIVED' ? (r.receivedQty || r.expectedQty) : r.expectedQty,
        expectedQty: r.expectedQty,
        status: r.status,
        isPending: !isComplete,
        partner: r.supplier || 'Industrial Supplier Co',
        carrier: r.carrier || 'Global Express',
        createdAt: r.createdAt || 'Today',
        raw: r,
      });
    });

    // Deliveries
    (deliveries || []).forEach((d) => {
      const isComplete = d.status === 'DELIVERED' || d.status === 'DISPATCHED';
      list.push({
        id: d.id || d.orderNo,
        rawId: d.id,
        ref: d.orderNo,
        entityType: 'DELIVERY',
        typeLabel: 'Delivery Order',
        icon: '📦',
        typeBadge: 'primary',
        sku: d.sku,
        productName: d.productName || d.sku,
        sourceLocation: d.sourceLocation || 'Zone C (Rapid Dispatch)',
        destLocation: d.destination || 'Customer Delivery Dock',
        qty: d.qty,
        status: d.status,
        isPending: !isComplete,
        partner: d.customer || 'Commercial Client Corp',
        carrier: d.carrier || 'FedEx Priority',
        priority: d.priority || 'HIGH',
        createdAt: d.createdAt || 'Today',
        raw: d,
      });
    });

    // Transfers
    (transfers || []).forEach((t) => {
      const isComplete = t.status === 'COMPLETED';
      list.push({
        id: t.id || t.transferNo,
        rawId: t.id,
        ref: t.transferNo,
        entityType: 'TRANSFER',
        typeLabel: 'Internal Transfer',
        icon: '⇄',
        typeBadge: 'success',
        sku: t.sku,
        productName: t.productName || t.sku,
        sourceLocation: t.fromLocation || 'Rack A-01',
        destLocation: t.toLocation || 'Zone C (Rapid Dispatch)',
        qty: t.qty,
        status: t.status,
        isPending: !isComplete,
        partner: t.reason || 'Buffer replenishment',
        priority: t.priority || 'MEDIUM',
        createdAt: t.createdAt || 'Today',
        raw: t,
      });
    });

    // Adjustments / Stock Counts
    (adjustments || []).forEach((a) => {
      const isComplete = a.status === 'APPROVED' || a.status === 'REJECTED';
      list.push({
        id: a.id || a.adjNumber,
        rawId: a.id,
        ref: a.adjNumber,
        entityType: 'COUNT',
        typeLabel: 'Stock Audit Count',
        icon: '🎯',
        typeBadge: 'warning',
        sku: a.sku,
        productName: a.productName || a.sku,
        sourceLocation: a.location || 'Warehouse Bin',
        destLocation: 'Audit Ledger',
        qty: a.physicalQty,
        expectedQty: a.systemQty,
        variance: a.delta,
        status: a.status,
        isPending: !isComplete,
        partner: a.reason || 'Cycle Count Floor Discrepancy',
        operator: a.operator || 'Alex Rivera (Staff)',
        createdAt: a.timestamp || 'Today',
        raw: a,
      });
    });

    return list;
  }, [receipts, deliveries, transfers, adjustments]);

  // Filtering
  const filteredRecords = useMemo(() => {
    return unifiedRecords.filter((rec) => {
      // Tab filter
      if (activeEntityTab === 'RECEIPTS' && rec.entityType !== 'RECEIPT') return false;
      if (activeEntityTab === 'DELIVERIES' && rec.entityType !== 'DELIVERY') return false;
      if (activeEntityTab === 'TRANSFERS' && rec.entityType !== 'TRANSFER') return false;
      if (activeEntityTab === 'COUNTS' && rec.entityType !== 'COUNT') return false;

      // Status filter
      if (statusFilter === 'PENDING' && !rec.isPending) return false;
      if (statusFilter === 'COMPLETED' && rec.isPending) return false;

      // Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesRef = rec.ref.toLowerCase().includes(q);
        const matchesSku = rec.sku.toLowerCase().includes(q);
        const matchesProd = rec.productName.toLowerCase().includes(q);
        const matchesSrc = (rec.sourceLocation || '').toLowerCase().includes(q);
        const matchesDest = (rec.destLocation || '').toLowerCase().includes(q);
        const matchesPartner = (rec.partner || '').toLowerCase().includes(q);
        const matchesStatus = (rec.status || '').toLowerCase().includes(q);
        return matchesRef || matchesSku || matchesProd || matchesSrc || matchesDest || matchesPartner || matchesStatus;
      }

      return true;
    });
  }, [unifiedRecords, activeEntityTab, statusFilter, searchTerm]);

  // Pagination Calculations
  const totalRecords = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, safeCurrentPage, pageSize]);

  // Catalog Products Pagination Calculations
  const filteredProducts = useMemo(() => {
    return (products || []).filter((p) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.primaryLocation || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    });
  }, [products, searchTerm]);

  const totalProducts = filteredProducts.length;
  const totalProductPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const safeProductPage = Math.min(currentPage, totalProductPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (safeProductPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, safeProductPage, pageSize]);

  // Handle Create Record
  const handleOpenCreateModal = (type = 'RECEIPT') => {
    setCreateType(type);
    const firstProd = products[0] || { sku: 'MTR-9002', primaryLocation: 'Bay 01 - Receiving' };
    const randNum = Math.floor(1000 + Math.random() * 9000);

    if (type === 'RECEIPT') {
      setFormData({
        ref: `PO-${randNum}`,
        sku: firstProd.sku,
        qty: 30,
        location: 'Bay 01 - Receiving Dock',
        toLocation: firstProd.primaryLocation || 'Zone A (Main Rack)',
        partner: 'Apex Precision Motors Ltd',
        carrier: 'FastFreight Global',
        priority: 'HIGH',
        reason: 'Inbound stock purchase',
      });
    } else if (type === 'DELIVERY') {
      setFormData({
        ref: `SO-${randNum}`,
        sku: firstProd.sku,
        qty: 10,
        location: firstProd.primaryLocation || 'Zone C (Rapid Dispatch)',
        toLocation: 'Chicago, IL, USA',
        partner: 'Acme Robotics Industrial Corp',
        carrier: 'FedEx Freight Priority',
        priority: 'HIGH',
        reason: 'Client fulfillment order',
      });
    } else if (type === 'TRANSFER') {
      setFormData({
        ref: `TR-${randNum}`,
        sku: firstProd.sku,
        qty: 15,
        location: firstProd.primaryLocation || 'Rack A-02 (Bulk)',
        toLocation: 'Zone C (Rapid Dispatch)',
        partner: 'Internal Buffer Replenishment',
        carrier: 'Internal Forklift',
        priority: 'MEDIUM',
        reason: 'Stage items for upcoming outgoing rush',
      });
    } else if (type === 'COUNT') {
      setFormData({
        ref: `ADJ-${randNum}`,
        sku: firstProd.sku,
        qty: firstProd.onHand || 50,
        location: firstProd.primaryLocation || 'Zone C (Rapid Dispatch)',
        toLocation: 'Inventory Recount Bin',
        partner: 'Cycle Count Audit Discrepancy',
        carrier: 'Operator Scanner #TC-52',
        priority: 'NORMAL',
        reason: 'Weekly physical cycle count',
      });
    }
    setIsCreateModalOpen(true);
  };

  const handleSaveNewRecord = (e) => {
    e.preventDefault();
    const targetProd = products.find((p) => p.sku === formData.sku) || products[0];

    if (createType === 'RECEIPT') {
      const created = addReceipt({
        poNumber: formData.ref,
        sku: formData.sku,
        productName: targetProd?.name || formData.sku,
        expectedQty: parseInt(formData.qty, 10) || 10,
        dock: formData.location,
        targetLocation: formData.toLocation,
        supplier: formData.partner,
        carrier: formData.carrier,
        status: 'PENDING',
      });
      showToast(`✓ Inbound PO ${created.poNumber} created successfully! Available for receiving.`);
    } else if (createType === 'DELIVERY') {
      const created = addDelivery({
        orderNo: formData.ref,
        sku: formData.sku,
        productName: targetProd?.name || formData.sku,
        qty: parseInt(formData.qty, 10) || 5,
        sourceLocation: formData.location,
        destination: formData.toLocation,
        customer: formData.partner,
        carrier: formData.carrier,
        priority: formData.priority,
        status: 'READY_TO_DISPATCH',
      });
      showToast(`✓ Delivery Order ${created.orderNo} created! Added to Picking Queue.`);
    } else if (createType === 'TRANSFER') {
      const created = addTransfer({
        transferNo: formData.ref,
        sku: formData.sku,
        productName: targetProd?.name || formData.sku,
        qty: parseInt(formData.qty, 10) || 10,
        fromLocation: formData.location,
        toLocation: formData.toLocation,
        reason: formData.reason,
        priority: formData.priority,
        status: 'SCHEDULED',
      });
      showToast(`✓ Internal Transfer ${created.transferNo} scheduled!`);
    } else if (createType === 'COUNT') {
      const expected = targetProd?.onHand || 0;
      const counted = parseInt(formData.qty, 10) || 0;
      const delta = counted - expected;
      const created = addAdjustment({
        adjNumber: formData.ref,
        sku: formData.sku,
        systemQty: expected,
        physicalQty: counted,
        delta,
        location: formData.location,
        reason: formData.reason,
        status: 'PENDING_APPROVAL',
        operator: 'Alex Rivera (Staff)',
        submittedByRole: 'WAREHOUSE_STAFF',
      });
      showToast(`✓ Stock count ${created.adjNumber} submitted for manager audit approval!`);
    }

    setIsCreateModalOpen(false);
  };

  // Handle Edit Record
  const handleOpenEditModal = (rec) => {
    setEditingItem({
      ...rec,
      editRef: rec.ref,
      editSku: rec.sku,
      editQty: rec.qty,
      editSrcLocation: rec.sourceLocation,
      editDestLocation: rec.destLocation,
      editPartner: rec.partner,
      editCarrier: rec.carrier || '',
      editStatus: rec.status,
      editReason: rec.raw?.reason || rec.partner,
      editPriority: rec.raw?.priority || 'NORMAL',
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const qty = parseInt(editingItem.editQty, 10) || 1;

    if (editingItem.entityType === 'RECEIPT') {
      editReceipt(editingItem.ref, {
        poNumber: editingItem.editRef,
        sku: editingItem.editSku,
        expectedQty: qty,
        dock: editingItem.editSrcLocation,
        targetLocation: editingItem.editDestLocation,
        supplier: editingItem.editPartner,
        carrier: editingItem.editCarrier,
        status: editingItem.editStatus,
      });
      showToast(`✓ Receipt ${editingItem.ref} updated successfully!`);
    } else if (editingItem.entityType === 'DELIVERY') {
      editDelivery(editingItem.ref, {
        orderNo: editingItem.editRef,
        sku: editingItem.editSku,
        qty: qty,
        sourceLocation: editingItem.editSrcLocation,
        destination: editingItem.editDestLocation,
        customer: editingItem.editPartner,
        carrier: editingItem.editCarrier,
        status: editingItem.editStatus,
      });
      showToast(`✓ Delivery Order ${editingItem.ref} updated!`);
    } else if (editingItem.entityType === 'TRANSFER') {
      editTransfer(editingItem.ref, {
        transferNo: editingItem.editRef,
        sku: editingItem.editSku,
        qty: qty,
        fromLocation: editingItem.editSrcLocation,
        toLocation: editingItem.editDestLocation,
        reason: editingItem.editReason,
        priority: editingItem.editPriority,
        status: editingItem.editStatus,
      });
      showToast(`✓ Transfer ${editingItem.ref} updated!`);
    } else if (editingItem.entityType === 'COUNT') {
      const prod = products.find((p) => p.sku === editingItem.editSku);
      const system = editingItem.raw?.systemQty ?? prod?.onHand ?? 0;
      const delta = qty - system;
      editAdjustment(editingItem.ref, {
        adjNumber: editingItem.editRef,
        sku: editingItem.editSku,
        physicalQty: qty,
        delta,
        location: editingItem.editSrcLocation,
        reason: editingItem.editReason,
        status: editingItem.editStatus,
      });
      showToast(`✓ Count adjustment ${editingItem.ref} updated!`);
    }

    setEditingItem(null);
  };

  // Handle Delete Record
  const handleConfirmDelete = () => {
    if (!deletingItem) return;

    if (deletingItem.entityType === 'RECEIPT') {
      deleteReceipt(deletingItem.ref);
      showToast(`🗑️ Receipt ${deletingItem.ref} deleted permanently.`, 'warning');
    } else if (deletingItem.entityType === 'DELIVERY') {
      deleteDelivery(deletingItem.ref);
      showToast(`🗑️ Delivery order ${deletingItem.ref} removed from queue.`, 'warning');
    } else if (deletingItem.entityType === 'TRANSFER') {
      deleteTransfer(deletingItem.ref);
      showToast(`🗑️ Transfer ${deletingItem.ref} deleted.`, 'warning');
    } else if (deletingItem.entityType === 'COUNT') {
      deleteAdjustment(deletingItem.ref);
      showToast(`🗑️ Count record ${deletingItem.ref} removed.`, 'warning');
    }

    setDeletingItem(null);
  };

  // Quick Inline Execution Action
  const handleQuickExecute = (rec) => {
    if (rec.entityType === 'RECEIPT') {
      confirmReceipt(rec.ref, rec.expectedQty || rec.qty, 'Alex Rivera (Staff)');
      showToast(`✓ Inbound receipt ${rec.ref} confirmed & received (+${rec.qty} units). Stock updated!`);
    } else if (rec.entityType === 'DELIVERY') {
      if (rec.status === 'READY_TO_DISPATCH' || rec.status === 'ALLOCATED') {
        advanceDeliveryStatus(rec.ref, 'PICKED', 'Alex Rivera (Staff)');
        showToast(`✓ Order ${rec.ref} picked (${rec.qty} units) and transferred to packing bench!`);
      } else if (rec.status === 'PICKED') {
        advanceDeliveryStatus(rec.ref, 'PACKED', 'Alex Rivera (Staff)');
        showToast(`✓ Order ${rec.ref} packed and sealed in shipping carton!`);
      } else if (rec.status === 'PACKED') {
        advanceDeliveryStatus(rec.ref, 'DISPATCHED', 'Alex Rivera (Staff)');
        showToast(`✓ Order ${rec.ref} handed over to carrier dispatch!`);
      }
    } else if (rec.entityType === 'TRANSFER') {
      executeTransfer(rec.ref, 'Alex Rivera (Staff)');
      showToast(`✓ Relocation ${rec.ref} executed! Stock moved to ${rec.destLocation}.`);
    } else if (rec.entityType === 'COUNT') {
      showToast(`📋 Audit adjustment ${rec.ref} is under manager review.`);
    }
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
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header with Action Center */}
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
              Operations Work Center
            </h1>
            <span className="ss-badge ss-badge-primary">ALL-IN-ONE FLOOR LOGS</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Centralized warehouse register: Search, inspect, create, update, and process all inbound intake, fulfillment orders, bin relocations, and stock audits.
          </p>
        </div>

        {/* Global Multi-Action + New Record Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => handleOpenCreateModal('RECEIPT')}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.8rem', fontWeight: 600 }}
          >
            📥 + Inbound PO
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => handleOpenCreateModal('DELIVERY')}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.8rem', fontWeight: 600 }}
          >
            📦 + Delivery Order
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={() => handleOpenCreateModal('TRANSFER')}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.8rem', fontWeight: 600 }}
          >
            ⇄ + Relocation
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={() => handleOpenCreateModal('COUNT')}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem', fontWeight: 700 }}
          >
            🎯 + Stock Count
          </button>
        </div>
      </div>

      {/* KPI Counters Bar (Fast Floor Overview) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          className="ss-card"
          style={{
            padding: '1rem',
            borderLeft: '4px solid var(--ss-info)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveEntityTab('RECEIPTS')}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
            Inbound Receipts
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)' }}>
              {receipts?.length || 0}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ss-info)', fontWeight: 600 }}>
              {(receipts || []).filter((r) => r.status !== 'RECEIVED').length} Pending
            </span>
          </div>
        </div>

        <div
          className="ss-card"
          style={{
            padding: '1rem',
            borderLeft: '4px solid var(--ss-primary)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveEntityTab('DELIVERIES')}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
            Fulfillment Orders
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)' }}>
              {deliveries?.length || 0}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ss-primary)', fontWeight: 600 }}>
              {(deliveries || []).filter((d) => d.status !== 'DISPATCHED' && d.status !== 'DELIVERED').length} Active
            </span>
          </div>
        </div>

        <div
          className="ss-card"
          style={{
            padding: '1rem',
            borderLeft: '4px solid var(--ss-success)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveEntityTab('TRANSFERS')}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
            Internal Transfers
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)' }}>
              {transfers?.length || 0}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ss-success)', fontWeight: 600 }}>
              {(transfers || []).filter((t) => t.status === 'SCHEDULED').length} Scheduled
            </span>
          </div>
        </div>

        <div
          className="ss-card"
          style={{
            padding: '1rem',
            borderLeft: '4px solid var(--ss-warning)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveEntityTab('COUNTS')}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
            Stock Audit Counts
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)' }}>
              {adjustments?.length || 0}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ss-warning-text)', fontWeight: 600 }}>
              {(adjustments || []).filter((a) => a.status === 'PENDING_APPROVAL').length} In Review
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Entity Switcher, Status Filter, Search Input */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Entity Tab Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `🌟 All Records (${unifiedRecords.length})` },
              { id: 'RECEIPTS', label: `📥 Inbound POs (${receipts?.length || 0})` },
              { id: 'DELIVERIES', label: `📦 Orders (${deliveries?.length || 0})` },
              { id: 'TRANSFERS', label: `⇄ Transfers (${transfers?.length || 0})` },
              { id: 'COUNTS', label: `🎯 Stock Counts (${adjustments?.length || 0})` },
              { id: 'PRODUCTS', label: `📋 Catalog SKUs (${products?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`ss-btn ${activeEntityTab === tab.id ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                onClick={() => setActiveEntityTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          {activeEntityTab !== 'PRODUCTS' && (
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                className={`ss-btn ${statusFilter === 'ALL' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                onClick={() => setStatusFilter('ALL')}
              >
                All Status
              </button>
              <button
                type="button"
                className={`ss-btn ${statusFilter === 'PENDING' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending / Active
              </button>
              <button
                type="button"
                className={`ss-btn ${statusFilter === 'COMPLETED' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Completed
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="ss-input"
            placeholder="Universal Live Search: Reference #, SKU, Product name, Dock, Bin, Customer, Supplier, or Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ss-text-muted)' }}>
            🔍
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--ss-text-muted)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MASTER UNIFIED OPERATIONS TABLE (RECEIPTS, DELIVERIES, TRANSFERS, COUNTS) */}
      {/* ========================================================================= */}
      {activeEntityTab !== 'PRODUCTS' && (
        <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, width: '140px' }}>TYPE</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, width: '160px' }}>REFERENCE #</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '180px' }}>PRODUCT & SKU</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '220px' }}>LOCATION ROUTING</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '110px' }}>QUANTITY</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'center', width: '130px' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '255px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((rec) => (
                  <tr
                    key={`${rec.entityType}-${rec.id}`}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      backgroundColor: rec.isPending ? 'rgba(79, 70, 229, 0.01)' : 'transparent',
                    }}
                  >
                    {/* Entity Type Badge */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`ss-badge ss-badge-${rec.typeBadge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>{rec.icon}</span>
                        <span>{rec.typeLabel}</span>
                      </span>
                    </td>

                    {/* Reference # */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {rec.ref}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                        {rec.partner}
                      </div>
                    </td>

                    {/* Product & SKU */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{rec.productName}</div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '2px' }}>
                        {rec.sku}
                      </div>
                    </td>

                    {/* Location Routing */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--ss-font-mono)', fontSize: '0.75rem', color: 'var(--ss-text-secondary)', fontWeight: 600 }}>
                          {rec.sourceLocation}
                        </span>
                        {rec.destLocation && (
                          <>
                            <span style={{ color: 'var(--ss-primary)', fontSize: '0.75rem', fontWeight: 800 }}>➔</span>
                            <span style={{ fontFamily: 'var(--ss-font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                              {rec.destLocation}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 700 }}>
                      <span>{rec.qty} units</span>
                      {rec.variance !== undefined && rec.variance !== 0 && (
                        <div style={{ fontSize: '0.6875rem', color: rec.variance < 0 ? 'var(--ss-danger)' : 'var(--ss-primary)', marginTop: '2px' }}>
                          Var: {rec.variance > 0 ? `+${rec.variance}` : rec.variance}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        className={`ss-badge ${
                          rec.isPending
                            ? rec.status === 'READY_TO_DISPATCH' || rec.status === 'READY_TO_RECEIVE'
                              ? 'ss-badge-info'
                              : 'ss-badge-warning'
                            : 'ss-badge-success'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>

                    {/* ACTIONS: VIEW, EDIT, DELETE, QUICK-EXECUTE (Fixed Slots for Perfect Alignment) */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        {/* 1. View / Inspect */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => setViewingItem(rec)}
                          title="View record details"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: '64px', justifyContent: 'center' }}
                        >
                          👁️ View
                        </button>

                        {/* 2. Edit */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => handleOpenEditModal(rec)}
                          title="Edit record parameters"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: '60px', justifyContent: 'center' }}
                        >
                          ✏️ Edit
                        </button>

                        {/* 3. Delete */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-ghost"
                          onClick={() => setDeletingItem(rec)}
                          title="Delete / cancel record"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem', width: '32px', justifyContent: 'center', color: 'var(--ss-danger)' }}
                        >
                          🗑️
                        </button>

                        {/* 4. Action / Status Slot (Fixed Width 74px) */}
                        <div style={{ width: '74px', display: 'flex', justifyContent: 'center' }}>
                          {rec.isPending ? (
                            <button
                              type="button"
                              className="ss-btn ss-btn-primary"
                              onClick={() => handleQuickExecute(rec)}
                              title="Execute operational action"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: '100%', justifyContent: 'center', fontWeight: 700 }}
                            >
                              {rec.entityType === 'RECEIPT'
                                ? 'Receive'
                                : rec.entityType === 'DELIVERY'
                                ? rec.status === 'PICKED'
                                  ? 'Pack'
                                  : 'Pick'
                                : rec.entityType === 'TRANSFER'
                                ? 'Transfer'
                                : 'Review'}
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                color: 'var(--ss-text-muted)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.25rem 0.4rem',
                                borderRadius: 'var(--ss-radius-sm)',
                                backgroundColor: 'var(--ss-bg-app)',
                                width: '100%',
                                border: '1px solid var(--ss-border-subtle)',
                              }}
                            >
                              ✓ Done
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                      <span style={{ fontSize: '2rem' }}>🔍</span>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.5rem' }}>
                        No records match the current filter criteria
                      </div>
                      <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                        Try clearing search or click one of the "+ New Record" buttons above to create an entry.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modern & Reliable Pagination Bar */}
          {totalRecords > 0 && (
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
              {/* Left: Summary Count */}
              <div style={{ color: 'var(--ss-text-muted)' }}>
                Showing <strong style={{ color: 'var(--ss-text-primary)' }}>{(safeCurrentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong style={{ color: 'var(--ss-text-primary)' }}>{Math.min(safeCurrentPage * pageSize, totalRecords)}</strong> of{' '}
                <strong style={{ color: 'var(--ss-text-primary)' }}>{totalRecords}</strong> operational records
              </div>

              {/* Center: Rows Per Page */}
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
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Right: Page Navigation Controls */}
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

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((pageNum) => {
                    return (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - safeCurrentPage) <= 1
                    );
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
                            fontWeight: 700,
                            borderRadius: 'var(--ss-radius-sm)',
                            border: pageNum === safeCurrentPage ? '1px solid var(--ss-primary)' : '1px solid var(--ss-border)',
                            backgroundColor: pageNum === safeCurrentPage ? 'var(--ss-primary)' : 'var(--ss-bg-surface)',
                            color: pageNum === safeCurrentPage ? '#ffffff' : 'var(--ss-text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 150ms ease',
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
      )}

      {/* ========================================================================= */}
      {/* 2. CATALOG PRODUCTS LIVE INVENTORY TAB                                    */}
      {/* ========================================================================= */}
      {activeEntityTab === 'PRODUCTS' && (
        <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, width: '130px' }}>SKU</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '180px' }}>PRODUCT NAME</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '150px' }}>CATEGORY</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '130px' }}>PRIMARY BIN</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '110px' }}>ON HAND</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '110px' }}>AVAILABLE</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'center', width: '130px' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '170px' }}>QUICK ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => (
                  <tr key={p.sku} style={{ borderBottom: '1px solid var(--ss-border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                      {p.sku}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-secondary)' }}>
                      {p.category || 'General Industrial'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--ss-font-mono)' }}>
                      {p.primaryLocation || 'Zone A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 700 }}>
                      {p.onHand} units
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success)', fontWeight: 700 }}>
                      {p.available ?? p.onHand} units
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        className={`ss-badge ${
                          p.status === 'IN_STOCK' ? 'ss-badge-success' : p.status === 'LOW_STOCK' ? 'ss-badge-warning' : 'ss-badge-danger'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => {
                            handleOpenCreateModal('COUNT');
                            setFormData((prev) => ({ ...prev, sku: p.sku, qty: p.onHand, location: p.primaryLocation }));
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: '70px', justifyContent: 'center' }}
                        >
                          🎯 Audit
                        </button>
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => {
                            handleOpenCreateModal('TRANSFER');
                            setFormData((prev) => ({ ...prev, sku: p.sku, location: p.primaryLocation }));
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: '70px', justifyContent: 'center' }}
                        >
                          ⇄ Move
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                      No catalog items match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Catalog Products Pagination Bar */}
          {totalProducts > 0 && (
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
                Showing <strong style={{ color: 'var(--ss-text-primary)' }}>{(safeProductPage - 1) * pageSize + 1}</strong> to{' '}
                <strong style={{ color: 'var(--ss-text-primary)' }}>{Math.min(safeProductPage * pageSize, totalProducts)}</strong> of{' '}
                <strong style={{ color: 'var(--ss-text-primary)' }}>{totalProducts}</strong> catalog products
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
                  disabled={safeProductPage === 1}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    opacity: safeProductPage === 1 ? 0.4 : 1,
                    cursor: safeProductPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                  title="First Page"
                >
                  ⇤
                </button>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeProductPage === 1}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    opacity: safeProductPage === 1 ? 0.4 : 1,
                    cursor: safeProductPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                  title="Previous Page"
                >
                  ← Prev
                </button>

                {Array.from({ length: totalProductPages }, (_, i) => i + 1)
                  .filter((pageNum) => {
                    return pageNum === 1 || pageNum === totalProductPages || Math.abs(pageNum - safeProductPage) <= 1;
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
                            fontWeight: safeProductPage === pageNum ? 700 : 500,
                            borderRadius: 'var(--ss-radius-sm)',
                            border:
                              safeProductPage === pageNum
                                ? '1px solid var(--ss-primary)'
                                : '1px solid var(--ss-border)',
                            backgroundColor:
                              safeProductPage === pageNum ? 'var(--ss-primary)' : 'var(--ss-bg-surface)',
                            color: safeProductPage === pageNum ? '#ffffff' : 'var(--ss-text-secondary)',
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
                  onClick={() => setCurrentPage((p) => Math.min(totalProductPages, p + 1))}
                  disabled={safeProductPage === totalProductPages}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    opacity: safeProductPage === totalProductPages ? 0.4 : 1,
                    cursor: safeProductPage === totalProductPages ? 'not-allowed' : 'pointer',
                  }}
                  title="Next Page"
                >
                  Next →
                </button>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setCurrentPage(totalProductPages)}
                  disabled={safeProductPage === totalProductPages}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    opacity: safeProductPage === totalProductPages ? 0.4 : 1,
                    cursor: safeProductPage === totalProductPages ? 'not-allowed' : 'pointer',
                  }}
                  title="Last Page"
                >
                  ⇥
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW RECORD DIALOG                                         */}
      {/* ========================================================================= */}
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
              maxWidth: '560px',
              padding: '1.75rem',
              borderRadius: 'var(--ss-radius-lg)',
              backgroundColor: 'var(--ss-bg-surface)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {createType === 'RECEIPT' ? '📥' : createType === 'DELIVERY' ? '📦' : createType === 'TRANSFER' ? '⇄' : '🎯'}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Create New{' '}
                    {createType === 'RECEIPT'
                      ? 'Inbound Receipt'
                      : createType === 'DELIVERY'
                      ? 'Delivery Order'
                      : createType === 'TRANSFER'
                      ? 'Internal Transfer'
                      : 'Stock Audit Count'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                    Warehouse Floor Operations Management
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Quick Entity Type Switcher Inside Modal */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', padding: '0.25rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
              {[
                { type: 'RECEIPT', label: '📥 Receipt' },
                { type: 'DELIVERY', label: '📦 Delivery' },
                { type: 'TRANSFER', label: '⇄ Transfer' },
                { type: 'COUNT', label: '🎯 Count' },
              ].map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => handleOpenCreateModal(t.type)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: createType === t.type ? 700 : 500,
                    borderRadius: 'var(--ss-radius-sm)',
                    border: 'none',
                    background: createType === t.type ? 'var(--ss-bg-surface)' : 'transparent',
                    boxShadow: createType === t.type ? 'var(--ss-shadow-sm)' : 'none',
                    color: createType === t.type ? 'var(--ss-primary)' : 'var(--ss-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveNewRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Reference Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Reference #
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={formData.ref}
                    onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                    style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 700 }}
                    required
                  />
                </div>

                {/* SKU Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Target Product / SKU
                  </label>
                  <select
                    className="ss-select"
                    value={formData.sku}
                    onChange={(e) => {
                      const p = products.find((prod) => prod.sku === e.target.value);
                      setFormData({
                        ...formData,
                        sku: e.target.value,
                        location: p?.primaryLocation || formData.location,
                      });
                    }}
                    style={{ fontWeight: 600 }}
                  >
                    {products.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    {createType === 'COUNT' ? 'Physical Counted Quantity' : 'Quantity (Units)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    {createType === 'RECEIPT' ? 'Receiving Dock' : createType === 'TRANSFER' ? 'Origin (From Bin)' : 'Source Location'}
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

              {/* Target / Destination Location */}
              {(createType === 'RECEIPT' || createType === 'DELIVERY' || createType === 'TRANSFER') && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    {createType === 'DELIVERY' ? 'Destination Address / Customer Dock' : 'Destination (To Location / Bin)'}
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* Partner (Supplier / Customer / Carrier) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    {createType === 'RECEIPT' ? 'Supplier Name' : createType === 'DELIVERY' ? 'Customer Client' : 'Reason / Note'}
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={formData.partner}
                    onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Carrier / Logistics Method
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={formData.carrier}
                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
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
                  style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Create & Register Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW COMPLETE RECORD DETAILS                                     */}
      {/* ========================================================================= */}
      {viewingItem && (
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
                <span style={{ fontSize: '1.5rem' }}>{viewingItem.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                      {viewingItem.ref}
                    </h3>
                    <span className={`ss-badge ss-badge-${viewingItem.typeBadge}`}>
                      {viewingItem.typeLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                    Created: {viewingItem.createdAt}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Item Card Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                  PRODUCT DETAILS
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
                  {viewingItem.productName}
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '2px' }}>
                  SKU: {viewingItem.sku}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                    SOURCE LOCATION
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                    {viewingItem.sourceLocation}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                    TARGET DESTINATION
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                    {viewingItem.destLocation || 'Local Bay'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                    OPERATIONAL QUANTITY
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '2px' }}>
                    {viewingItem.qty} units
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                    CURRENT STATUS
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span className="ss-badge ss-badge-success">{viewingItem.status}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                  PARTNER / CARRIER / NOTES
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                  {viewingItem.partner} {viewingItem.carrier ? `• ${viewingItem.carrier}` : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setViewingItem(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-primary"
                onClick={() => {
                  const rec = viewingItem;
                  setViewingItem(null);
                  handleOpenEditModal(rec);
                }}
                style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
              >
                ✏️ Edit This Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UNIVERSAL EDIT RECORD DIALOG                                     */}
      {/* ========================================================================= */}
      {editingItem && (
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
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✏️</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Edit {editingItem.typeLabel}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)' }}>
                    Ref: {editingItem.ref}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Reference Identifier
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editingItem.editRef}
                    onChange={(e) => setEditingItem({ ...editingItem, editRef: e.target.value })}
                    style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    SKU Code
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editingItem.editSku}
                    onChange={(e) => setEditingItem({ ...editingItem, editSku: e.target.value })}
                    style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Quantity (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={editingItem.editQty}
                    onChange={(e) => setEditingItem({ ...editingItem, editQty: e.target.value })}
                    style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Execution Status
                  </label>
                  <select
                    className="ss-select"
                    value={editingItem.editStatus}
                    onChange={(e) => setEditingItem({ ...editingItem, editStatus: e.target.value })}
                    style={{ fontWeight: 600 }}
                  >
                    {editingItem.entityType === 'RECEIPT' && (
                      <>
                        <option value="PENDING">PENDING</option>
                        <option value="READY_TO_RECEIVE">READY_TO_RECEIVE</option>
                        <option value="RECEIVED">RECEIVED</option>
                      </>
                    )}
                    {editingItem.entityType === 'DELIVERY' && (
                      <>
                        <option value="READY_TO_DISPATCH">READY_TO_DISPATCH</option>
                        <option value="PICKED">PICKED</option>
                        <option value="PACKED">PACKED</option>
                        <option value="DISPATCHED">DISPATCHED</option>
                      </>
                    )}
                    {editingItem.entityType === 'TRANSFER' && (
                      <>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </>
                    )}
                    {editingItem.entityType === 'COUNT' && (
                      <>
                        <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Source Location / Bin
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editingItem.editSrcLocation}
                    onChange={(e) => setEditingItem({ ...editingItem, editSrcLocation: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Target / Destination
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editingItem.editDestLocation || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, editDestLocation: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Partner / Notes / Reason
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingItem.editPartner || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, editPartner: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingItem(null)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION DIALOG                                       */}
      {/* ========================================================================= */}
      {deletingItem && (
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
              maxWidth: '440px',
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
                  This action will permanently delete this operational record.
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--ss-text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Are you sure you want to remove <strong>{deletingItem.typeLabel}</strong> with reference{' '}
              <code style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>{deletingItem.ref}</code> ({deletingItem.sku})?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setDeletingItem(null)}
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
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOperationsHubPage;
