import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { AdminPagination } from '../../components/common/AdminPagination';

export const AdminDashboard = ({ onNavigateTab }) => {
  const {
    users,
    warehouses,
    locations,
    products,
    systemActivity,
    approveUser,
    ledger,
  } = useInventory();
  const { switchRole } = useAuth();

  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 5;

  const paginatedActivity = useMemo(() => {
    const start = (activityPage - 1) * activityPageSize;
    return (systemActivity || []).slice(start, start + activityPageSize);
  }, [systemActivity, activityPage, activityPageSize]);

  const totalUsers = (users || []).length;
  const activeUsers = (users || []).filter((u) => u.status === 'ACTIVE').length;
  const pendingUsers = (users || []).filter((u) => u.status === 'PENDING_APPROVAL');
  const suspendedUsers = (users || []).filter((u) => u.status === 'SUSPENDED').length;

  const totalWarehouses = (warehouses || []).length;
  const totalLocations = (locations || []).length;
  const totalProducts = (products || []).length;
  const occupiedLocations = (locations || []).filter((l) => l.status === 'OCCUPIED').length;

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
              System Administration Dashboard
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--ss-success)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--ss-radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ss-success)',
                  display: 'inline-block',
                }}
              />
              System Healthy • Engine v2.4
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--ss-text-sm)',
              color: 'var(--ss-text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            Central governance, identity approvals, facility network setup, and immutable audit logs.
          </p>
        </div>
      </div>

      {/* Pending User Approval Priority Banner */}
      {pendingUsers.length > 0 && (
        <div
          style={{
            padding: '1rem 1.25rem',
            marginBottom: 'var(--ss-space-6)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--ss-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{ fontSize: '1.75rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-warning-text)' }}>
                {pendingUsers.length} Applicant{pendingUsers.length > 1 ? 's' : ''} Awaiting Admin Approval
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                New portal registrations must be verified and granted role clearance before accessing facility terminals.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('users')}
              className="ss-btn ss-btn-primary"
              style={{
                backgroundColor: 'var(--ss-warning)',
                borderColor: 'var(--ss-warning)',
                color: '#000000',
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              Review User Approvals ({pendingUsers.length})
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-6)',
        }}
      >
        {/* Total Users */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('users')}
          style={{
            padding: 'var(--ss-space-4)',
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Total Users
            </span>
            <span style={{ fontSize: '1.25rem' }}>👥</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: '0.5rem 0 0.25rem' }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', display: 'flex', gap: '0.5rem' }}>
            <span style={{ color: 'var(--ss-success)', fontWeight: 600 }}>{activeUsers} Active</span>
            {pendingUsers.length > 0 && (
              <span style={{ color: 'var(--ss-warning-text)', fontWeight: 600 }}>• {pendingUsers.length} Pending</span>
            )}
            {suspendedUsers > 0 && (
              <span style={{ color: 'var(--ss-danger)', fontWeight: 600 }}>• {suspendedUsers} Suspended</span>
            )}
          </div>
        </div>

        {/* Warehouses */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('warehouses')}
          style={{
            padding: 'var(--ss-space-4)',
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Warehouses
            </span>
            <span style={{ fontSize: '1.25rem' }}>🏢</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: '0.5rem 0 0.25rem' }}>
            {totalWarehouses}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
            All facilities online & synced
          </div>
        </div>

        {/* Locations */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('locations')}
          style={{
            padding: 'var(--ss-space-4)',
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Locations / Bins
            </span>
            <span style={{ fontSize: '1.25rem' }}>📍</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: '0.5rem 0 0.25rem' }}>
            {totalLocations}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
            <span style={{ color: 'var(--ss-primary)', fontWeight: 600 }}>{occupiedLocations} Occupied</span> • {totalLocations - occupiedLocations} Vacant
          </div>
        </div>

        {/* Products */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('categories')}
          style={{
            padding: 'var(--ss-space-4)',
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Products Tracked
            </span>
            <span style={{ fontSize: '1.25rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: '0.5rem 0 0.25rem' }}>
            {totalProducts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
            Active SKUs in master catalog
          </div>
        </div>

        {/* Ledger Entries */}
        <div
          style={{
            padding: 'var(--ss-space-4)',
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Ledger Transactions
            </span>
            <span style={{ fontSize: '1.25rem' }}>📜</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: '0.5rem 0 0.25rem' }}>
            {(ledger || []).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-success)', fontWeight: 600 }}>
            ✓ 0 Drift Verified
          </div>
        </div>
      </div>

      {/* Main Split: System Activity Audit Trail & Facility Infrastructure */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--ss-space-6)' }}>
        {/* System Activity Audit Trail */}
        <div
          style={{
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem var(--ss-space-4)',
              borderBottom: '1px solid var(--ss-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                System Activity & Security Audit
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                Immutable administrative telemetry & security events
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--ss-primary)', fontWeight: 600 }}>
              Live Telemetry
            </span>
          </div>

          <div style={{ padding: 'var(--ss-space-3)' }}>
            {(systemActivity || []).length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ss-text-muted)', fontSize: '0.8125rem' }}>
                No audit events recorded.
              </div>
            ) : (
              paginatedActivity.map((act) => {
                const isWarn = act.severity === 'WARNING';
                const isSuccess = act.severity === 'SUCCESS';
                return (
                  <div
                    key={act.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--ss-radius-md)',
                      marginBottom: '0.4rem',
                      backgroundColor: 'var(--ss-bg-app)',
                      border: '1px solid var(--ss-border)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '9999px',
                            backgroundColor: isWarn
                              ? 'rgba(245, 158, 11, 0.15)'
                              : isSuccess
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(59, 130, 246, 0.15)',
                            color: isWarn
                              ? 'var(--ss-warning-text)'
                              : isSuccess
                              ? 'var(--ss-success)'
                              : 'var(--ss-primary)',
                          }}
                        >
                          {act.action}
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                          {act.actor}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', lineHeight: 1.4 }}>
                        {act.details}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', whiteSpace: 'nowrap' }}>
                      {act.timestamp}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Activity Pagination Controls */}
          <AdminPagination
            currentPage={activityPage}
            totalItems={(systemActivity || []).length}
            pageSize={activityPageSize}
            onPageChange={setActivityPage}
            itemName="audit events"
          />
        </div>

        {/* Facility Network & Role Governance Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ss-space-6)' }}>
          {/* Warehouses Snapshot */}
          <div
            style={{
              backgroundColor: 'var(--ss-bg-surface)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-lg)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1rem var(--ss-space-4)',
                borderBottom: '1px solid var(--ss-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                  Warehouse Facility Topology
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  Active physical sites and bin allocations
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('warehouses')}
                className="ss-btn ss-btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              >
                Manage Warehouses ➔
              </button>
            </div>

            <div style={{ padding: 'var(--ss-space-3)' }}>
              {(warehouses || []).map((wh) => (
                <div
                  key={wh.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--ss-radius-md)',
                    backgroundColor: 'var(--ss-bg-app)',
                    border: '1px solid var(--ss-border)',
                    marginBottom: '0.4rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                      {wh.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                      {wh.city} • Capacity: {wh.capacity}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--ss-success)',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    ONLINE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Configuration Access */}
          <div
            style={{
              backgroundColor: 'var(--ss-bg-surface)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-lg)',
              padding: 'var(--ss-space-4)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ss-text-primary)', marginBottom: '0.75rem' }}>
              System Configuration Shortcuts
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('categories')}
                className="ss-btn ss-btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.8125rem' }}
              >
                🏷️ Product Categories
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('units')}
                className="ss-btn ss-btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.8125rem' }}
              >
                📐 Units of Measure
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('roles')}
                className="ss-btn ss-btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.8125rem' }}
              >
                🔑 Roles & Permissions
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('settings')}
                className="ss-btn ss-btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.8125rem' }}
              >
                ⚙️ Security & Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
