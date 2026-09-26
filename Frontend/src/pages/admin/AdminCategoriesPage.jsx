import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { AdminPagination } from '../../components/common/AdminPagination';

export const AdminCategoriesPage = () => {
  const { categories, addCategory, editCategory, deleteCategory, products } = useInventory();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return (categories || []).slice(start, start + pageSize);
  }, [categories, currentPage, pageSize]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    status: 'ACTIVE',
  });

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      status: 'ACTIVE',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    addCategory({
      ...formData,
      code: formData.code.toUpperCase().trim(),
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    editCategory(editingCategory.id, editingCategory);
    setEditingCategory(null);
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
              Product Categories Configuration
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
              {(categories || []).length} Master Categories
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--ss-text-sm)',
              color: 'var(--ss-text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            Organize inventory items into tax and warehouse grouping hierarchies for stock reporting.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="ss-btn ss-btn-primary"
          style={{ fontSize: '0.8125rem', gap: '0.375rem' }}
        >
          <span>➕</span>
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
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
                <th style={{ padding: '0.75rem 1rem', width: '120px' }}>Code</th>
                <th style={{ padding: '0.75rem 1rem', width: '180px' }}>Category Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Description & Scope</th>
                <th style={{ padding: '0.75rem 1rem', width: '140px' }}>Assigned SKUs</th>
                <th style={{ padding: '0.75rem 1rem', width: '120px' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '120px', minWidth: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏷️</div>
                    No categories registered yet.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat) => {
                  const assignedSkus = (products || []).filter(
                    (p) =>
                      p.category?.toLowerCase() === cat.name?.toLowerCase() ||
                      p.category?.toLowerCase() === cat.code?.toLowerCase()
                  ).length;

                  return (
                    <tr
                      key={cat.id}
                      style={{
                        borderBottom: '1px solid var(--ss-border)',
                        transition: 'background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ss-bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: 'var(--ss-primary)',
                            backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            padding: '2px 8px',
                            borderRadius: 'var(--ss-radius-xs)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                          }}
                        >
                          {cat.code}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-text-primary)' }}>
                        {cat.name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', maxWidth: '400px' }}>
                        {cat.description}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                        {assignedSkus || cat.skuCount || 0} Products
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--ss-radius-full)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: 'var(--ss-success)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          {cat.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '120px', minWidth: '120px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(cat)}
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
                              if (window.confirm(`Delete category ${cat.name}?`)) {
                                deleteCategory(cat.id);
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
                            title="Delete category"
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
          totalItems={(categories || []).length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="categories"
        />
      </div>

      {/* MODAL: Add Category */}
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
                <span style={{ fontSize: '1.25rem' }}>🏷️</span>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Add Product Category
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
                    CATEGORY CODE:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SENSORS"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    CATEGORY NAME:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Optics & Sensors"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="ss-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  DESCRIPTION / SCOPE:
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe items falling within this inventory classification..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="ss-input"
                  style={{ resize: 'vertical' }}
                />
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Category */}
      {editingCategory && (
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
                Edit Category: {editingCategory.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  CATEGORY NAME:
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="ss-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  DESCRIPTION:
                </label>
                <textarea
                  rows="3"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="ss-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="ss-btn ss-btn-secondary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary" style={{ fontSize: '0.8125rem' }}>
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

export default AdminCategoriesPage;
