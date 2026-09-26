import React, { useState } from 'react';
import { INITIAL_PRODUCTS } from '../../services/mockData';

export const ProductsPage = ({ onQuickReceive, onQuickTransfer }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form state
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Motion & Actuators');
  const [newCost, setNewCost] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newLocation, setNewLocation] = useState('Rack A-05');
  const [newQty, setNewQty] = useState('');
  const [newMin, setNewMin] = useState(25);

  const categories = ['ALL', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primaryLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    const qty = parseInt(newQty, 10) || 0;
    const min = parseInt(newMin, 10) || 10;
    const cost = parseFloat(newCost) || 0;
    const price = parseFloat(newPrice) || 0;

    const newProd = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      sku: newSku.toUpperCase(),
      name: newName,
      category: newCategory,
      unitCost: cost,
      unitPrice: price,
      onHand: qty,
      allocated: 0,
      available: qty,
      minThreshold: min,
      status: qty === 0 ? 'OUT_OF_STOCK' : qty <= min ? 'LOW_STOCK' : 'IN_STOCK',
      primaryLocation: newLocation,
      uom: 'Units',
      barcode: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      locations: [{ zone: 'Main Storage', bin: newLocation, qty }],
    };

    setProducts([newProd, ...products]);
    setIsAddModalOpen(false);
    setNewSku('');
    setNewName('');
    setNewCost('');
    setNewPrice('');
    setNewQty('');
  };

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1680px', margin: '0 auto', width: '100%' }}>
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
              Products Master Catalog
            </h1>
            <span className="ss-badge ss-badge-info">INVENTORY MASTER</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Central SKU registry with multi-bin tracking, unit economics, and safety reorder thresholds.
          </p>
        </div>

        <button
          type="button"
          className="ss-btn ss-btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add New SKU Master
        </button>
      </div>

      {/* Summary Stat Pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-5)',
        }}
      >
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>REGISTERED SKUs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
            {products.length} Items
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>TOTAL CATALOG VALUE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)' }}>
            ${products.reduce((acc, p) => acc + p.onHand * p.unitCost, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>BELOW MIN SAFETY POINT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)' }}>
            {products.filter((p) => p.status !== 'IN_STOCK').length} SKUs
          </div>
        </div>
        <div className="ss-card" style={{ padding: 'var(--ss-space-4)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>TOTAL ON-HAND UNITS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)' }}>
            {products.reduce((acc, p) => acc + p.onHand, 0).toLocaleString()} Units
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
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
        <div style={{ flex: '1 1 260px' }}>
          <input
            type="text"
            className="ss-input"
            placeholder="Search by SKU, Product Name, or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Category:</span>
          <select
            className="ss-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: 'auto' }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Status:</span>
          <select
            className="ss-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_STOCK">In Stock (Healthy)</option>
            <option value="LOW_STOCK">Low Stock (Alert)</option>
            <option value="OUT_OF_STOCK">Out of Stock (Critical)</option>
          </select>
        </div>
      </div>

      {/* Main Products Table */}
      <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>SKU & BARCODE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>PRODUCT DETAILS</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>CATEGORY</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>PRIMARY LOCATION</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>ON HAND</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>AVAILABLE</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>UNIT COST</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>QUICK ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isLow = p.status === 'LOW_STOCK';
                const isOut = p.status === 'OUT_OF_STOCK';

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--ss-border-subtle)',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                        {p.sku}
                      </div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-muted)' }}>
                        {p.barcode}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                        UoM: {p.uom} • Weight: {p.weight}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="ss-badge ss-badge-neutral">{p.category}</span>
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
                        {p.primaryLocation}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--ss-font-mono)',
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: isOut ? 'var(--ss-danger-text)' : isLow ? 'var(--ss-warning-text)' : 'var(--ss-text-primary)',
                        }}
                      >
                        {p.onHand}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-secondary)' }}>
                      {p.available}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)' }}>
                      ${p.unitCost.toFixed(2)}
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isOut && <span className="ss-badge ss-badge-danger">Out of Stock</span>}
                      {isLow && <span className="ss-badge ss-badge-warning">Low Stock ({p.minThreshold} min)</span>}
                      {!isLow && !isOut && <span className="ss-badge ss-badge-success">In Stock</span>}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.45rem' }}
                          title="Receive inbound shipment"
                        >
                          + Receive
                        </button>
                        <button
                          type="button"
                          className="ss-btn ss-btn-ghost"
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.45rem' }}
                          title="Relocate to another zone"
                        >
                          ⇄ Move
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

      {/* Add New SKU Modal */}
      {isAddModalOpen && (
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
                  Create New Product SKU
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Define master item details, initial bin location, and reorder point.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setIsAddModalOpen(false)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    SKU Code
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    placeholder="e.g. MOT-102"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    placeholder="e.g. Precision Stepper Motor"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Category
                  </label>
                  <select
                    className="ss-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Motion & Actuators">Motion & Actuators</option>
                    <option value="Hydraulics & Air">Hydraulics & Air</option>
                    <option value="Sensors & Vision">Sensors & Vision</option>
                    <option value="Automation & Controls">Automation & Controls</option>
                    <option value="Cabling & Power">Cabling & Power</option>
                    <option value="Mechanical Hardware">Mechanical Hardware</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Primary Storage Bin
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    placeholder="e.g. Rack A-05"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="ss-input"
                    placeholder="120.00"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Unit Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="ss-input"
                    placeholder="185.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Initial In-Stock Quantity
                  </label>
                  <input
                    type="number"
                    className="ss-input"
                    placeholder="50"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Min Safety Reorder Level
                  </label>
                  <input
                    type="number"
                    className="ss-input"
                    value={newMin}
                    onChange={(e) => setNewMin(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary">
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
