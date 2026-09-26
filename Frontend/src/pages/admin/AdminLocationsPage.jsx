import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { AdminPagination } from '../../components/common/AdminPagination';

export const AdminLocationsPage = () => {
  const {
    locations,
    warehouses,
    addLocation,
    editLocation,
    deleteLocation,
    vacateLocation,
  } = useInventory();

  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    warehouse: warehouses?.[0]?.name || 'WH-01 Main DC (Bay Area)',
    zone: 'Zone A (Main Rack)',
    type: 'HIGH_BAY_RACK',
    maxCapacity: 80,
    status: 'VACANT',
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedWarehouseFilter, selectedStatusFilter, searchQuery]);

  const filteredLocations = useMemo(() => {
    return (locations || []).filter((loc) => {
      if (selectedWarehouseFilter !== 'ALL' && !loc.warehouse?.includes(selectedWarehouseFilter)) {
        return false;
      }
      if (selectedStatusFilter !== 'ALL' && loc.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mCode = loc.code?.toLowerCase().includes(q);
        const mZone = loc.zone?.toLowerCase().includes(q);
        const mSku = loc.sku?.toLowerCase().includes(q);
        const mWh = loc.warehouse?.toLowerCase().includes(q);
        return mCode || mZone || mSku || mWh;
      }
      return true;
    });
  }, [locations, selectedWarehouseFilter, selectedStatusFilter, searchQuery]);

  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLocations.slice(start, start + pageSize);
  }, [filteredLocations, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setFormData({
      code: `B-${Math.floor(Math.random() * 90 + 10)}`,
      warehouse: warehouses?.[0]?.name || 'WH-01 Main DC (Bay Area)',
      zone: 'Zone A (Main Rack)',
      type: 'HIGH_BAY_RACK',
      maxCapacity: 80,
      status: 'VACANT',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.code) return;
    addLocation(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingLoc) return;
    editLocation(editingLoc.id, editingLoc);
    setEditingLoc(null);
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
              Storage Locations & Bins
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
              {(locations || []).length} Total Bins / Shelves
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--ss-text-sm)',
              color: 'var(--ss-text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            Manage warehouse bin topology, high-bay racks, staging floors, and occupancy allocations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="ss-btn ss-btn-primary"
          style={{ fontSize: '0.8125rem', gap: '0.375rem' }}
        >
          <span>➕</span>
          <span>Add Storage Bin / Location</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--ss-space-4)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Warehouse Selector */}
          <select
            value={selectedWarehouseFilter}
            onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
            className="ss-input"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', width: 'auto' }}
          >
            <option value="ALL">All Warehouses</option>
            {(warehouses || []).map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--ss-bg-surface)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-md)',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('ALL')}
              style={{
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--ss-radius-sm)',
                border: 'none',
                background: selectedStatusFilter === 'ALL' ? 'var(--ss-primary)' : 'transparent',
                color: selectedStatusFilter === 'ALL' ? '#ffffff' : 'var(--ss-text-secondary)',
                cursor: 'pointer',
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('OCCUPIED')}
              style={{
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--ss-radius-sm)',
                border: 'none',
                background: selectedStatusFilter === 'OCCUPIED' ? 'var(--ss-primary)' : 'transparent',
                color: selectedStatusFilter === 'OCCUPIED' ? '#ffffff' : 'var(--ss-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Occupied
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('VACANT')}
              style={{
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--ss-radius-sm)',
                border: 'none',
                background: selectedStatusFilter === 'VACANT' ? 'var(--ss-success)' : 'transparent',
                color: selectedStatusFilter === 'VACANT' ? '#ffffff' : 'var(--ss-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Vacant
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search bin, zone, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ss-input"
            style={{ paddingLeft: '2rem', fontSize: '0.8125rem' }}
          />
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ss-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            🔍
          </span>
        </div>
      </div>

      {/* Locations Table */}
      <div
        style={{
          backgroundColor: 'var(--ss-bg-surface)',
          border: '1px solid var(--ss-border)',
          borderRadius: 'var(--ss-radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--ss-shadow-sm)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--ss-border)',
                  backgroundColor: 'rgba(15, 23, 42, 0.02)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--ss-text-muted)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '0.75rem 1rem', width: '130px' }}>Bin Location</th>
                <th style={{ padding: '0.75rem 1rem', width: '180px' }}>Warehouse & Zone</th>
                <th style={{ padding: '0.75rem 1rem', width: '150px' }}>Storage Type</th>
                <th style={{ padding: '0.75rem 1rem', width: '180px' }}>Occupancy / Load</th>
                <th style={{ padding: '0.75rem 1rem', width: '130px' }}>Assigned SKU</th>
                <th style={{ padding: '0.75rem 1rem', width: '120px' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '160px', minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLocations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📍</div>
                    No locations found matching query.
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((loc) => {
                  const isOccupied = loc.status === 'OCCUPIED';
                  const pct = Math.round(((loc.currentQty || 0) / (loc.maxCapacity || 80)) * 100);

                  return (
                    <tr
                      key={loc.id}
                      style={{
                        borderBottom: '1px solid var(--ss-border)',
                        transition: 'background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ss-bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Code */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                            color: 'var(--ss-text-primary)',
                            backgroundColor: 'var(--ss-bg-app)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--ss-radius-sm)',
                            border: '1px solid var(--ss-border)',
                          }}
                        >
                          {loc.code}
                        </span>
                      </td>

                      {/* Warehouse & Zone */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
                          {loc.zone}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                          {loc.warehouse}
                        </div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                        {loc.type?.replace(/_/g, ' ') || 'STANDARD RACK'}
                      </td>

                      {/* Occupancy Bar */}
                      <td style={{ padding: '0.75rem 1rem', width: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                            {loc.currentQty || 0} / {loc.maxCapacity || 80}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                            {pct}%
                          </span>
                        </div>
                        <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--ss-bg-app)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, pct)}%`,
                              backgroundColor: pct > 85 ? 'var(--ss-warning)' : 'var(--ss-primary)',
                              borderRadius: '9999px',
                            }}
                          />
                        </div>
                      </td>

                      {/* Assigned SKU */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {loc.sku ? (
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              color: 'var(--ss-primary)',
                              backgroundColor: 'rgba(59, 130, 246, 0.08)',
                              padding: '2px 6px',
                              borderRadius: 'var(--ss-radius-xs)',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                            }}
                          >
                            {loc.sku}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>— Vacant —</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--ss-radius-full)',
                            backgroundColor: isOccupied ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: isOccupied ? 'var(--ss-primary)' : 'var(--ss-success)',
                            border: isOccupied ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          {loc.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '160px', minWidth: '160px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          {isOccupied ? (
                            <button
                              type="button"
                              onClick={() => vacateLocation(loc.id)}
                              className="ss-btn ss-btn-secondary"
                              style={{
                                minWidth: '54px',
                                height: '28px',
                                fontSize: '0.6875rem',
                                padding: '0 0.4rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                              title="Clear SKU and mark Vacant"
                            >
                              Vacate
                            </button>
                          ) : (
                            <div style={{ width: '54px', height: '28px', flexShrink: 0 }} />
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingLoc(loc)}
                            className="ss-btn ss-btn-secondary"
                            style={{
                              minWidth: '44px',
                              height: '28px',
                              fontSize: '0.6875rem',
                              padding: '0 0.4rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete location ${loc.code}?`)) {
                                deleteLocation(loc.id);
                              }
                            }}
                            className="ss-btn ss-btn-ghost"
                            style={{
                              width: '28px',
                              height: '28px',
                              fontSize: '0.6875rem',
                              padding: 0,
                              color: 'var(--ss-danger)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                            title="Delete bin"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <AdminPagination
          currentPage={currentPage}
          totalItems={filteredLocations.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="locations"
        />
      </div>

      {/* MODAL: Add Location */}
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
                <span style={{ fontSize: '1.25rem' }}>📍</span>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Add Storage Location Bin
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
                    BIN CODE:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A-05"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    ZONE / AISLE:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zone A (Main Rack)"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  WAREHOUSE FACILITY:
                </label>
                <select
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  className="ss-input"
                >
                  {(warehouses || []).map((wh) => (
                    <option key={wh.id} value={wh.name}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    LOCATION TYPE:
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="ss-input"
                  >
                    <option value="HIGH_BAY_RACK">High-Bay Rack</option>
                    <option value="BULK_STORAGE">Bulk Storage Bay</option>
                    <option value="STAGING_FLOOR">Staging Floor</option>
                    <option value="SECURE_LOCKBOX">Secure Vault</option>
                    <option value="RECEIVING_DOCK">Receiving Dock</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    MAX CAPACITY (UNITS):
                  </label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="ss-input"
                    required
                  />
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
                  Create Bin Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Location */}
      {editingLoc && (
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
                Edit Location: {editingLoc.code}
              </h3>
              <button
                type="button"
                onClick={() => setEditingLoc(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  ZONE / AISLE:
                </label>
                <input
                  type="text"
                  value={editingLoc.zone}
                  onChange={(e) => setEditingLoc({ ...editingLoc, zone: e.target.value })}
                  className="ss-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  MAX CAPACITY (UNITS):
                </label>
                <input
                  type="number"
                  value={editingLoc.maxCapacity}
                  onChange={(e) => setEditingLoc({ ...editingLoc, maxCapacity: Number(e.target.value) })}
                  className="ss-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  STATUS:
                </label>
                <select
                  value={editingLoc.status}
                  onChange={(e) => setEditingLoc({ ...editingLoc, status: e.target.value })}
                  className="ss-input"
                >
                  <option value="VACANT">Vacant</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingLoc(null)}
                  className="ss-btn ss-btn-secondary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary" style={{ fontSize: '0.8125rem' }}>
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLocationsPage;
