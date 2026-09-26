import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffTasksPage = ({ onNavigateTab }) => {
  const {
    products,
    receipts,
    deliveries,
    transfers,
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

  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'RECEIVING' | 'PICKING' | 'PACKING' | 'TRANSFERS'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modals for CRUD
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTypeToCreate, setTaskTypeToCreate] = useState('RECEIVING');
  const [viewingTask, setViewingTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Form State for creating task
  const [newTaskForm, setNewTaskForm] = useState({
    ref: '',
    sku: products[0]?.sku || 'MTR-9002',
    qty: 25,
    location: 'Bay 01 - Receiving',
    toLocation: 'Zone C (Rapid Dispatch)',
    partner: 'Industrial Supplier Co',
    priority: 'HIGH',
    notes: 'Floor operational priority task',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Compile operational tasks
  const pendingReceipts = (receipts || [])
    .filter((r) => r.status !== 'RECEIVED')
    .map((r) => ({
      id: r.id || r.poNumber,
      rawId: r.id,
      entityType: 'RECEIPT',
      type: 'RECEIVING',
      typeLabel: 'Inbound Receiving',
      typeBadge: 'info',
      icon: '📥',
      ref: r.poNumber,
      title: `${r.productName || r.sku}`,
      sku: r.sku,
      location: r.dock || 'Bay 01 - Receiving',
      destLocation: r.targetLocation || 'Zone A (Main Rack)',
      qty: r.expectedQty,
      priority: 'HIGH',
      partner: r.supplier || 'Industrial Supplier Co',
      carrier: r.carrier || 'Freight Line',
      status: r.status,
      actionText: 'Confirm & Receive Goods',
      onExecute: () => {
        confirmReceipt(r.poNumber, r.expectedQty, 'Alex Rivera (Staff)');
        showToast(`✓ Inbound receipt ${r.poNumber} verified! Received +${r.expectedQty} units.`);
      },
    }));

  const pickingTasks = (deliveries || [])
    .filter((d) => d.status === 'READY_TO_DISPATCH' || d.status === 'ALLOCATED')
    .map((d) => ({
      id: d.id || d.orderNo,
      rawId: d.id,
      entityType: 'DELIVERY_PICK',
      type: 'PICKING',
      typeLabel: 'Order Picking',
      typeBadge: 'primary',
      icon: '🔍',
      ref: d.orderNo,
      title: `${d.productName || d.sku}`,
      sku: d.sku,
      location: d.sourceLocation || 'Zone C (Rapid Dispatch)',
      destLocation: d.destination || 'Customer Dock',
      qty: d.qty,
      priority: d.priority || 'HIGH',
      partner: d.customer || 'Commercial Client Corp',
      carrier: d.carrier || 'FedEx Priority',
      status: d.status,
      actionText: 'Confirm Picked',
      onExecute: () => {
        advanceDeliveryStatus(d.orderNo, 'PICKED', 'Alex Rivera (Staff)');
        showToast(`✓ Order ${d.orderNo} picked (${d.qty} units from ${d.sourceLocation || 'Bin'})`);
      },
    }));

  const packingTasks = (deliveries || [])
    .filter((d) => d.status === 'PICKED')
    .map((d) => ({
      id: d.id || d.orderNo,
      rawId: d.id,
      entityType: 'DELIVERY_PACK',
      type: 'PACKING',
      typeLabel: 'Order Packing',
      typeBadge: 'warning',
      icon: '📦',
      ref: d.orderNo,
      title: `${d.productName || d.sku}`,
      sku: d.sku,
      location: 'Packing Bench Station 01',
      destLocation: d.destination || 'Carrier Truck',
      qty: d.qty,
      priority: 'HIGH',
      partner: d.customer || 'Commercial Client Corp',
      carrier: d.carrier || 'FedEx Priority',
      status: d.status,
      actionText: 'Seal & Complete Packing',
      onExecute: () => {
        advanceDeliveryStatus(d.orderNo, 'PACKED', 'Alex Rivera (Staff)');
        showToast(`✓ Order ${d.orderNo} sealed and packed in carton!`);
      },
    }));

  const transferTasks = (transfers || [])
    .filter((t) => t.status === 'SCHEDULED')
    .map((t) => ({
      id: t.id || t.transferNo,
      rawId: t.id,
      entityType: 'TRANSFER',
      type: 'TRANSFERS',
      typeLabel: 'Internal Transfer',
      typeBadge: 'success',
      icon: '⇄',
      ref: t.transferNo,
      title: `${t.productName || t.sku}`,
      sku: t.sku,
      location: `${t.fromLocation} → ${t.toLocation}`,
      destLocation: t.toLocation,
      qty: t.qty,
      priority: t.priority || 'MEDIUM',
      partner: t.reason || 'Buffer replenishment',
      carrier: 'Floor Handcart',
      status: t.status,
      actionText: 'Confirm Movement',
      onExecute: () => {
        executeTransfer(t.transferNo, 'Alex Rivera (Staff)');
        showToast(`✓ Relocation ${t.transferNo} executed (+${t.qty} units to ${t.toLocation})`);
      },
    }));

  const allTasks = [...pendingReceipts, ...pickingTasks, ...packingTasks, ...transferTasks];

  const filteredTasks = allTasks.filter((task) => {
    const matchesType = filterType === 'ALL' || task.type === filterType;
    const matchesQuery =
      task.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.partner || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  // Open Create Task Dialog
  const handleOpenAddTask = (type = 'RECEIVING') => {
    setTaskTypeToCreate(type);
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const firstProd = products[0] || { sku: 'MTR-9002', primaryLocation: 'Bay 01 - Receiving' };

    setNewTaskForm({
      ref: type === 'RECEIVING' ? `PO-${randNum}` : type === 'TRANSFERS' ? `TR-${randNum}` : `SO-${randNum}`,
      sku: firstProd.sku,
      qty: type === 'RECEIVING' ? 30 : 10,
      location: type === 'RECEIVING' ? 'Bay 01 - Receiving Dock' : firstProd.primaryLocation || 'Rack A-01',
      toLocation: 'Zone C (Rapid Dispatch)',
      partner: type === 'RECEIVING' ? 'Industrial Supplier Co' : 'Commercial Client Corp',
      priority: 'HIGH',
      notes: 'Operational floor task',
    });
    setIsAddTaskOpen(true);
  };

  const handleSaveNewTask = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === newTaskForm.sku) || products[0];

    if (taskTypeToCreate === 'RECEIVING') {
      addReceipt({
        poNumber: newTaskForm.ref,
        sku: newTaskForm.sku,
        productName: prod?.name || newTaskForm.sku,
        expectedQty: parseInt(newTaskForm.qty, 10) || 20,
        dock: newTaskForm.location,
        targetLocation: newTaskForm.toLocation,
        supplier: newTaskForm.partner,
        status: 'PENDING',
      });
      showToast(`✓ Inbound Receiving Task ${newTaskForm.ref} created!`);
    } else if (taskTypeToCreate === 'PICKING' || taskTypeToCreate === 'PACKING') {
      addDelivery({
        orderNo: newTaskForm.ref,
        sku: newTaskForm.sku,
        productName: prod?.name || newTaskForm.sku,
        qty: parseInt(newTaskForm.qty, 10) || 10,
        sourceLocation: newTaskForm.location,
        destination: newTaskForm.toLocation,
        customer: newTaskForm.partner,
        priority: newTaskForm.priority,
        status: taskTypeToCreate === 'PACKING' ? 'PICKED' : 'READY_TO_DISPATCH',
      });
      showToast(`✓ Delivery ${taskTypeToCreate} Task ${newTaskForm.ref} created!`);
    } else if (taskTypeToCreate === 'TRANSFERS') {
      addTransfer({
        transferNo: newTaskForm.ref,
        sku: newTaskForm.sku,
        productName: prod?.name || newTaskForm.sku,
        qty: parseInt(newTaskForm.qty, 10) || 15,
        fromLocation: newTaskForm.location,
        toLocation: newTaskForm.toLocation,
        reason: newTaskForm.notes || 'Internal bin relocation',
        priority: newTaskForm.priority,
        status: 'SCHEDULED',
      });
      showToast(`✓ Internal Transfer Task ${newTaskForm.ref} created!`);
    }

    setIsAddTaskOpen(false);
  };

  // Handle Edit Task
  const handleOpenEditTask = (task) => {
    setEditingTask({
      ...task,
      editRef: task.ref,
      editSku: task.sku,
      editQty: task.qty,
      editLocation: task.location,
      editPartner: task.partner,
      editPriority: task.priority || 'HIGH',
    });
  };

  const handleSaveEditTask = (e) => {
    e.preventDefault();
    if (!editingTask) return;
    const qty = parseInt(editingTask.editQty, 10) || 1;

    if (editingTask.entityType === 'RECEIPT') {
      editReceipt(editingTask.ref, {
        poNumber: editingTask.editRef,
        sku: editingTask.editSku,
        expectedQty: qty,
        dock: editingTask.editLocation,
        supplier: editingTask.editPartner,
      });
      showToast(`✓ Receipt task ${editingTask.ref} updated!`);
    } else if (editingTask.entityType === 'DELIVERY_PICK' || editingTask.entityType === 'DELIVERY_PACK') {
      editDelivery(editingTask.ref, {
        orderNo: editingTask.editRef,
        sku: editingTask.editSku,
        qty: qty,
        sourceLocation: editingTask.editLocation,
        customer: editingTask.editPartner,
        priority: editingTask.editPriority,
      });
      showToast(`✓ Delivery task ${editingTask.ref} updated!`);
    } else if (editingTask.entityType === 'TRANSFER') {
      editTransfer(editingTask.ref, {
        transferNo: editingTask.editRef,
        sku: editingTask.editSku,
        qty: qty,
        fromLocation: editingTask.editLocation,
        reason: editingTask.editPartner,
        priority: editingTask.editPriority,
      });
      showToast(`✓ Transfer task ${editingTask.ref} updated!`);
    }

    setEditingTask(null);
  };

  // Handle Delete Task
  const handleConfirmDeleteTask = () => {
    if (!deletingTask) return;

    if (deletingTask.entityType === 'RECEIPT') {
      deleteReceipt(deletingTask.ref);
      showToast(`🗑️ Inbound task ${deletingTask.ref} deleted.`, 'warning');
    } else if (deletingTask.entityType === 'DELIVERY_PICK' || deletingTask.entityType === 'DELIVERY_PACK') {
      deleteDelivery(deletingTask.ref);
      showToast(`🗑️ Delivery task ${deletingTask.ref} cancelled.`, 'warning');
    } else if (deletingTask.entityType === 'TRANSFER') {
      deleteTransfer(deletingTask.ref);
      showToast(`🗑️ Transfer task ${deletingTask.ref} removed.`, 'warning');
    }

    setDeletingTask(null);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
              My Operational Tasks
            </h1>
            <span className="ss-badge ss-badge-primary">
              {filteredTasks.length} PENDING
            </span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Unified high-speed task queue for receiving, picking, packing, and bin relocations with instant execution controls.
          </p>
        </div>

        {/* Action Controls: + Add Task & Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={() => handleOpenAddTask('RECEIVING')}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', fontWeight: 700 }}
          >
            + Add Task / Order
          </button>

          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: `All (${allTasks.length})` },
              { key: 'RECEIVING', label: `Receiving (${pendingReceipts.length})` },
              { key: 'PICKING', label: `Picking (${pickingTasks.length})` },
              { key: 'PACKING', label: `Packing (${packingTasks.length})` },
              { key: 'TRANSFERS', label: `Transfers (${transferTasks.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`ss-btn ${filterType === tab.key ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                onClick={() => setFilterType(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="ss-input"
          placeholder="Filter tasks by Order #, SKU, Location, Partner, or Product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Task Cards Grid (Mobile/Tablet Friendly & High-Touch with full CRUD) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredTasks.map((task) => (
          <div
            key={`${task.entityType}-${task.id}`}
            className="ss-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-lg)',
              transition: 'box-shadow 150ms ease',
            }}
          >
            <div>
              {/* Card Header: Type Badge & Reference */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <span className={`ss-badge ss-badge-${task.typeBadge}`}>
                  {task.icon} {task.typeLabel}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--ss-font-mono)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    color: 'var(--ss-text-primary)',
                  }}
                >
                  {task.ref}
                </span>
              </div>

              {/* Product Info */}
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                {task.title}
              </div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '2px' }}>
                SKU: {task.sku}
              </div>

              {/* Location & Quantity Detail Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: 'var(--ss-bg-app)',
                  border: '1px solid var(--ss-border-subtle)',
                  borderRadius: 'var(--ss-radius-md)',
                  marginTop: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Target Location
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
                    {task.location}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Required Qty
                  </div>
                  <div
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      fontFamily: 'var(--ss-font-mono)',
                      color: 'var(--ss-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {task.qty} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>units</span>
                  </div>
                </div>
              </div>

              {task.partner && (
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
                  Partner: <strong>{task.partner}</strong>
                </div>
              )}
            </div>

            {/* ACTION TOOLBAR: VIEW, EDIT, DELETE, AND EXECUTE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setViewingTask(task)}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                >
                  👁️ View Details
                </button>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => handleOpenEditTask(task)}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className="ss-btn ss-btn-ghost"
                  onClick={() => setDeletingTask(task)}
                  style={{ padding: '0.35rem 0.6rem', color: 'var(--ss-danger)', fontSize: '0.75rem' }}
                  title="Delete Task"
                >
                  🗑️
                </button>
              </div>

              <button
                type="button"
                className="ss-btn ss-btn-primary"
                onClick={task.onExecute}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.55rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                ✓ {task.actionText}
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div
            className="ss-card"
            style={{
              gridColumn: '1 / -1',
              padding: '3rem 1rem',
              textAlign: 'center',
              color: 'var(--ss-text-muted)',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.5rem' }}>
              No Pending Floor Tasks
            </div>
            <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              All assigned receiving, picking, packing, and relocation jobs are currently completed. Click "+ Add Task" to create one.
            </p>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD TASK DIALOG */}
      {isAddTaskOpen && (
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                + Add New Floor Task
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Task Category Selector */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', padding: '0.25rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
              {[
                { key: 'RECEIVING', label: '📥 Receiving' },
                { key: 'PICKING', label: '🔍 Picking' },
                { key: 'PACKING', label: '📦 Packing' },
                { key: 'TRANSFERS', label: '⇄ Transfer' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleOpenAddTask(t.key)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: taskTypeToCreate === t.key ? 700 : 500,
                    borderRadius: 'var(--ss-radius-sm)',
                    border: 'none',
                    background: taskTypeToCreate === t.key ? 'var(--ss-bg-surface)' : 'transparent',
                    boxShadow: taskTypeToCreate === t.key ? 'var(--ss-shadow-sm)' : 'none',
                    color: taskTypeToCreate === t.key ? 'var(--ss-primary)' : 'var(--ss-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveNewTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Reference #
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={newTaskForm.ref}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, ref: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Target SKU
                  </label>
                  <select
                    className="ss-select"
                    value={newTaskForm.sku}
                    onChange={(e) => {
                      const p = products.find((prod) => prod.sku === e.target.value);
                      setNewTaskForm({
                        ...newTaskForm,
                        sku: e.target.value,
                        location: p?.primaryLocation || newTaskForm.location,
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
                    Required Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={newTaskForm.qty}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, qty: e.target.value })}
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
                    value={newTaskForm.location}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Partner (Supplier or Customer)
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={newTaskForm.partner}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, partner: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsAddTaskOpen(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW TASK DETAILS */}
      {viewingTask && (
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
                <span style={{ fontSize: '1.5rem' }}>{viewingTask.icon}</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Task: {viewingTask.ref}
                  </h3>
                  <span className={`ss-badge ss-badge-${viewingTask.typeBadge}`}>{viewingTask.typeLabel}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Product:</div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{viewingTask.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-primary)', fontFamily: 'var(--ss-font-mono)' }}>SKU: {viewingTask.sku}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Location:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{viewingTask.location}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Quantity:</div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                    {viewingTask.qty} units
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Partner / Order Details:</div>
                <div style={{ fontSize: '0.8125rem' }}>{viewingTask.partner || 'Standard Internal Assignment'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setViewingTask(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-primary"
                onClick={() => {
                  const t = viewingTask;
                  setViewingTask(null);
                  t.onExecute();
                }}
                style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
              >
                ✓ {viewingTask.actionText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT TASK */}
      {editingTask && (
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
                Edit Task: {editingTask.ref}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Reference Identifier
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingTask.editRef}
                  onChange={(e) => setEditingTask({ ...editingTask, editRef: e.target.value })}
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
                    value={editingTask.editQty}
                    onChange={(e) => setEditingTask({ ...editingTask, editQty: e.target.value })}
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
                    value={editingTask.editLocation}
                    onChange={(e) => setEditingTask({ ...editingTask, editLocation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Partner / Customer / Supplier
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingTask.editPartner || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, editPartner: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingTask(null)}
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
      {deletingTask && (
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
                  Delete Floor Task
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  This task will be cancelled and removed.
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--ss-text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Are you sure you want to delete <strong>{deletingTask.typeLabel}</strong>{' '}
              <code style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>{deletingTask.ref}</code> ({deletingTask.sku})?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setDeletingTask(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-danger"
                onClick={handleConfirmDeleteTask}
                style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
              >
                Yes, Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTasksPage;
