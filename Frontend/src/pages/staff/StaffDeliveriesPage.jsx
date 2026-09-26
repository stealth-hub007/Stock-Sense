import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffDeliveriesPage = () => {
  const { products, deliveries, addDelivery, editDelivery, deleteDelivery, advanceDeliveryStatus } = useInventory();
  const [activeTab, setActiveTab] = useState('PICKING'); // 'PICKING' | 'PACKING' | 'DISPATCHED'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Operational Execution Modals
  const [selectedPickOrder, setSelectedPickOrder] = useState(null);
  const [pickedQtyInput, setPickedQtyInput] = useState(0);
  const [selectedPackOrder, setSelectedPackOrder] = useState(null);
  const [cartonType, setCartonType] = useState('STANDARD_BOX');

  // CRUD Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    orderNo: '',
    customer: '',
    sku: products[0]?.sku || 'MTR-9002',
    qty: 10,
    sourceLocation: 'Zone C (Rapid Dispatch)',
    destination: 'Chicago, IL, USA',
    carrier: 'FedEx Freight Priority',
    priority: 'HIGH',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filter queues
  const allOrders = deliveries || [];

  const filterBySearch = (orders) => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (d) =>
        d.orderNo.toLowerCase().includes(q) ||
        d.sku.toLowerCase().includes(q) ||
        (d.productName || '').toLowerCase().includes(q) ||
        (d.customer || '').toLowerCase().includes(q) ||
        (d.sourceLocation || '').toLowerCase().includes(q)
    );
  };

  const pickingOrders = filterBySearch(
    allOrders.filter((d) => d.status === 'READY_TO_DISPATCH' || d.status === 'ALLOCATED')
  );
  const packingOrders = filterBySearch(allOrders.filter((d) => d.status === 'PICKED'));
  const dispatchedOrders = filterBySearch(
    allOrders.filter((d) => d.status === 'PACKED' || d.status === 'DISPATCHED' || d.status === 'DELIVERED')
  );

  // Open Pick Modal
  const handleOpenPickModal = (order) => {
    setSelectedPickOrder(order);
    setPickedQtyInput(order.qty);
  };

  const handleConfirmPick = (e) => {
    e.preventDefault();
    if (!selectedPickOrder) return;

    advanceDeliveryStatus(selectedPickOrder.orderNo, 'PICKED', 'Alex Rivera (Staff)');
    showToast(`✓ Order ${selectedPickOrder.orderNo} picked! (${pickedQtyInput} units transferred to Packing Bench)`);
    setSelectedPickOrder(null);
  };

  // Open Pack Modal
  const handleOpenPackModal = (order) => {
    setSelectedPackOrder(order);
    setCartonType('STANDARD_BOX');
  };

  const handleConfirmPack = (e) => {
    e.preventDefault();
    if (!selectedPackOrder) return;

    advanceDeliveryStatus(selectedPackOrder.orderNo, 'PACKED', 'Alex Rivera (Staff)');
    showToast(`✓ Order ${selectedPackOrder.orderNo} packed in ${cartonType}! Sealed and ready for carrier.`);
    setSelectedPackOrder(null);
  };

  // Open Create Order Modal
  const handleOpenCreateModal = () => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const firstProd = products[0] || { sku: 'MTR-9002', primaryLocation: 'Zone C (Rapid Dispatch)' };
    setCreateForm({
      orderNo: `SO-${randNum}`,
      customer: 'Acme Robotics Industrial Corp',
      sku: firstProd.sku,
      qty: 12,
      sourceLocation: firstProd.primaryLocation || 'Zone C (Rapid Dispatch)',
      destination: 'Chicago, IL, USA',
      carrier: 'FedEx Freight Priority',
      priority: 'HIGH',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === createForm.sku) || products[0];

    const created = addDelivery({
      orderNo: createForm.orderNo,
      sku: createForm.sku,
      productName: prod?.name || createForm.sku,
      qty: parseInt(createForm.qty, 10) || 5,
      sourceLocation: createForm.sourceLocation,
      destination: createForm.destination,
      customer: createForm.customer,
      carrier: createForm.carrier,
      priority: createForm.priority,
      status: 'READY_TO_DISPATCH',
    });

    showToast(`✓ Delivery Order ${created.orderNo} created! Added to Picking Queue.`);
    setIsCreateModalOpen(false);
  };

  // Open Edit Order Modal
  const handleOpenEditModal = (order) => {
    setEditingOrder({
      ...order,
      editOrderNo: order.orderNo,
      editCustomer: order.customer || '',
      editSku: order.sku,
      editQty: order.qty,
      editLocation: order.sourceLocation || 'Zone C',
      editDestination: order.destination || '',
      editCarrier: order.carrier || '',
      editPriority: order.priority || 'HIGH',
      editStatus: order.status,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    editDelivery(editingOrder.orderNo, {
      orderNo: editingOrder.editOrderNo,
      customer: editingOrder.editCustomer,
      sku: editingOrder.editSku,
      qty: parseInt(editingOrder.editQty, 10) || 1,
      sourceLocation: editingOrder.editLocation,
      destination: editingOrder.editDestination,
      carrier: editingOrder.editCarrier,
      priority: editingOrder.editPriority,
      status: editingOrder.editStatus,
    });

    showToast(`✓ Order ${editingOrder.orderNo} updated successfully!`);
    setEditingOrder(null);
  };

  // Delete Order
  const handleConfirmDelete = () => {
    if (!deletingOrder) return;
    deleteDelivery(deletingOrder.orderNo);
    showToast(`🗑️ Delivery Order ${deletingOrder.orderNo} cancelled and removed.`, 'warning');
    setDeletingOrder(null);
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
              Order Fulfillment: Picking & Packing
            </h1>
            <span className="ss-badge ss-badge-primary">FLOOR FULFILLMENT</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
            Complete floor fulfillment lifecycle: Retrieve items from warehouse bins, cartonize, seal, and dispatch.
          </p>
        </div>

        {/* Action Buttons: + Create Order & Stage Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={handleOpenCreateModal}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', fontWeight: 700 }}
          >
            + Create Delivery Order
          </button>

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              type="button"
              className={`ss-btn ${activeTab === 'PICKING' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem', fontWeight: 700 }}
              onClick={() => setActiveTab('PICKING')}
            >
              🔍 1. Picking ({pickingOrders.length})
            </button>
            <button
              type="button"
              className={`ss-btn ${activeTab === 'PACKING' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem', fontWeight: 700 }}
              onClick={() => setActiveTab('PACKING')}
            >
              📦 2. Packing ({packingOrders.length})
            </button>
            <button
              type="button"
              className={`ss-btn ${activeTab === 'DISPATCHED' ? 'ss-btn-primary' : 'ss-btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem' }}
              onClick={() => setActiveTab('DISPATCHED')}
            >
              🚚 Complete ({dispatchedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="ss-input"
          placeholder="Filter delivery orders by Order #, Customer, SKU, Product name, or Bin location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. PICKING VIEW                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'PICKING' && (
        <div>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--ss-radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-primary)', fontWeight: 600 }}>
              🎯 Picking Queue: Go to the displayed bin location, retrieve item, and mark as picked.
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
              {pickingOrders.length} orders waiting
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
              gap: '1rem',
            }}
          >
            {pickingOrders.map((order) => (
              <div
                key={order.id || order.orderNo}
                className="ss-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  border: '1px solid var(--ss-border)',
                  borderTop: '4px solid var(--ss-primary)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                      {order.orderNo}
                    </span>
                    <span className="ss-badge ss-badge-primary">READY TO PICK</span>
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                    {order.productName || order.sku}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '2px' }}>
                    SKU: {order.sku}
                  </div>

                  {/* High Visibility Location Badge */}
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--ss-bg-app)',
                      border: '1px solid var(--ss-border)',
                      borderRadius: 'var(--ss-radius-md)',
                      marginTop: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                        📍 SOURCE LOCATION
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ss-primary)', fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                        {order.sourceLocation || 'Zone C (Rapid Dispatch)'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
                        PICK QTY
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ss-text-primary)', fontFamily: 'var(--ss-font-mono)', marginTop: '2px' }}>
                        {order.qty} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>units</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '0.5rem' }}>
                    Customer: <strong>{order.customer || 'Commercial Client Corp'}</strong>
                  </div>
                </div>

                {/* ACTION TOOLBAR: VIEW, EDIT, DELETE, AND PICK */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="ss-btn ss-btn-secondary"
                      onClick={() => setViewingOrder(order)}
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                    >
                      👁️ View
                    </button>
                    <button
                      type="button"
                      className="ss-btn ss-btn-secondary"
                      onClick={() => handleOpenEditModal(order)}
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="ss-btn ss-btn-ghost"
                      onClick={() => setDeletingOrder(order)}
                      style={{ padding: '0.3rem 0.5rem', color: 'var(--ss-danger)', fontSize: '0.75rem' }}
                      title="Cancel Order"
                    >
                      🗑️
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="ss-btn ss-btn-secondary"
                      onClick={() => handleOpenPickModal(order)}
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}
                    >
                      Adjust Qty
                    </button>
                    <button
                      type="button"
                      className="ss-btn ss-btn-primary"
                      onClick={() => {
                        advanceDeliveryStatus(order.orderNo, 'PICKED', 'Alex Rivera (Staff)');
                        showToast(`✓ Order ${order.orderNo} picked (${order.qty} units from ${order.sourceLocation})`);
                      }}
                      style={{ flex: 2, justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700 }}
                    >
                      ✓ Pick All ({order.qty})
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pickingOrders.length === 0 && (
              <div
                className="ss-card"
                style={{ gridColumn: '1 / -1', padding: '3rem 1rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}
              >
                <span style={{ fontSize: '2.5rem' }}>✓</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.5rem' }}>
                  Picking Queue Cleared
                </div>
                <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                  All delivery orders have been picked or are currently in packing bench.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PACKING BENCH VIEW                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'PACKING' && (
        <div>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--ss-radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-warning-text)', fontWeight: 600 }}>
              📦 Packing Bench: Verify picked items, place in shipping carton, and seal for carrier.
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
              {packingOrders.length} orders to pack
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
              gap: '1rem',
            }}
          >
            {packingOrders.map((order) => (
              <div
                key={order.id || order.orderNo}
                className="ss-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  border: '1px solid var(--ss-border)',
                  borderTop: '4px solid var(--ss-warning)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                      {order.orderNo}
                    </span>
                    <span className="ss-badge ss-badge-warning">PICKED • READY TO PACK</span>
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                    {order.productName || order.sku}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '2px' }}>
                    SKU: {order.sku}
                  </div>

                  {/* Picked Verification Summary */}
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--ss-bg-app)',
                      border: '1px solid var(--ss-border)',
                      borderRadius: 'var(--ss-radius-md)',
                      marginTop: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Picked Item Count:</span>
                      <strong style={{ fontFamily: 'var(--ss-font-mono)', fontSize: '1rem', color: 'var(--ss-success)' }}>
                        ✓ {order.qty} units verified
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Carrier Freight:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)' }}>
                        {order.carrier || 'FedEx Priority'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="ss-btn ss-btn-secondary"
                      onClick={() => setViewingOrder(order)}
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                    >
                      👁️ Details
                    </button>
                    <button
                      type="button"
                      className="ss-btn ss-btn-secondary"
                      onClick={() => handleOpenEditModal(order)}
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="ss-btn ss-btn-ghost"
                      onClick={() => setDeletingOrder(order)}
                      style={{ padding: '0.3rem 0.5rem', color: 'var(--ss-danger)', fontSize: '0.75rem' }}
                      title="Cancel Order"
                    >
                      🗑️
                    </button>
                  </div>

                  <button
                    type="button"
                    className="ss-btn ss-btn-primary"
                    onClick={() => handleOpenPackModal(order)}
                    style={{
                      justifyContent: 'center',
                      padding: '0.625rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--ss-warning)',
                      borderColor: 'var(--ss-warning-border)',
                      color: '#000000',
                    }}
                  >
                    📦 Pack & Seal Order →
                  </button>
                </div>
              </div>
            ))}

            {packingOrders.length === 0 && (
              <div
                className="ss-card"
                style={{ gridColumn: '1 / -1', padding: '3rem 1rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}
              >
                <span style={{ fontSize: '2.5rem' }}>✓</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.5rem' }}>
                  Packing Bench Clean
                </div>
                <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                  No orders currently waiting to be boxed and sealed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DISPATCHED & DELIVERED VIEW                                            */}
      {/* ========================================================================= */}
      {activeTab === 'DISPATCHED' && (
        <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, width: '140px' }}>ORDER #</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '180px' }}>PRODUCT</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, minWidth: '160px' }}>CUSTOMER</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '110px' }}>QTY</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, width: '160px' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right', width: '180px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {dispatchedOrders.map((d) => (
                  <tr key={d.id || d.orderNo} style={{ borderBottom: '1px solid var(--ss-border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                      {d.orderNo}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{d.productName || d.sku}</div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-muted)' }}>{d.sku}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{d.customer}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--ss-font-mono)' }}>
                      {d.qty} units
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="ss-badge ss-badge-success">
                        {d.status === 'PACKED' ? '📦 PACKED / READY' : `✓ ${d.status}`}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => setViewingOrder(d)}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', width: '60px', justifyContent: 'center' }}
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => handleOpenEditModal(d)}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', width: '56px', justifyContent: 'center' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="ss-btn ss-btn-ghost"
                          onClick={() => setDeletingOrder(d)}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', width: '32px', justifyContent: 'center', color: 'var(--ss-danger)' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE DELIVERY ORDER */}
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                + Create Delivery Fulfillment Order
              </h3>
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
                    Order Number
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={createForm.orderNo}
                    onChange={(e) => setCreateForm({ ...createForm, orderNo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Customer Client
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={createForm.customer}
                    onChange={(e) => setCreateForm({ ...createForm, customer: e.target.value })}
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
                    onChange={(e) => {
                      const p = products.find((prod) => prod.sku === e.target.value);
                      setCreateForm({
                        ...createForm,
                        sku: e.target.value,
                        sourceLocation: p?.primaryLocation || createForm.sourceLocation,
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Quantity
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Source Bin Location
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={createForm.sourceLocation}
                    onChange={(e) => setCreateForm({ ...createForm, sourceLocation: e.target.value })}
                    required
                  />
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
                  ✓ Create Delivery Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW ORDER DETAILS */}
      {viewingOrder && (
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
                <span style={{ fontSize: '1.5rem' }}>📦</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    {viewingOrder.orderNo}
                  </h3>
                  <span className="ss-badge ss-badge-primary">{viewingOrder.status}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Product:</div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{viewingOrder.productName || viewingOrder.sku}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-primary)', fontFamily: 'var(--ss-font-mono)' }}>SKU: {viewingOrder.sku}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{viewingOrder.customer || 'Commercial Client'}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Quantity:</div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                    {viewingOrder.qty} units
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Source Location / Destination:</div>
                <div style={{ fontSize: '0.8125rem' }}>
                  {viewingOrder.sourceLocation || 'Zone C'} ➔ {viewingOrder.destination || 'Client Dock'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setViewingOrder(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT ORDER */}
      {editingOrder && (
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
                Edit Order: {editingOrder.orderNo}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Order #
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingOrder.editOrderNo}
                  onChange={(e) => setEditingOrder({ ...editingOrder, editOrderNo: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Customer Client
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingOrder.editCustomer}
                  onChange={(e) => setEditingOrder({ ...editingOrder, editCustomer: e.target.value })}
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
                    value={editingOrder.editQty}
                    onChange={(e) => setEditingOrder({ ...editingOrder, editQty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                    Status
                  </label>
                  <select
                    className="ss-select"
                    value={editingOrder.editStatus}
                    onChange={(e) => setEditingOrder({ ...editingOrder, editStatus: e.target.value })}
                  >
                    <option value="READY_TO_DISPATCH">READY_TO_DISPATCH</option>
                    <option value="ALLOCATED">ALLOCATED</option>
                    <option value="PICKED">PICKED</option>
                    <option value="PACKED">PACKED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Source Location
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editingOrder.editLocation}
                  onChange={(e) => setEditingOrder({ ...editingOrder, editLocation: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingOrder(null)}
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
      {deletingOrder && (
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
                  Cancel Delivery Order
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  This will remove the order permanently.
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--ss-text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Are you sure you want to cancel and remove Order{' '}
              <code style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>{deletingOrder.orderNo}</code> ({deletingOrder.sku})?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setDeletingOrder(null)}
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
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADJUST PICK QUANTITY */}
      {selectedPickOrder && (
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                Confirm Pick Quantity
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPickOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700 }}>{selectedPickOrder.productName || selectedPickOrder.sku}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                Location: <strong>{selectedPickOrder.sourceLocation}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmPick} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Confirmed Picked Quantity
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setPickedQtyInput((prev) => Math.max(1, prev - 1))}
                    style={{ fontSize: '1.25rem', width: '42px', height: '42px', justifyContent: 'center' }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="ss-input"
                    value={pickedQtyInput}
                    onChange={(e) => setPickedQtyInput(parseInt(e.target.value, 10) || 0)}
                    style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)' }}
                    required
                  />
                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setPickedQtyInput((prev) => prev + 1)}
                    style={{ fontSize: '1.25rem', width: '42px', height: '42px', justifyContent: 'center' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setSelectedPickOrder(null)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Confirm Picked
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: PACKING BENCH CARTONIZATION */}
      {selectedPackOrder && (
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
                <span style={{ fontSize: '1.5rem' }}>📦</span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                    Cartonize & Seal Order
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', fontFamily: 'var(--ss-font-mono)' }}>
                    {selectedPackOrder.orderNo} • {selectedPackOrder.qty} units
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPack} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Shipping Container / Carton Size
                </label>
                <select
                  className="ss-select"
                  value={cartonType}
                  onChange={(e) => setCartonType(e.target.value)}
                >
                  <option value="STANDARD_BOX">Standard Corrugated Box (12x12x12 in)</option>
                  <option value="LARGE_BOX">Large Master Carton (24x18x18 in)</option>
                  <option value="HEAVY_PALLET">Reinforced Wooden Pallet</option>
                  <option value="BUBBLE_MAILER">Padded Bubble Mailer (Small Parts)</option>
                </select>
              </div>

              {/* Quality Checklist */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginBottom: '0.5rem' }}>
                  Packing Station Checklist:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    SKU label scanned & verified ({selectedPackOrder.sku})
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    Packing slip & invoice enclosed
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    Tamper-evident security tape applied
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setSelectedPackOrder(null)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ss-btn ss-btn-primary"
                  style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}
                >
                  ✓ Complete Packing & Seal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDeliveriesPage;
