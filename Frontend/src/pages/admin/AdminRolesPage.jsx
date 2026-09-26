import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_STYLES } from '../../constants/roles';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../../constants/permissions';

export const AdminRolesPage = () => {
  const { users } = useInventory();
  const [selectedRole, setSelectedRole] = useState(ROLES.INVENTORY_MANAGER);

  const managerCount = (users || []).filter((u) => u.role === ROLES.INVENTORY_MANAGER).length;
  const staffCount = (users || []).filter((u) => u.role === ROLES.WAREHOUSE_STAFF).length;
  const adminCount = (users || []).filter((u) => u.role === ROLES.ADMIN).length;

  const permissionCategories = [
    {
      category: 'Dashboard & Intelligence',
      items: [
        { key: PERMISSIONS.DASHBOARD_VIEW_STRATEGIC, name: 'Strategic KPI & Financial Valuation', desc: 'Total inventory worth, profit margins, turnover metrics' },
        { key: PERMISSIONS.DASHBOARD_VIEW_OPERATIONAL, name: 'Operational Floor Activity', desc: 'Pending receipts, picks, shipments, urgent alerts' },
      ],
    },
    {
      category: 'Products & Master Catalog',
      items: [
        { key: PERMISSIONS.PRODUCTS_VIEW, name: 'View Product Catalog', desc: 'Browse catalog, view stock counts and bin locations' },
        { key: PERMISSIONS.PRODUCTS_CREATE, name: 'Create SKU Records', desc: 'Add new items, configure initial barcodes and suppliers' },
        { key: PERMISSIONS.PRODUCTS_EDIT, name: 'Edit SKU Parameters', desc: 'Change cost prices, min safety thresholds, descriptions' },
        { key: PERMISSIONS.PRODUCTS_DELETE, name: 'Archive / Delete SKUs', desc: 'Decommission active product master records' },
      ],
    },
    {
      category: 'Inbound Receiving',
      items: [
        { key: PERMISSIONS.RECEIPTS_VIEW, name: 'View Inbound Receipts', desc: 'Inspect vendor PO delivery schedules' },
        { key: PERMISSIONS.RECEIPTS_CREATE, name: 'Create Receiving Sessions', desc: 'Register newly arrived vendor shipments at dock' },
        { key: PERMISSIONS.RECEIPTS_CONFIRM, name: 'Confirm Inbound Receipts', desc: 'Finalize putaway and increment ledger balances' },
      ],
    },
    {
      category: 'Outbound Deliveries & Picking',
      items: [
        { key: PERMISSIONS.DELIVERIES_VIEW, name: 'View Delivery Orders', desc: 'Browse outbound customer order queues' },
        { key: PERMISSIONS.DELIVERIES_CREATE, name: 'Create Delivery Orders', desc: 'Generate pick waves and customer fulfillment orders' },
        { key: PERMISSIONS.DELIVERIES_DISPATCH, name: 'Final Dispatch Confirmation', desc: 'Sign off outbound shipment and deduct inventory' },
      ],
    },
    {
      category: 'Internal Transfers',
      items: [
        { key: PERMISSIONS.TRANSFERS_VIEW, name: 'View Relocation Orders', desc: 'Browse bin-to-bin and dock-to-shelf movements' },
        { key: PERMISSIONS.TRANSFERS_CREATE, name: 'Create Relocation Transfer', desc: 'Schedule stock transfers between racks and zones' },
        { key: PERMISSIONS.TRANSFERS_EXECUTE, name: 'Execute Floor Transfer', desc: 'Confirm physical bin transfer completion' },
      ],
    },
    {
      category: 'Stock Discrepancies & Adjustments',
      items: [
        { key: PERMISSIONS.ADJUSTMENTS_VIEW, name: 'View Discrepancy Audits', desc: 'Inspect variance logs and cycle count histories' },
        { key: PERMISSIONS.ADJUSTMENTS_CREATE, name: 'Submit Floor Count Discrepancy', desc: 'Log physical cycle count variance for review' },
        { key: PERMISSIONS.ADJUSTMENTS_APPROVE, name: 'Authorize Financial Variance', desc: 'Manager sign-off to reconcile ledger on discrepancies' },
      ],
    },
    {
      category: 'Stock Ledger (Audit Trail)',
      items: [
        { key: PERMISSIONS.LEDGER_VIEW, name: 'View Immutable Ledger', desc: 'Read double-entry balanced transaction ledger' },
        { key: PERMISSIONS.LEDGER_EXPORT, name: 'Export Ledger Audit Bundle', desc: 'Download CSV / audit package for external compliance' },
      ],
    },
    {
      category: 'Warehouse Facility Network',
      items: [
        { key: PERMISSIONS.WAREHOUSE_VIEW, name: 'View Facility Topology', desc: 'Check warehouse zones, aisles, and bin occupancies' },
        { key: PERMISSIONS.WAREHOUSE_MANAGE, name: 'Configure Facility & Bins', desc: 'Create zones, edit rack capacities and warehouse metadata' },
      ],
    },
    {
      category: 'Governance & Administration',
      items: [
        { key: PERMISSIONS.USERS_VIEW, name: 'View Operators Directory', desc: 'List active and pending system operators' },
        { key: PERMISSIONS.USERS_MANAGE, name: 'Manage User Authorization', desc: 'Approve applicants, assign roles, revoke credentials' },
        { key: PERMISSIONS.SETTINGS_VIEW, name: 'View System Settings', desc: 'Inspect system safety thresholds and network settings' },
        { key: PERMISSIONS.SETTINGS_MANAGE, name: 'Modify System Parameters', desc: 'Edit global thresholds, maintenance mode, and reset data' },
      ],
    },
  ];

  const hasPerm = (role, permKey) => {
    return (ROLE_PERMISSIONS[role] || []).includes(permKey);
  };

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: 'var(--ss-space-6)' }}>
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
            Role Definitions & Permission Matrix
          </h1>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: 'var(--ss-warning-text)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--ss-radius-full)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
            }}
          >
            RBAC Architecture (3 Standard Roles)
          </span>
        </div>
        <p
          style={{
            fontSize: 'var(--ss-text-sm)',
            color: 'var(--ss-text-secondary)',
            marginTop: '0.25rem',
          }}
        >
          View backend permission assignments across Inventory Manager, Warehouse Staff, and Administrator profiles.
        </p>
      </div>

      {/* 3 Role Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-6)',
        }}
      >
        {/* Inventory Manager Card */}
        <div
          onClick={() => setSelectedRole(ROLES.INVENTORY_MANAGER)}
          style={{
            padding: 'var(--ss-space-5)',
            backgroundColor: 'var(--ss-bg-surface)',
            border: selectedRole === ROLES.INVENTORY_MANAGER ? '2px solid var(--ss-primary)' : '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            cursor: 'pointer',
            boxShadow: selectedRole === ROLES.INVENTORY_MANAGER ? '0 0 0 1px var(--ss-primary)' : 'var(--ss-shadow-sm)',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--ss-primary)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--ss-radius-full)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              INVENTORY MANAGER
            </span>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: '0 0 0.5rem 0' }}>
            Operations & Catalog Lead
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
            Authority over procurement, ledger verification, master SKU catalogs, pricing, and financial discrepancy approvals.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ss-border)' }}>
            <span style={{ color: 'var(--ss-text-muted)' }}>Assigned Operators:</span>
            <span style={{ fontWeight: 700, color: 'var(--ss-text-primary)' }}>{managerCount} Users</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--ss-text-muted)' }}>Permissions Enabled:</span>
            <span style={{ fontWeight: 700, color: 'var(--ss-primary)' }}>{ROLE_PERMISSIONS[ROLES.INVENTORY_MANAGER].length} of {Object.keys(PERMISSIONS).length}</span>
          </div>
        </div>

        {/* Warehouse Staff Card */}
        <div
          onClick={() => setSelectedRole(ROLES.WAREHOUSE_STAFF)}
          style={{
            padding: 'var(--ss-space-5)',
            backgroundColor: 'var(--ss-bg-surface)',
            border: selectedRole === ROLES.WAREHOUSE_STAFF ? '2px solid var(--ss-success)' : '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            cursor: 'pointer',
            boxShadow: selectedRole === ROLES.WAREHOUSE_STAFF ? '0 0 0 1px var(--ss-success)' : 'var(--ss-shadow-sm)',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--ss-success)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--ss-radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              WAREHOUSE STAFF
            </span>
            <span style={{ fontSize: '1.25rem' }}>📦</span>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: '0 0 0.5rem 0' }}>
            Floor Execution Operator
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
            High-speed floor execution: inbound receiving scans, order picking, staging, bin transfers, and counting without financial rights.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ss-border)' }}>
            <span style={{ color: 'var(--ss-text-muted)' }}>Assigned Operators:</span>
            <span style={{ fontWeight: 700, color: 'var(--ss-text-primary)' }}>{staffCount} Users</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--ss-text-muted)' }}>Permissions Enabled:</span>
            <span style={{ fontWeight: 700, color: 'var(--ss-success)' }}>{ROLE_PERMISSIONS[ROLES.WAREHOUSE_STAFF].length} of {Object.keys(PERMISSIONS).length}</span>
          </div>
        </div>

        {/* Administrator Card */}
        <div
          onClick={() => setSelectedRole(ROLES.ADMIN)}
          style={{
            padding: 'var(--ss-space-5)',
            backgroundColor: 'var(--ss-bg-surface)',
            border: selectedRole === ROLES.ADMIN ? '2px solid var(--ss-warning)' : '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            cursor: 'pointer',
            boxShadow: selectedRole === ROLES.ADMIN ? '0 0 0 1px var(--ss-warning)' : 'var(--ss-shadow-sm)',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--ss-warning-text)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--ss-radius-full)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              ADMINISTRATOR
            </span>
            <span style={{ fontSize: '1.25rem' }}>🛡️</span>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: '0 0 0.5rem 0' }}>
            System Administrator
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
            Full system governance: approve new user registrations, allocate facility topology, configure UOMs, categories, and settings.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ss-border)' }}>
            <span style={{ color: 'var(--ss-text-muted)' }}>Assigned Operators:</span>
            <span style={{ fontWeight: 700, color: 'var(--ss-text-primary)' }}>{adminCount} Users</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--ss-text-muted)' }}>Permissions Enabled:</span>
            <span style={{ fontWeight: 700, color: 'var(--ss-warning-text)' }}>All {Object.keys(PERMISSIONS).length} (Full Access)</span>
          </div>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div
        style={{
          backgroundColor: 'var(--ss-bg-surface)',
          border: '1px solid var(--ss-border)',
          borderRadius: 'var(--ss-radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--ss-shadow-sm)',
        }}
      >
        <div
          style={{
            padding: '1rem var(--ss-space-6)',
            borderBottom: '1px solid var(--ss-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ss-text-primary)' }}>
              Permissions Matrix
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
              Granular backend authorization breakdown by functional scope
            </div>
          </div>
        </div>

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
                <th style={{ padding: '0.75rem 1.25rem' }}>Scope / Permission</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '160px' }}>Manager</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '160px' }}>Staff Floor</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '160px' }}>Admin</th>
              </tr>
            </thead>
            <tbody>
              {permissionCategories.map((group) => (
                <React.Fragment key={group.category}>
                  <tr style={{ backgroundColor: 'var(--ss-bg-app)', borderBottom: '1px solid var(--ss-border)' }}>
                    <td
                      colSpan="4"
                      style={{
                        padding: '0.5rem 1.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--ss-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((perm) => {
                    const managerHas = hasPerm(ROLES.INVENTORY_MANAGER, perm.key);
                    const staffHas = hasPerm(ROLES.WAREHOUSE_STAFF, perm.key);
                    const adminHas = hasPerm(ROLES.ADMIN, perm.key);

                    return (
                      <tr
                        key={perm.key}
                        style={{ borderBottom: '1px solid var(--ss-border)' }}
                      >
                        <td style={{ padding: '0.75rem 1.25rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
                            {perm.name}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                            {perm.desc}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {managerHas ? (
                            <span style={{ color: 'var(--ss-success)', fontWeight: 800, fontSize: '1rem' }}>✓</span>
                          ) : (
                            <span style={{ color: 'var(--ss-text-muted)', fontSize: '0.875rem' }}>✕</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {staffHas ? (
                            <span style={{ color: 'var(--ss-success)', fontWeight: 800, fontSize: '1rem' }}>✓</span>
                          ) : (
                            <span style={{ color: 'var(--ss-text-muted)', fontSize: '0.875rem' }}>✕</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {adminHas ? (
                            <span style={{ color: 'var(--ss-warning-text)', fontWeight: 800, fontSize: '1rem' }}>✓</span>
                          ) : (
                            <span style={{ color: 'var(--ss-text-muted)', fontSize: '0.875rem' }}>✕</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRolesPage;
