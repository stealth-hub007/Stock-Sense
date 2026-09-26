import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const DeliveriesPage = () => {
  const { deliveries, products, addDelivery, editDelivery, deleteDelivery, dispatchDelivery } = useInventory();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // New delivery order form
  const [newOrderNo, setNewOrderNo] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newSku, setNewSku] = useState(products[0]?.sku || 'MTR-9002');
  const [newQty, setNewQty] = useState(10);
  const [newCarrier, setNewCarrier] = useState('FedEx Freight Priority');
  const [newDest, setNewDest] = useState('Chicago, IL, USA');

  // Edit delivery order form
  const [editCustomer, setEditCustomer] = useState('');
  const [editQty, setEditQty] = useState(5);
  const [editCarrier, setEditCarrier] = useState('');
  const [editDest, setEditDest] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editStatus, setEditStatus] = useState('READY_TO_DISPATCH');

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDispatchOrder = (orderNo, sku, qty, customer) => {
    dispatchDelivery(orderNo, 'Sarah Chen (Manager)');
    showToast(`✓ Outbound order ${orderNo} dispatched to ${customer}! -${qty} units of ${sku} deducted and written to stock ledger.`);
  };

  const handleCreateDelivery = (e) => {
    e.preventDefault();
    const created = addDelivery({
      orderNo: newOrderNo || `SO-${Math.floor(9000 + Math.random() * 900)}`,
      customer: newCustomer || 'Acme Industrial Robotics',
      sku: newSku,
      qty: parseInt(newQty, 10) || 5,
      carrier: newCarrier,
      destination: newDest,
      deadline: 'Today, EOD',
    });

    setIsModalOpen(false);
    setNewOrderNo('');
    setNewCustomer('');
    showToast(`✓ Outbound delivery ${created.orderNo} created and persisted in localStorage!`);
  };

  const openEditModal = (d) => {
    setEditingDelivery(d);
    setEditCustomer(d.customer);
    setEditQty(d.qty);
    setEditCarrier(d.carrier || 'FedEx Freight Priority');
    setEditDest(d.destination);
    setEditDeadline(d.deadline || 'Today, EOD');
    setEditStatus(d.status);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingDelivery) return;

    editDelivery(editingDelivery.id, {
      customer: editCustomer,
      qty: parseInt(editQty, 10) || editingDelivery.qty,
      carrier: editCarrier,
      destination: editDest,
      deadline: editDeadline,
      status: editStatus,
    });

    showToast(`✓ Order ${editingDelivery.orderNo} details updated and saved!`);
    setEditingDelivery(null);
  };

  const handleDeleteDelivery = (d) => {
    if (window.confirm(`Delete outbound delivery order ${d.orderNo} for ${d.customer}?`)) {
      deleteDelivery(d.id);
      showToast(`🗑 Order ${d.orderNo} deleted.`);
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
            border: '1px solid var(--ss-info)',
            borderRadius: 'var(--ss-radius-md)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-text-primary)',
          }}
        >
          <span style={{ color: 'var(--ss-info-text)', fontSize: '1.25rem' }}>📤</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-info-text)' }}>
              Outbound Dispatch Complete
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
              Outbound Delivery Orders & Dispatch
            </h1>
            <span className="ss-badge ss-badge-info">LIFECYCLE: STAGE 3 (DELIVER)</span>
            <span className="ss-badge ss-badge-success">PERSISTED LOCALSTORAGE</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Pick, pack, edit, and release customer shipments. Every confirmed dispatch decrements inventory on the double-entry ledger.
          </p>
        </div>

        <button
          type="button"
          className="ss-btn ss-btn-primary"
          onClick={() => {
            setNewSku(products[0]?.sku || 'MTR-9002');
            setIsModalOpen(true);
          }}
        >
          + Create Delivery Order
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
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>READY FOR DISPATCH</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-info-text)' }}>
            {deliveries.filter((d) => d.status === 'READY_TO_DISPATCH' || d.status === 'PACKED').length} Orders
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>AWAITING STOCK / BACKORDER</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)' }}>
            {deliveries.filter((d) => d.status === 'AWAITING_STOCK').length} Backorders
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>DISPATCHED TODAY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)' }}>
            {deliveries.filter((d) => d.status === 'DISPATCHED').length} Shipped
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>TOTAL ALLOCATED UNITS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
            -{deliveries.reduce((acc, d) => acc + d.qty, 0)} Units
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
            placeholder="Search by Order #, Customer, Destination, or SKU..."
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
            <option value="ALL">All Orders</option>
            <option value="READY_TO_DISPATCH">Ready to Dispatch</option>
            <option value="PACKED">Packed in Bay</option>
            <option value="AWAITING_STOCK">Awaiting Stock</option>
            <option value="DISPATCHED">Dispatched / Shipped</option>
          </select>
        </div>
      </div>

      {/* Deliveries Data Table */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>ORDER #</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>CUSTOMER & DESTINATION</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>LINE ITEM (SKU)</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>CARRIER & DEADLINE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>DISPATCH QTY</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map((d) => {
                const isReady = d.status === 'READY_TO_DISPATCH';
                const isPacked = d.status === 'PACKED';
                const isAwaiting = d.status === 'AWAITING_STOCK';
                const isDispatched = d.status === 'DISPATCHED';

                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {d.orderNo}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{d.customer}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        📍 {d.destination}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{d.productName}</div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
                        {d.sku} • Pick: {d.sourceLocation}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>{d.carrier}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        ⏰ {d.deadline}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--ss-font-mono)',
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: 'var(--ss-danger-text)',
                        }}
                      >
                        -{d.qty}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isReady && <span className="ss-badge ss-badge-info">Ready to Dispatch</span>}
                      {isPacked && <span className="ss-badge ss-badge-warning">Packed / Docked</span>}
                      {isAwaiting && <span className="ss-badge ss-badge-danger">Awaiting Inbound</span>}
                      {isDispatched && (
                        <span className="ss-badge ss-badge-success">✓ Shipped</span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        {/* Dispatch Button */}
                        {(isReady || isPacked) && (
                          <button
                            type="button"
                            className="ss-btn ss-btn-primary"
                            onClick={() => handleDispatchOrder(d.orderNo, d.sku, d.qty, d.customer)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            Dispatch →
                          </button>
                        )}
                        {isDispatched && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginRight: '4px' }}>
                            {d.dispatchedAt || 'Shipped'}
                          </span>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => openEditModal(d)}
                          title="Edit Order"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          ✎
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-ghost"
                          onClick={() => handleDeleteDelivery(d)}
                          title="Delete Order"
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

      {/* Create Delivery Modal */}
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
                  Create Outbound Delivery Order
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Allocate items for customer shipment and dispatch (Saves to localStorage).
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

            <form onSubmit={handleCreateDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Order Number
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    placeholder="e.g. SO-9110"
                    value={newOrderNo}
                    onChange={(e) => setNewOrderNo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    placeholder="e.g. Lockheed Martin Corp"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Product SKU to Ship
                </label>
                <select
                  className="ss-select"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} ({p.available} available)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Quantity to Dispatch
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
                    Carrier
                  </label>
                  <select
                    className="ss-select"
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value)}
                  >
                    <option value="FedEx Freight Priority">FedEx Freight Priority</option>
                    <option value="DHL Express International">DHL Express International</option>
                    <option value="UPS Ground Fleet">UPS Ground Fleet</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Destination Address / City
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  required
                />
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
                  Book Delivery Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Delivery Modal */}
      {editingDelivery && (
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
                  Edit Delivery Order ({editingDelivery.orderNo})
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Modify recipient, allocation quantity, carrier, or dispatch status.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setEditingDelivery(null)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Quantity to Dispatch
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
                    Status
                  </label>
                  <select
                    className="ss-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="READY_TO_DISPATCH">Ready to Dispatch</option>
                    <option value="PACKED">Packed in Bay</option>
                    <option value="AWAITING_STOCK">Awaiting Stock</option>
                    <option value="DISPATCHED">Dispatched / Shipped</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Deadline
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Destination Address
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editDest}
                  onChange={(e) => setEditDest(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingDelivery(null)}
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

export default DeliveriesPage;
