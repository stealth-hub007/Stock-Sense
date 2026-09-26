import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_STYLES } from '../../constants/roles';

export const DeliveriesPage = ({ onNavigateTab }) => {
  const {
    deliveries,
    products,
    addDelivery,
    editDelivery,
    deleteDelivery,
    dispatchDelivery,
    advanceDeliveryStatus,
    triggerPOForDelivery,
  } = useInventory();

  const { currentUser, role } = useAuth();
  const operatorName = currentUser ? `${currentUser.name} (${ROLE_LABELS[role] || 'Operator'})` : 'Sarah Chen (Manager)';
  const badgeStyle = ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES[ROLES.INVENTORY_MANAGER];

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [inspectingDelivery, setInspectingDelivery] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [toastAction, setToastAction] = useState(null);

  // New delivery order form
  const [newOrderNo, setNewOrderNo] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newSku, setNewSku] = useState(products[0]?.sku || 'MTR-9002');
  const [newQty, setNewQty] = useState(5);
  const [newCarrier, setNewCarrier] = useState('FedEx Freight Priority');
  const [newDest, setNewDest] = useState('Chicago, IL, USA');
  const [newDeadline, setNewDeadline] = useState('Today, 05:00 PM');
  const [newPriority, setNewPriority] = useState('HIGH');

  // Edit delivery order form
  const [editCustomer, setEditCustomer] = useState('');
  const [editQty, setEditQty] = useState(5);
  const [editCarrier, setEditCarrier] = useState('');
  const [editDest, setEditDest] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editStatus, setEditStatus] = useState('READY_TO_DISPATCH');

  const showToast = (msg, action = null) => {
    setSuccessToast(msg);
    setToastAction(action);
    setTimeout(() => {
      setSuccessToast(null);
      setToastAction(null);
    }, 6000);
  };

  const selectedProductObj = products.find((p) => p.sku === newSku) || products[0];

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.productName && d.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.destination && d.destination.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      d.status === statusFilter ||
      (statusFilter === 'ACTIVE' && d.status !== 'DELIVERED') ||
      (statusFilter === 'PENDING' && (d.status === 'READY_TO_DISPATCH' || d.status === 'ALLOCATED' || d.status === 'PACKED'));

    return matchesSearch && matchesStatus;
  });

  // Action: Step advance
  const handleAdvanceStatus = (orderNo, nextStatus) => {
    advanceDeliveryStatus(orderNo, nextStatus, operatorName);
    showToast(`✓ Order ${orderNo} advanced to ${nextStatus.replace(/_/g, ' ')} by ${operatorName}!`);
  };

  // Action: Full Dispatch
  const handleDispatchOrder = (orderNo, sku, qty, customer) => {
    dispatchDelivery(orderNo, operatorName);
    showToast(
      `✓ Outbound order ${orderNo} dispatched to ${customer}! -${qty} units of ${sku} deducted and logged to Stock Ledger.`,
      { label: 'View in Stock Ledger →', tab: 'ledger' }
    );
  };

  // Action: Confirm Final Delivery
  const handleConfirmDelivered = (orderNo, customer) => {
    advanceDeliveryStatus(orderNo, 'DELIVERED', operatorName);
    showToast(`✓ Order ${orderNo} confirmed DELIVERED to ${customer}! Proof of Delivery recorded in audit trail.`);
  };

  // Action: Auto replenish backorder
  const handleAutoReplenish = (orderNo, sku) => {
    const po = triggerPOForDelivery(orderNo);
    showToast(
      `⚡ Expedited Inbound PO ${po.poNumber} generated for ${sku}! Receiving this PO will auto-fulfill order ${orderNo}.`,
      { label: 'View Inbound PO in Receipts →', tab: 'receipts' }
    );
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
      deadline: newDeadline,
      priority: newPriority,
    });

    setIsModalOpen(false);
    setNewOrderNo('');
    setNewCustomer('');

    const targetP = products.find((p) => p.sku === newSku);
    const isBackorder = (targetP?.available || 0) < (parseInt(newQty, 10) || 5);

    if (isBackorder) {
      showToast(`⚠️ Order ${created.orderNo} created as AWAITING STOCK. Available stock is lower than requested quantity.`);
    } else {
      showToast(`✓ Outbound delivery ${created.orderNo} created & staged for dispatch!`);
    }
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
      {/* Toast Notification with Navigation */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            background: 'var(--ss-bg-surface-elevated)',
            border: '1px solid var(--ss-primary)',
            borderRadius: 'var(--ss-radius-md)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            color: 'var(--ss-text-primary)',
            maxWidth: '520px',
          }}
        >
          <span style={{ fontSize: '1.35rem' }}>🚚</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-primary)' }}>
              Delivery Pipeline Operation
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              {successToast}
            </div>
            {toastAction && onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab(toastAction.tab)}
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--ss-primary)',
                  background: 'var(--ss-primary-subtle)',
                  border: '1px solid var(--ss-primary-border)',
                  borderRadius: 'var(--ss-radius-xs)',
                  padding: '0.2rem 0.6rem',
                  cursor: 'pointer',
                }}
              >
                {toastAction.label}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
          >
            ✕
          </button>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--ss-text-primary)', letterSpacing: '-0.025em' }}>
              Outbound Delivery Orders & Fulfillment
            </h1>
            <span className="ss-badge ss-badge-info">LIFECYCLE: STAGE 4 (DELIVERY OUTFLOW)</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.6875rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                background: badgeStyle.badgeClass ? 'var(--ss-bg-app)' : 'rgba(34, 197, 94, 0.1)',
                border: '1px solid var(--ss-border)',
                fontWeight: 700,
                color: badgeStyle.dotColor,
              }}
            >
              <span>●</span> Active Operator: {operatorName}
            </span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Pick from warehouse bins, pack shipments, release to freight carriers, and verify final customer delivery. Decrements inventory on the double-entry Stock Ledger.
          </p>
        </div>

        <button
          type="button"
          className="ss-btn ss-btn-primary"
          onClick={() => {
            setNewSku(products[0]?.sku || 'MTR-9002');
            setIsModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>+</span>
          <span>Create Delivery Order</span>
        </button>
      </div>



      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-5)',
        }}
      >
        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-info-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Ready to Dispatch
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-info-text)', marginTop: '0.25rem' }}>
                {deliveries.filter((d) => d.status === 'READY_TO_DISPATCH' || d.status === 'PACKED' || d.status === 'ALLOCATED').length}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>orders</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-info">📤</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Available stock reserved & staged
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-warning-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Awaiting Inbound Stock
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)', marginTop: '0.25rem' }}>
                {deliveries.filter((d) => d.status === 'AWAITING_STOCK').length}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>backorders</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-warning">⏳</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Requires Inbound PO replenishment
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                In Transit / Dispatched
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '0.25rem' }}>
                {deliveries.filter((d) => d.status === 'DISPATCHED').length}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>shipped</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-primary">🚚</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Released to carrier, decremented from ledger
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Delivered & Confirmed
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)', marginTop: '0.25rem' }}>
                {deliveries.filter((d) => d.status === 'DELIVERED').length}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>completed</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-success">✓</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Proof of delivery confirmed at destination
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
            placeholder="Search Order #, Customer, Destination, SKU, or Carrier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Stage:</span>
          <select
            className="ss-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Delivery Orders ({deliveries.length})</option>
            <option value="PENDING">Pending & Staged</option>
            <option value="AWAITING_STOCK">Awaiting Inbound Stock (Backorder)</option>
            <option value="READY_TO_DISPATCH">Ready to Dispatch</option>
            <option value="PACKED">Packed in Bay</option>
            <option value="DISPATCHED">In Transit / Dispatched</option>
            <option value="DELIVERED">Delivered to Customer</option>
          </select>
        </div>
      </div>

      {/* Deliveries Table with Interactive Stage Actions */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>ORDER # & STAGE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>CUSTOMER & DESTINATION</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>LINE ITEM & STOCK BIN</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>CARRIER & SLA</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>QTY</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>STATUS & PIPELINE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>OPERATIONS & DISPATCH</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map((d) => {
                const prod = products.find((p) => p.sku === d.sku);
                const isReady = d.status === 'READY_TO_DISPATCH';
                const isAllocated = d.status === 'ALLOCATED';
                const isPacked = d.status === 'PACKED';
                const isAwaiting = d.status === 'AWAITING_STOCK';
                const isDispatched = d.status === 'DISPATCHED';
                const isDelivered = d.status === 'DELIVERED';

                const stockAvailable = prod?.available ?? 0;
                const hasSufficientStock = stockAvailable >= d.qty;

                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      transition: 'background 150ms ease',
                      backgroundColor: isAwaiting ? 'rgba(239, 68, 68, 0.02)' : isDelivered ? 'rgba(34, 197, 94, 0.02)' : 'transparent',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isAwaiting ? 'rgba(239, 68, 68, 0.02)' : isDelivered ? 'rgba(34, 197, 94, 0.02)' : 'transparent')
                    }
                  >
                    {/* Order # */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {d.orderNo}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {d.priority || 'HIGH'} PRIORITY
                      </div>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{d.customer}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        📍 {d.destination}
                      </div>
                    </td>

                    {/* Line item & Stock info */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{d.productName || prod?.name || d.sku}</div>
                      <div style={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', fontWeight: 600 }}>{d.sku}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--ss-text-muted)' }}>Pick: {d.sourceLocation || 'Zone C'}</span>
                        <span>•</span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: hasSufficientStock ? 'var(--ss-success)' : 'var(--ss-danger)',
                          }}
                        >
                          {stockAvailable} in stock
                        </span>
                      </div>
                    </td>

                    {/* Carrier & SLA */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', fontWeight: 600 }}>{d.carrier}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>⏰ {d.deadline}</div>
                    </td>

                    {/* Qty */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--ss-font-mono)',
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: isDispatched || isDelivered ? 'var(--ss-success-text)' : 'var(--ss-danger-text)',
                        }}
                      >
                        -{d.qty}
                      </span>
                    </td>

                    {/* Pipeline Stage Badge */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isAwaiting && (
                        <div>
                          <span className="ss-badge ss-badge-danger">Awaiting Stock</span>
                          {d.linkedPo && (
                            <div style={{ fontSize: '0.625rem', color: 'var(--ss-primary)', marginTop: '2px', fontWeight: 600 }}>
                              Linked: {d.linkedPo}
                            </div>
                          )}
                        </div>
                      )}
                      {isReady && <span className="ss-badge ss-badge-info">Ready to Dispatch</span>}
                      {isAllocated && <span className="ss-badge ss-badge-neutral">Stock Allocated</span>}
                      {isPacked && <span className="ss-badge ss-badge-warning">Packed / Docked</span>}
                      {isDispatched && (
                        <div>
                          <span className="ss-badge ss-badge-primary">🚚 In Transit</span>
                          <div style={{ fontSize: '0.625rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                            {d.dispatchedAt || 'Shipped'}
                          </div>
                        </div>
                      )}
                      {isDelivered && (
                        <div>
                          <span className="ss-badge ss-badge-success">✓ Delivered</span>
                          <div style={{ fontSize: '0.625rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                            {d.deliveredAt || 'Signed'}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Operations & Dispatch Buttons */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', flexWrap: 'nowrap' }}>
                        {/* ⚡ PO Replenish — only active when awaiting stock */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-primary"
                          onClick={() => isAwaiting && handleAutoReplenish(d.orderNo, d.sku)}
                          disabled={!isAwaiting}
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', background: 'var(--ss-warning)', color: '#000', opacity: !isAwaiting ? 0.35 : 1, cursor: !isAwaiting ? 'not-allowed' : 'pointer' }}
                          title={isAwaiting ? 'Auto-generate priority Inbound PO' : 'Not awaiting stock'}
                        >
                          ⚡ PO
                        </button>

                        {/* 📦 Pack — only active when ready or allocated */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => (isReady || isAllocated) && handleAdvanceStatus(d.orderNo, 'PACKED')}
                          disabled={!(isReady || isAllocated)}
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.45rem', opacity: !(isReady || isAllocated) ? 0.35 : 1, cursor: !(isReady || isAllocated) ? 'not-allowed' : 'pointer' }}
                          title={(isReady || isAllocated) ? 'Mark order picked and packed at dock' : 'Order not ready to pack'}
                        >
                          📦 Pack
                        </button>

                        {/* 🚚 Dispatch — active when ready, allocated, or packed */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-primary"
                          onClick={() => (isReady || isAllocated || isPacked) && handleDispatchOrder(d.orderNo, d.sku, d.qty, d.customer)}
                          disabled={!(isReady || isAllocated || isPacked)}
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.55rem', opacity: !(isReady || isAllocated || isPacked) ? 0.35 : 1, cursor: !(isReady || isAllocated || isPacked) ? 'not-allowed' : 'pointer' }}
                          title={(isReady || isAllocated || isPacked) ? 'Dispatch to carrier and deduct from stock ledger' : 'Order not ready to dispatch'}
                        >
                          Dispatch 🚚
                        </button>

                        {/* ✓ Confirm Delivery — only active when dispatched */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => isDispatched && handleConfirmDelivered(d.orderNo, d.customer)}
                          disabled={!isDispatched}
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.55rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--ss-success)', fontWeight: 700, opacity: !isDispatched ? 0.35 : 1, cursor: !isDispatched ? 'not-allowed' : 'pointer' }}
                          title={isDispatched ? 'Confirm Proof of Delivery at customer destination' : 'Order not yet dispatched'}
                        >
                          Confirm ✓
                        </button>

                        {/* Inspect Audit Flow Modal */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-ghost"
                          onClick={() => setInspectingDelivery(d)}
                          title="Inspect Data Lineage & Flow"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem' }}
                        >
                          👁️
                        </button>

                        {/* Edit Order */}
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => openEditModal(d)}
                          title="Edit Order"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem' }}
                        >
                          ✎
                        </button>

                        {/* Delete Order */}
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

      {/* Inspect Flow / Data Lineage Modal */}
      {inspectingDelivery && (
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
              maxWidth: '640px',
              width: '100%',
              backgroundColor: 'var(--ss-bg-surface)',
              border: '1px solid var(--ss-border)',
              boxShadow: 'var(--ss-shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Delivery Order Traceability & Lineage: {inspectingDelivery.orderNo}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Full lifecycle data trace, inventory allocation, and dispatch audit.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setInspectingDelivery(null)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)', border: '1px solid var(--ss-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <span style={{ color: 'var(--ss-text-muted)' }}>Customer:</span>{' '}
                    <strong style={{ color: 'var(--ss-text-primary)' }}>{inspectingDelivery.customer}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ss-text-muted)' }}>Destination:</span>{' '}
                    <strong style={{ color: 'var(--ss-text-primary)' }}>{inspectingDelivery.destination}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ss-text-muted)' }}>Line Item:</span>{' '}
                    <strong style={{ color: 'var(--ss-text-primary)' }}>{inspectingDelivery.productName} ({inspectingDelivery.sku})</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ss-text-muted)' }}>Quantity:</span>{' '}
                    <strong style={{ color: 'var(--ss-danger)' }}>-{inspectingDelivery.qty} units</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ss-text-muted)' }}>Carrier & SLA:</span>{' '}
                    <strong style={{ color: 'var(--ss-text-primary)' }}>{inspectingDelivery.carrier} ({inspectingDelivery.deadline})</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ss-text-muted)' }}>Source Pick Location:</span>{' '}
                    <strong style={{ color: 'var(--ss-primary)' }}>{inspectingDelivery.sourceLocation || 'Zone C (Rapid Dispatch)'}</strong>
                  </div>
                </div>
              </div>

              {/* Data Origin & Flow Journey */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginBottom: '0.5rem' }}>
                  Unified Lifecycle Pipeline:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--ss-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      1
                    </span>
                    <span><strong>Demand Created:</strong> Sales Order registered with quantity -{inspectingDelivery.qty}.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--ss-info)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      2
                    </span>
                    <span><strong>Stock Sourcing:</strong> Allocated from {inspectingDelivery.sourceLocation || 'Zone C'}.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--ss-warning)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      3
                    </span>
                    <span><strong>Floor Execution:</strong> Picked & packed by Warehouse Staff ({operatorName}).</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--ss-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      4
                    </span>
                    <span><strong>Ledger Outflow:</strong> Recorded immutably on the StockSense master ledger.</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setInspectingDelivery(null)}
                >
                  Close Trace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Delivery Modal */}
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
              maxWidth: '560px',
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
                  Allocate items for customer shipment and dispatch (Persisted in localStorage).
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
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Customer / Client
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
                      {p.sku} — {p.name} ({p.available} available, {p.onHand} on hand)
                    </option>
                  ))}
                </select>

                {/* Stock availability indicator */}
                {selectedProductObj && (
                  <div
                    style={{
                      marginTop: '0.35rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: selectedProductObj.available >= newQty ? 'var(--ss-success)' : 'var(--ss-danger)',
                    }}
                  >
                    <span>●</span>
                    <span>
                      Available to Pick: <strong>{selectedProductObj.available}</strong> units | Primary Bin: <strong>{selectedProductObj.primaryLocation}</strong>
                    </span>
                    {selectedProductObj.available < newQty && (
                      <span style={{ fontWeight: 700 }}>(Will enter Awaiting Stock)</span>
                    )}
                  </div>
                )}
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
                    Carrier Fleet
                  </label>
                  <select
                    className="ss-select"
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value)}
                  >
                    <option value="FedEx Freight Priority">FedEx Freight Priority</option>
                    <option value="DHL Express International">DHL Express International</option>
                    <option value="UPS Ground Fleet">UPS Ground Fleet</option>
                    <option value="Dedicated Logistics Fleet">Dedicated Logistics Fleet</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    SLA Delivery Deadline
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    required
                  />
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
                    <option value="ALLOCATED">Stock Allocated</option>
                    <option value="PACKED">Packed in Bay</option>
                    <option value="AWAITING_STOCK">Awaiting Stock</option>
                    <option value="DISPATCHED">Dispatched / In Transit</option>
                    <option value="DELIVERED">Delivered to Customer</option>
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
