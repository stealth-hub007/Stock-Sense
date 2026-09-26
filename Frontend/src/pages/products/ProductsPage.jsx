import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const ProductsPage = ({ onQuickReceive, onQuickTransfer }) => {
  const { products, addProduct, editProduct, deleteProduct } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Add SKU Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Motion & Actuators');
  const [newUom, setNewUom] = useState('Units');
  const [newCost, setNewCost] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newLocation, setNewLocation] = useState('Rack A-05');
  const [newQty, setNewQty] = useState('');
  const [newMin, setNewMin] = useState(25);
  const [newReorderPoint, setNewReorderPoint] = useState(35);
  const [newMaxStock, setNewMaxStock] = useState(200);
  const [newAutoReorder, setNewAutoReorder] = useState(true);

  // Edit SKU Modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editUom, setEditUom] = useState('Units');
  const [editCost, setEditCost] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editMin, setEditMin] = useState(20);
  const [editOnHand, setEditOnHand] = useState(0);
  const [editReorderPoint, setEditReorderPoint] = useState(30);
  const [editMaxStock, setEditMaxStock] = useState(150);
  const [editAutoReorder, setEditAutoReorder] = useState(true);

  const [actionToast, setActionToast] = useState(null);

  const showToast = (msg) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

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

  const handleCreateProduct = (e) => {
    e.preventDefault();
    const created = addProduct({
      sku: newSku,
      name: newName,
      category: newCategory,
      uom: newUom,
      unitCost: newCost,
      unitPrice: newPrice,
      primaryLocation: newLocation,
      onHand: newQty,
      minThreshold: newMin,
      reorderRule: {
        minStock: parseInt(newMin, 10) || 10,
        maxStock: parseInt(newMaxStock, 10) || 200,
        reorderPoint: parseInt(newReorderPoint, 10) || 25,
        autoReorder: newAutoReorder,
      },
    });
    setIsAddModalOpen(false);
    setNewSku('');
    setNewName('');
    setNewCost('');
    setNewPrice('');
    setNewQty('');
    showToast(`✓ SKU ${created.sku} added with Reorder Rules & persisted!`);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditCategory(product.category);
    setEditUom(product.uom || 'Units');
    setEditCost(product.unitCost);
    setEditPrice(product.unitPrice);
    setEditLocation(product.primaryLocation);
    setEditMin(product.minThreshold);
    setEditOnHand(product.onHand);
    setEditReorderPoint(product.reorderRule?.reorderPoint || product.minThreshold + 10);
    setEditMaxStock(product.reorderRule?.maxStock || product.minThreshold * 5);
    setEditAutoReorder(product.reorderRule?.autoReorder ?? true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    editProduct(editingProduct.id, {
      name: editName,
      category: editCategory,
      uom: editUom,
      unitCost: parseFloat(editCost) || 0,
      unitPrice: parseFloat(editPrice) || 0,
      primaryLocation: editLocation,
      minThreshold: parseInt(editMin, 10) || 10,
      onHand: parseInt(editOnHand, 10) || 0,
      reorderRule: {
        minStock: parseInt(editMin, 10) || 10,
        maxStock: parseInt(editMaxStock, 10) || 200,
        reorderPoint: parseInt(editReorderPoint, 10) || 25,
        autoReorder: editAutoReorder,
      },
    });

    showToast(`✓ SKU ${editingProduct.sku} updated with Reorder Rules & saved!`);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Are you sure you want to delete SKU ${product.sku} (${product.name}) from inventory?`)) {
      deleteProduct(product.id);
      showToast(`🗑 SKU ${product.sku} removed from inventory.`);
    }
  };

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1680px', margin: '0 auto', width: '100%' }}>
      {/* Toast Notification */}
      {actionToast && (
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
            gap: '0.75rem',
            color: 'var(--ss-text-primary)',
          }}
        >
          <span style={{ color: 'var(--ss-primary)', fontSize: '1.25rem' }}>✓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-primary)' }}>
              Catalog Operation Complete
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              {actionToast}
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
              Products Master Catalog
            </h1>
            <span className="ss-badge ss-badge-info">INVENTORY MASTER</span>
            <span className="ss-badge ss-badge-success">● FULL CRUD ENABLED</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Central SKU registry with live multi-bin tracking, unit economics, edit/delete actions, and localStorage persistence.
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
            ${products.reduce((acc, p) => acc + (p.onHand || 0) * (p.unitCost || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
            {products.reduce((acc, p) => acc + (p.onHand || 0), 0).toLocaleString()} Units
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
                <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', fontWeight: 600, textAlign: 'right' }}>CRUD ACTIONS</th>
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
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>UoM: <strong style={{ color: 'var(--ss-text-primary)' }}>{p.uom || 'Units'}</strong></span>
                        <span>•</span>
                        <span style={{ color: 'var(--ss-primary)', fontWeight: 600 }}>
                          Reorder @ {p.reorderRule?.reorderPoint || p.minThreshold} (Max {p.reorderRule?.maxStock || 250})
                        </span>
                        {p.reorderRule?.autoReorder && (
                          <span style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--ss-success)', borderRadius: '3px', fontWeight: 700 }}>
                            AUTO-PO
                          </span>
                        )}
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

                    {/* CRUD ACTION BUTTONS: Edit, Delete, Quick Moves */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="ss-btn ss-btn-secondary"
                          onClick={() => openEditModal(p)}
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.45rem' }}
                          title="Edit Product Details"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="ss-btn ss-btn-danger"
                          onClick={() => handleDeleteProduct(p)}
                          style={{ fontSize: '0.6875rem', padding: '0.25rem 0.45rem' }}
                          title="Delete Product from Catalog"
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

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Unit of Measure (UOM)
                  </label>
                  <select
                    className="ss-select"
                    value={newUom}
                    onChange={(e) => setNewUom(e.target.value)}
                  >
                    <option value="Units">Units (pcs)</option>
                    <option value="Kilograms (kg)">Kilograms (kg)</option>
                    <option value="Boxes (box)">Boxes (box)</option>
                    <option value="Liters (L)">Liters (L)</option>
                    <option value="Rolls">Rolls (roll)</option>
                    <option value="Sets">Sets (set)</option>
                    <option value="Pallets">Pallets (plt)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Initial In-Stock Qty
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
                    Min Safety Level
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

              {/* Reorder Rules Configuration */}
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--ss-radius-md)',
                  background: 'var(--ss-bg-app)',
                  border: '1px solid var(--ss-border)',
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  📐 Reorder Rules (Engine Automation)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                      Reorder Trigger Point
                    </label>
                    <input
                      type="number"
                      className="ss-input"
                      value={newReorderPoint}
                      onChange={(e) => setNewReorderPoint(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                      Max Stock Capacity
                    </label>
                    <input
                      type="number"
                      className="ss-input"
                      value={newMaxStock}
                      onChange={(e) => setNewMaxStock(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--ss-text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newAutoReorder}
                    onChange={(e) => setNewAutoReorder(e.target.checked)}
                  />
                  <span>Enable Automated PO Replenishment when onHand ≤ Reorder Point</span>
                </label>
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

      {/* Edit SKU Modal */}
      {editingProduct && (
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
                  Edit Product SKU: {editingProduct.sku}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Modify master information, safety thresholds, or storage location.
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setEditingProduct(null)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Primary Location
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
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
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="ss-input"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Unit of Measure (UOM)
                  </label>
                  <select
                    className="ss-select"
                    value={editUom}
                    onChange={(e) => setEditUom(e.target.value)}
                  >
                    <option value="Units">Units (pcs)</option>
                    <option value="Kilograms (kg)">Kilograms (kg)</option>
                    <option value="Boxes (box)">Boxes (box)</option>
                    <option value="Liters (L)">Liters (L)</option>
                    <option value="Rolls">Rolls (roll)</option>
                    <option value="Sets">Sets (set)</option>
                    <option value="Pallets">Pallets (plt)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    On Hand Stock
                  </label>
                  <input
                    type="number"
                    className="ss-input"
                    value={editOnHand}
                    onChange={(e) => setEditOnHand(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Min Safety Level
                  </label>
                  <input
                    type="number"
                    className="ss-input"
                    value={editMin}
                    onChange={(e) => setEditMin(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Reorder Rules Configuration */}
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--ss-radius-md)',
                  background: 'var(--ss-bg-app)',
                  border: '1px solid var(--ss-border)',
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  📐 Reorder Rules (Engine Automation)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                      Reorder Trigger Point
                    </label>
                    <input
                      type="number"
                      className="ss-input"
                      value={editReorderPoint}
                      onChange={(e) => setEditReorderPoint(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                      Max Stock Capacity
                    </label>
                    <input
                      type="number"
                      className="ss-input"
                      value={editMaxStock}
                      onChange={(e) => setEditMaxStock(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--ss-text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editAutoReorder}
                    onChange={(e) => setEditAutoReorder(e.target.checked)}
                  />
                  <span>Enable Automated PO Replenishment when onHand ≤ Reorder Point</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setEditingProduct(null)}
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

export default ProductsPage;
