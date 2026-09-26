import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const StaffDeliveriesPage = () => {
  const { deliveries, advanceDeliveryStatus } = useInventory();
  const [activeTab, setActiveTab] = useState('PICKING'); // 'PICKING' | 'PACKING' | 'DISPATCHED'
  const [selectedPickOrder, setSelectedPickOrder] = useState(null);
  const [pickedQtyInput, setPickedQtyInput] = useState(0);
  const [selectedPackOrder, setSelectedPackOrder] = useState(null);
  const [cartonType, setCartonType] = useState('STANDARD_BOX');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Filter queues
  const pickingOrders = (deliveries || []).filter(
    (d) => d.status === 'READY_TO_DISPATCH' || d.status === 'ALLOCATED'
  );
  const packingOrders = (deliveries || []).filter((d) => d.status === 'PICKED');
  const dispatchedOrders = (deliveries || []).filter(
    (d) => d.status === 'PACKED' || d.status === 'DISPATCHED' || d.status === 'DELIVERED'
  );

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
            border: '1px solid var(--ss-success)',
            borderRadius: 'var(--ss-radius-md)',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-success)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <span>✓</span>
          <span>{toast}</span>
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
            Optimized floor actions for item bin picking, cartonizing, and sealing customer delivery orders.
          </p>
        </div>

        {/* Operational Workflow Switcher */}
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
                    Customer: {order.customer || 'Commercial Client Corp'}
                  </div>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>ORDER #</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>PRODUCT</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>CUSTOMER</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>QTY</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>STATUS</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST PICK QUANTITY */}
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

      {/* MODAL: PACKING BENCH CARTONIZATION */}
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
