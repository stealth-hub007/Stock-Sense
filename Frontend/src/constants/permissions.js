import { ROLES } from './roles';

/**
 * Granular Permissions Architecture
 * Mapped to features, pages, buttons, and operational commands.
 */
export const PERMISSIONS = {
  // Dashboard access
  DASHBOARD_VIEW_STRATEGIC: 'DASHBOARD_VIEW_STRATEGIC',     // Financial valuation, turnover metrics
  DASHBOARD_VIEW_OPERATIONAL: 'DASHBOARD_VIEW_OPERATIONAL', // Today's pending queue, shift tasks

  // Products
  PRODUCTS_VIEW: 'PRODUCTS_VIEW',                           // Browse inventory catalog
  PRODUCTS_CREATE: 'PRODUCTS_CREATE',                       // Add new SKU master record
  PRODUCTS_EDIT: 'PRODUCTS_EDIT',                           // Edit pricing, min thresholds, categories
  PRODUCTS_DELETE: 'PRODUCTS_DELETE',                       // Decommission or archive SKU

  // Inbound Receipts
  RECEIPTS_VIEW: 'RECEIPTS_VIEW',                           // View inbound shipments
  RECEIPTS_CREATE: 'RECEIPTS_CREATE',                       // Create receiving session / PO receipt
  RECEIPTS_CONFIRM: 'RECEIPTS_CONFIRM',                     // Finalize receipt & increment stock

  // Outbound Deliveries
  DELIVERIES_VIEW: 'DELIVERIES_VIEW',                       // View outbound customer orders
  DELIVERIES_CREATE: 'DELIVERIES_CREATE',                   // Create pick list / dispatch order
  DELIVERIES_DISPATCH: 'DELIVERIES_DISPATCH',               // Finalize delivery & decrement stock

  // Internal Transfers
  TRANSFERS_VIEW: 'TRANSFERS_VIEW',                         // View transfer history
  TRANSFERS_CREATE: 'TRANSFERS_CREATE',                     // Create relocation order
  TRANSFERS_EXECUTE: 'TRANSFERS_EXECUTE',                   // Confirm bin shift

  // Adjustments (Cycle counts & write-offs)
  ADJUSTMENTS_VIEW: 'ADJUSTMENTS_VIEW',                     // View variance logs
  ADJUSTMENTS_CREATE: 'ADJUSTMENTS_CREATE',                 // Input physical count / log damaged item
  ADJUSTMENTS_APPROVE: 'ADJUSTMENTS_APPROVE',               // Final financial variance approval

  // Stock Ledger
  LEDGER_VIEW: 'LEDGER_VIEW',                               // Master immutable movement log
  LEDGER_EXPORT: 'LEDGER_EXPORT',                           // Export CSV / Audit bundle

  // Warehouse Facility
  WAREHOUSE_VIEW: 'WAREHOUSE_VIEW',                         // View zones, aisles, bins
  WAREHOUSE_MANAGE: 'WAREHOUSE_MANAGE',                     // Create zones, edit bin capacities

  // User Management
  USERS_VIEW: 'USERS_VIEW',                                 // View staff list
  USERS_MANAGE: 'USERS_MANAGE',                             // Invite, assign roles, revoke access

  // System Settings
  SETTINGS_VIEW: 'SETTINGS_VIEW',                           // View system parameters
  SETTINGS_MANAGE: 'SETTINGS_MANAGE',                       // Edit thresholds, reset demo data
};

/**
 * Role-Permission Default Mappings
 * NOTE: Uncertain backend permissions marked as [NEEDS BACKEND CONFIRMATION].
 */
export const ROLE_PERMISSIONS = {
  // INVENTORY MANAGER
  [ROLES.INVENTORY_MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW_STRATEGIC,
    PERMISSIONS.DASHBOARD_VIEW_OPERATIONAL,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.RECEIPTS_VIEW,
    PERMISSIONS.RECEIPTS_CREATE,
    PERMISSIONS.RECEIPTS_CONFIRM,
    PERMISSIONS.DELIVERIES_VIEW,
    PERMISSIONS.DELIVERIES_CREATE,
    PERMISSIONS.DELIVERIES_DISPATCH,
    PERMISSIONS.TRANSFERS_VIEW,
    PERMISSIONS.TRANSFERS_CREATE,
    PERMISSIONS.TRANSFERS_EXECUTE,
    PERMISSIONS.ADJUSTMENTS_VIEW,
    PERMISSIONS.ADJUSTMENTS_CREATE,
    PERMISSIONS.ADJUSTMENTS_APPROVE,
    PERMISSIONS.LEDGER_VIEW,
    PERMISSIONS.LEDGER_EXPORT,
    PERMISSIONS.WAREHOUSE_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],

  // WAREHOUSE STAFF (High-speed floor execution, restricted from financial/catalog changes)
  [ROLES.WAREHOUSE_STAFF]: [
    PERMISSIONS.DASHBOARD_VIEW_OPERATIONAL,
    PERMISSIONS.PRODUCTS_VIEW, // Read-only for location lookup
    PERMISSIONS.RECEIPTS_VIEW,
    PERMISSIONS.RECEIPTS_CREATE,
    PERMISSIONS.RECEIPTS_CONFIRM,
    PERMISSIONS.DELIVERIES_VIEW,
    PERMISSIONS.DELIVERIES_CREATE,
    PERMISSIONS.DELIVERIES_DISPATCH,
    PERMISSIONS.TRANSFERS_VIEW,
    PERMISSIONS.TRANSFERS_CREATE,
    PERMISSIONS.TRANSFERS_EXECUTE,
    PERMISSIONS.ADJUSTMENTS_VIEW, // View logged counts
    PERMISSIONS.ADJUSTMENTS_CREATE, // Floor cycle count input
    PERMISSIONS.LEDGER_VIEW, // Operational movement audit
    PERMISSIONS.WAREHOUSE_VIEW, // Floor bin reference
  ],

  // ADMIN (Unrestricted governance)
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
};

/**
 * Helper to check if a specific role possesses a permission
 */
export const checkPermission = (role, permission) => {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};
