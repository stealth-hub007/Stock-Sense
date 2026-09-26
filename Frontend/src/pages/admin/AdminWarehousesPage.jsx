import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { AdminPagination } from '../../components/common/AdminPagination';

export const AdminWarehousesPage = () => {
  const { warehouses, addWarehouse, editWarehouse, deleteWarehouse, locations } = useInventory();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const paginatedWarehouses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return (warehouses || []).slice(start, start + pageSize);
  }, [warehouses, currentPage, pageSize]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    city: '',
    state: '',
    address: '',
    capacity: '10,000 units',
    status: 'ACTIVE',
  });

  const handleOpenAdd = () => {
    setFormData({
      code: `WH-0${(warehouses?.length || 0) + 1}`,
      name: '',
      city: '',
      state: 'CA',
      address: '',
      capacity: '10,000 units',
      status: 'ACTIVE',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addWarehouse(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingWarehouse) return;
    editWarehouse(editingWarehouse.id, editingWarehouse);
    setEditingWarehouse(null);
  };

  const toggleWarehouseStatus = (wh) => {
    const nextStatus = wh.status === 'ACTIVE' || wh.status === 'ONLINE' ? 'MAINTENANCE' : 'ACTIVE';
    editWarehouse(wh.id, { status: nextStatus });
  };

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--ss-space-6)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--ss-text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Warehouse Facilities Management
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--ss-primary)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--ss-radius-full)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              {(warehouses || []).length} Distribution Centers
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--ss-text-sm)',
              color: 'var(--ss-text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            Configure physical storage facilities, operational addresses, capacities, and online routing status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="ss-btn ss-btn-primary"
          style={{ fontSize: '0.8125rem', gap: '0.375rem' }}
        >
          <span>➕</span>
          <span>Register New Facility</span>
        </button>
      </div>

      {/* Facilities Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--ss-space-5)',
        }}
      >
        {paginatedWarehouses.map((wh) => {
          const isOnline = wh.status === 'ACTIVE' || wh.status === 'ONLINE';
          const whLocations = (locations || []).filter((l) =>
            l.warehouse?.toLowerCase().includes(wh.name?.toLowerCase()) ||
            l.warehouse?.toLowerCase().includes(wh.code?.toLowerCase())
          );
          const occupiedBins = whLocations.filter((l) => l.status === 'OCCUPIED').length;

          return (
            <div
              key={wh.id}
              style={{
                backgroundColor: 'var(--ss-bg-surface)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-lg)',
                padding: 'var(--ss-space-5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--ss-shadow-sm)',
                transition: 'all 150ms ease',
              }}
            >
              <div>
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--ss-radius-md)',
                        backgroundColor: 'var(--ss-primary-subtle)',
                        color: 'var(--ss-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                      }}
                    >
                      🏢
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ss-text-primary)' }}>
                        {wh.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                        Code: {wh.code || wh.id} • {wh.city || 'Bay Area'}, {wh.state || 'CA'}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--ss-radius-full)',
                      backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: isOnline ? 'var(--ss-success)' : 'var(--ss-warning-text)',
                      border: isOnline ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                    }}
                  >
                    {isOnline ? 'ONLINE' : 'MAINTENANCE'}
                  </span>
                </div>

                {/* Details list */}
                <div
                  style={{
                    backgroundColor: 'var(--ss-bg-app)',
                    borderRadius: 'var(--ss-radius-md)',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ss-text-muted)' }}>Physical Address:</span>
                    <span style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                      {wh.address || 'Industrial Parkway Blvd'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ss-text-muted)' }}>Storage Capacity:</span>
                    <span style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                      {wh.capacity || '10,000 units'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ss-text-muted)' }}>Configured Bins / Zones:</span>
                    <span style={{ fontWeight: 600, color: 'var(--ss-primary)' }}>
                      {whLocations.length > 0 ? `${whLocations.length} Bins (${occupiedBins} Occupied)` : 'Default Zones (A-D)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--ss-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => toggleWarehouseStatus(wh)}
                    className="ss-btn ss-btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', height: '30px' }}
                  >
                    {isOnline ? 'Set Maintenance' : 'Set Online'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingWarehouse(wh)}
                    className="ss-btn ss-btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', height: '30px' }}
                  >
                    Edit
                  </button>
                </div>

                {warehouses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete facility ${wh.name}?`)) {
                        deleteWarehouse(wh.id);
                      }
                    }}
                    className="ss-btn ss-btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', color: 'var(--ss-danger)', height: '30px' }}
                    title="Delete facility"
                  >
                    ✕ Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: 'var(--ss-space-4)', borderRadius: 'var(--ss-radius-lg)', overflow: 'hidden', border: '1px solid var(--ss-border)' }}>
        <AdminPagination
          currentPage={currentPage}
          totalItems={(warehouses || []).length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="facilities"
        />
      </div>

      {/* MODAL: Register New Warehouse */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--ss-bg-surface-elevated)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-lg)',
              boxShadow: 'var(--ss-shadow-xl)',
              width: '100%',
              maxWidth: '480px',
              padding: 'var(--ss-space-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🏢</span>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Register New Warehouse Facility
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    FACILITY CODE:
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    FACILITY NAME:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WH-04 Northeast Logistics"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    CITY:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Philadelphia"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    STATE / REGION:
                  </label>
                  <input
                    type="text"
                    placeholder="PA"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  PHYSICAL ADDRESS:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 800 Logistics Way, Dock Gate 4"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="ss-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    ESTIMATED CAPACITY:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15,000 units"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="ss-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    STATUS:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="ss-input"
                  >
                    <option value="ACTIVE">Online / Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="ss-btn ss-btn-secondary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary" style={{ fontSize: '0.8125rem' }}>
                  Register Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Warehouse */}
      {editingWarehouse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--ss-bg-surface-elevated)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-lg)',
              boxShadow: 'var(--ss-shadow-xl)',
              width: '100%',
              maxWidth: '480px',
              padding: 'var(--ss-space-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                Edit Facility Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingWarehouse(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  FACILITY NAME:
                </label>
                <input
                  type="text"
                  value={editingWarehouse.name}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, name: e.target.value })}
                  className="ss-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    CITY:
                  </label>
                  <input
                    type="text"
                    value={editingWarehouse.city || ''}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, city: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    STATE / REGION:
                  </label>
                  <input
                    type="text"
                    value={editingWarehouse.state || ''}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, state: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  STORAGE CAPACITY:
                </label>
                <input
                  type="text"
                  value={editingWarehouse.capacity || ''}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, capacity: e.target.value })}
                  className="ss-input"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingWarehouse(null)}
                  className="ss-btn ss-btn-secondary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary" style={{ fontSize: '0.8125rem' }}>
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWarehousesPage;
