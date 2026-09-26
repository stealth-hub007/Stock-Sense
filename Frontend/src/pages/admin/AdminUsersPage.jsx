import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_STYLES } from '../../constants/roles';
import { AdminPagination } from '../../components/common/AdminPagination';

export const AdminUsersPage = () => {
  const {
    users,
    warehouses,
    addUser,
    editUser,
    deleteUser,
    approveUser,
    updateUserStatus,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // ALL | PENDING_APPROVAL | ACTIVE | SUSPENDED
  const [selectedUser, setSelectedUser] = useState(null); // For Details Modal
  const [approveModalUser, setApproveModalUser] = useState(null); // For Approval Modal
  const [editModalUser, setEditModalUser] = useState(null); // For Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For New User Modal

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Approval Form State
  const [approvalRole, setApprovalRole] = useState(ROLES.WAREHOUSE_STAFF);
  const [approvalFacility, setApprovalFacility] = useState(
    warehouses?.[0]?.name || 'WH-01 Main DC (San Francisco)'
  );

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: ROLES.WAREHOUSE_STAFF,
    title: 'Warehouse Specialist',
    facility: warehouses?.[0]?.name || 'WH-01 Main DC (San Francisco)',
    phone: '',
    status: 'ACTIVE',
  });

  // Reset page when filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTab, searchQuery]);

  // Filtered & Searched Users
  const filteredUsers = useMemo(() => {
    return (users || []).filter((u) => {
      // Tab filter
      if (filterTab !== 'ALL' && u.status !== filterTab) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchRole = u.role?.toLowerCase().includes(q);
        const matchFacility = u.facility?.toLowerCase().includes(q);
        return matchName || matchEmail || matchRole || matchFacility;
      }
      return true;
    });
  }, [users, filterTab, searchQuery]);

  // Paginated Users Slice
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const pendingCount = (users || []).filter((u) => u.status === 'PENDING_APPROVAL').length;
  const activeCount = (users || []).filter((u) => u.status === 'ACTIVE').length;
  const suspendedCount = (users || []).filter((u) => u.status === 'SUSPENDED').length;

  const handleOpenApproveModal = (u) => {
    setApproveModalUser(u);
    setApprovalRole(u.role || ROLES.WAREHOUSE_STAFF);
    setApprovalFacility(u.facility || warehouses?.[0]?.name || 'WH-01 Main DC');
  };

  const handleConfirmApproval = () => {
    if (!approveModalUser) return;
    approveUser(approveModalUser.id, approvalRole, approvalFacility);
    setApproveModalUser(null);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;
    addUser(newUserForm);
    setIsAddModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      role: ROLES.WAREHOUSE_STAFF,
      title: 'Warehouse Specialist',
      facility: warehouses?.[0]?.name || 'WH-01 Main DC (San Francisco)',
      phone: '',
      status: 'ACTIVE',
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editModalUser) return;
    editUser(editModalUser.id, editModalUser);
    setEditModalUser(null);
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
              User Governance & Access Control
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
              {(users || []).length} Registered Accounts
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--ss-text-sm)',
              color: 'var(--ss-text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            Review registration requests, assign panel roles (Manager vs. Staff), and manage operator credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="ss-btn ss-btn-primary"
          style={{ fontSize: '0.8125rem', gap: '0.375rem' }}
        >
          <span>➕</span>
          <span>Invite / Add Operator</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
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
        {/* Status Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-md)',
            padding: '3px',
          }}
        >
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--ss-radius-sm)',
              border: 'none',
              background: filterTab === 'ALL' ? 'var(--ss-primary)' : 'transparent',
              color: filterTab === 'ALL' ? '#ffffff' : 'var(--ss-text-secondary)',
              cursor: 'pointer',
            }}
          >
            All ({(users || []).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('PENDING_APPROVAL')}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--ss-radius-sm)',
              border: 'none',
              background: filterTab === 'PENDING_APPROVAL' ? 'var(--ss-warning)' : 'transparent',
              color: filterTab === 'PENDING_APPROVAL' ? '#000000' : 'var(--ss-warning-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⏳ Pending Approval</span>
            {pendingCount > 0 && (
              <span
                style={{
                  fontSize: '0.625rem',
                  backgroundColor: filterTab === 'PENDING_APPROVAL' ? '#000000' : 'var(--ss-warning)',
                  color: filterTab === 'PENDING_APPROVAL' ? '#ffffff' : '#000000',
                  padding: '1px 5px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('ACTIVE')}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--ss-radius-sm)',
              border: 'none',
              background: filterTab === 'ACTIVE' ? 'var(--ss-success)' : 'transparent',
              color: filterTab === 'ACTIVE' ? '#ffffff' : 'var(--ss-text-secondary)',
              cursor: 'pointer',
            }}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('SUSPENDED')}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--ss-radius-sm)',
              border: 'none',
              background: filterTab === 'SUSPENDED' ? 'var(--ss-danger)' : 'transparent',
              color: filterTab === 'SUSPENDED' ? '#ffffff' : 'var(--ss-text-secondary)',
              cursor: 'pointer',
            }}
          >
            Suspended ({suspendedCount})
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px' }}>
          <input
            type="text"
            placeholder="Search by name, email, facility, or role..."
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

      {/* Users Table */}
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
                <th style={{ padding: '0.75rem 1rem' }}>User / Operator</th>
                <th style={{ padding: '0.75rem 1rem', width: '160px' }}>Assigned Role</th>
                <th style={{ padding: '0.75rem 1rem', width: '220px' }}>Facility / Location</th>
                <th style={{ padding: '0.75rem 1rem', width: '150px' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', width: '110px' }}>Last Active</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '230px', minWidth: '230px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const badge = ROLE_BADGE_STYLES[u.role] || ROLE_BADGE_STYLES[ROLES.WAREHOUSE_STAFF];
                  const isPending = u.status === 'PENDING_APPROVAL';
                  const isSuspended = u.status === 'SUSPENDED';

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--ss-border)',
                        transition: 'background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ss-bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Name & Email */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: isPending
                                ? 'rgba(245, 158, 11, 0.15)'
                                : u.role === ROLES.ADMIN
                                ? 'rgba(245, 158, 11, 0.15)'
                                : u.role === ROLES.INVENTORY_MANAGER
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                              color: isPending
                                ? 'var(--ss-warning-text)'
                                : u.role === ROLES.ADMIN
                                ? 'var(--ss-warning-text)'
                                : u.role === ROLES.INVENTORY_MANAGER
                                ? 'var(--ss-primary)'
                                : 'var(--ss-success)',
                              fontWeight: 800,
                              fontSize: '0.8125rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {u.avatar || 'OP'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-text-primary)' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--ss-radius-full)',
                            backgroundColor: badge.background,
                            color: badge.color,
                            border: `1px solid ${badge.borderColor}`,
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: badge.dotColor,
                            }}
                          />
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>

                      {/* Facility */}
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                        {u.facility || 'All Facilities'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--ss-radius-full)',
                            backgroundColor: isPending
                              ? 'rgba(245, 158, 11, 0.15)'
                              : isSuspended
                              ? 'rgba(239, 68, 68, 0.12)'
                              : 'rgba(16, 185, 129, 0.12)',
                            color: isPending
                              ? 'var(--ss-warning-text)'
                              : isSuspended
                              ? 'var(--ss-danger)'
                              : 'var(--ss-success)',
                            border: isPending
                              ? '1px solid rgba(245, 158, 11, 0.3)'
                              : isSuspended
                              ? '1px solid rgba(239, 68, 68, 0.25)'
                              : '1px solid rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          {isPending ? 'PENDING APPROVAL' : u.status}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                        {u.lastActive || 'Today'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '230px', minWidth: '230px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => handleOpenApproveModal(u)}
                              className="ss-btn ss-btn-primary"
                              style={{
                                width: '162px',
                                height: '28px',
                                fontSize: '0.6875rem',
                                padding: '0 0.5rem',
                                backgroundColor: 'var(--ss-success)',
                                borderColor: 'var(--ss-success)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              ✓ Authorize & Approve
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedUser(u)}
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
                                title="View details"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditModalUser(u)}
                                className="ss-btn ss-btn-secondary"
                                style={{
                                  minWidth: '42px',
                                  height: '28px',
                                  fontSize: '0.6875rem',
                                  padding: '0 0.4rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                                title="Edit Role & Facility"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateUserStatus(u.id, isSuspended ? 'ACTIVE' : 'SUSPENDED')
                                }
                                className="ss-btn ss-btn-ghost"
                                style={{
                                  minWidth: '66px',
                                  height: '28px',
                                  fontSize: '0.6875rem',
                                  padding: '0 0.35rem',
                                  color: isSuspended ? 'var(--ss-success)' : 'var(--ss-warning-text)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                                title={isSuspended ? 'Reactivate access' : 'Suspend account'}
                              >
                                {isSuspended ? 'Activate' : 'Suspend'}
                              </button>
                            </>
                          )}

                          {u.role !== ROLES.ADMIN ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete user ${u.name}? This will revoke access.`)) {
                                  deleteUser(u.id);
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
                              title="Delete user"
                            >
                              ✕
                            </button>
                          ) : (
                            <div style={{ width: '28px', height: '28px', flexShrink: 0 }} />
                          )}
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
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="users"
        />
      </div>

      {/* MODAL 1: Authorize & Approve Applicant */}
      {approveModalUser && (
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
                <span style={{ fontSize: '1.25rem' }}>🛡️</span>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Authorize User Access
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApproveModalUser(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Approve registration for <strong>{approveModalUser.name}</strong> ({approveModalUser.email}).
              As administrator, designate their panel authorization and assigned operational facility.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.35rem' }}>
                  ASSIGNED CLEARANCE PANEL / ROLE:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setApprovalRole(ROLES.WAREHOUSE_STAFF)}
                    style={{
                      padding: '0.625rem',
                      borderRadius: 'var(--ss-radius-md)',
                      border: approvalRole === ROLES.WAREHOUSE_STAFF ? '2px solid var(--ss-success)' : '1px solid var(--ss-border)',
                      backgroundColor: approvalRole === ROLES.WAREHOUSE_STAFF ? 'rgba(16, 185, 129, 0.08)' : 'var(--ss-bg-app)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
                      Warehouse Staff
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                      Floor execution, scanning, and putaways
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApprovalRole(ROLES.INVENTORY_MANAGER)}
                    style={{
                      padding: '0.625rem',
                      borderRadius: 'var(--ss-radius-md)',
                      border: approvalRole === ROLES.INVENTORY_MANAGER ? '2px solid var(--ss-primary)' : '1px solid var(--ss-border)',
                      backgroundColor: approvalRole === ROLES.INVENTORY_MANAGER ? 'rgba(59, 130, 246, 0.08)' : 'var(--ss-bg-app)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
                      Inventory Manager
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                      Purchasing, approvals, catalog & ledger
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.35rem' }}>
                  ASSIGNED WAREHOUSE FACILITY:
                </label>
                <select
                  value={approvalFacility}
                  onChange={(e) => setApprovalFacility(e.target.value)}
                  className="ss-input"
                  style={{ fontSize: '0.8125rem' }}
                >
                  {(warehouses || []).map((wh) => (
                    <option key={wh.id} value={wh.name}>
                      {wh.name} ({wh.city})
                    </option>
                  ))}
                  <option value="Global Operations Headquarters">Global Operations Headquarters</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setApproveModalUser(null)}
                className="ss-btn ss-btn-secondary"
                style={{ fontSize: '0.8125rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="ss-btn ss-btn-primary"
                style={{ fontSize: '0.8125rem', backgroundColor: 'var(--ss-success)', borderColor: 'var(--ss-success)' }}
              >
                ✓ Grant Panel Clearance & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: User Details */}
      {selectedUser && (
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
              maxWidth: '520px',
              padding: 'var(--ss-space-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: 'var(--ss-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 800,
                  }}
                >
                  {selectedUser.avatar || 'OP'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                    {selectedUser.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>{selectedUser.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.625rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontWeight: 700 }}>ROLE CLEARANCE</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
                  {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                </div>
              </div>
              <div style={{ padding: '0.625rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontWeight: 700 }}>STATUS</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ss-success)', marginTop: '2px' }}>
                  {selectedUser.status}
                </div>
              </div>
              <div style={{ padding: '0.625rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontWeight: 700 }}>FACILITY</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
                  {selectedUser.facility}
                </div>
              </div>
              <div style={{ padding: '0.625rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontWeight: 700 }}>PHONE / TERMINAL</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
                  {selectedUser.phone || 'Internal Extension'}
                </div>
              </div>
            </div>

            {selectedUser.notes && (
              <div style={{ padding: '0.625rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontWeight: 700 }}>NOTES / MEMO</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                  {selectedUser.notes}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="ss-btn ss-btn-secondary"
                style={{ fontSize: '0.8125rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit User Role & Facility */}
      {editModalUser && (
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
                Edit Operator Details
              </h3>
              <button
                type="button"
                onClick={() => setEditModalUser(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  OPERATOR FULL NAME:
                </label>
                <input
                  type="text"
                  value={editModalUser.name}
                  onChange={(e) => setEditModalUser({ ...editModalUser, name: e.target.value })}
                  className="ss-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  EMAIL ADDRESS:
                </label>
                <input
                  type="email"
                  value={editModalUser.email}
                  onChange={(e) => setEditModalUser({ ...editModalUser, email: e.target.value })}
                  className="ss-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  ROLE CLEARANCE:
                </label>
                <select
                  value={editModalUser.role}
                  onChange={(e) => setEditModalUser({ ...editModalUser, role: e.target.value })}
                  className="ss-input"
                >
                  <option value={ROLES.WAREHOUSE_STAFF}>Warehouse Staff (Floor)</option>
                  <option value={ROLES.INVENTORY_MANAGER}>Inventory Manager</option>
                  <option value={ROLES.ADMIN}>System Administrator</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  ASSIGNED FACILITY:
                </label>
                <select
                  value={editModalUser.facility}
                  onChange={(e) => setEditModalUser({ ...editModalUser, facility: e.target.value })}
                  className="ss-input"
                >
                  {(warehouses || []).map((wh) => (
                    <option key={wh.id} value={wh.name}>
                      {wh.name}
                    </option>
                  ))}
                  <option value="Global Operations Headquarters">Global Operations Headquarters</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
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

      {/* MODAL 4: Invite / Add New Operator */}
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
                <span style={{ fontSize: '1.25rem' }}>➕</span>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Invite / Add Operator
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

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  FULL NAME:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Cole"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="ss-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  EMAIL ADDRESS:
                </label>
                <input
                  type="email"
                  placeholder="e.g. jordan.cole@stocksense.io"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="ss-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    ROLE:
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="ss-input"
                  >
                    <option value={ROLES.WAREHOUSE_STAFF}>Warehouse Staff</option>
                    <option value={ROLES.INVENTORY_MANAGER}>Inventory Manager</option>
                    <option value={ROLES.ADMIN}>Administrator</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                    INITIAL STATUS:
                  </label>
                  <select
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })}
                    className="ss-input"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING_APPROVAL">Pending Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  ASSIGNED FACILITY:
                </label>
                <select
                  value={newUserForm.facility}
                  onChange={(e) => setNewUserForm({ ...newUserForm, facility: e.target.value })}
                  className="ss-input"
                >
                  {(warehouses || []).map((wh) => (
                    <option key={wh.id} value={wh.name}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  PHONE (OPTIONAL):
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="ss-input"
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
                  Save & Authorize Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
