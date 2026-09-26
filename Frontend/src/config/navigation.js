import { ROLES } from '../constants/roles';
import { PERMISSIONS } from '../constants/permissions';

/**
 * Shared icon identifiers (matched in UI components)
 */
export const NAV_ICONS = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  RECEIPTS: 'receipts',
  TRANSFERS: 'transfers',
  DELIVERIES: 'deliveries',
  ADJUSTMENTS: 'adjustments',
  LEDGER: 'ledger',
  WAREHOUSE: 'warehouse',
  USERS: 'users',
  SETTINGS: 'settings',
};

/**
 * Navigation items definition with required permissions
 */
export const ALL_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: NAV_ICONS.DASHBOARD,
    permission: PERMISSIONS.DASHBOARD_VIEW_OPERATIONAL,
    category: 'OVERVIEW',
  },
  {
    id: 'products',
    label: 'Products Catalog',
    path: '/products',
    icon: NAV_ICONS.PRODUCTS,
    permission: PERMISSIONS.PRODUCTS_VIEW,
    category: 'INVENTORY',
  },
  {
    id: 'receipts',
    label: 'Inbound Receipts',
    path: '/receipts',
    icon: NAV_ICONS.RECEIPTS,
    permission: PERMISSIONS.RECEIPTS_VIEW,
    badge: '+ Inbound',
    category: 'OPERATIONS',
  },
  {
    id: 'transfers',
    label: 'Internal Transfers',
    path: '/transfers',
    icon: NAV_ICONS.TRANSFERS,
    permission: PERMISSIONS.TRANSFERS_VIEW,
    badge: '⇄ Relocate',
    category: 'OPERATIONS',
  },
  {
    id: 'deliveries',
    label: 'Delivery Orders',
    path: '/deliveries',
    icon: NAV_ICONS.DELIVERIES,
    permission: PERMISSIONS.DELIVERIES_VIEW,
    badge: '- Dispatch',
    category: 'OPERATIONS',
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    path: '/adjustments',
    icon: NAV_ICONS.ADJUSTMENTS,
    permission: PERMISSIONS.ADJUSTMENTS_VIEW,
    badge: 'Δ Variance',
    category: 'OPERATIONS',
  },
  {
    id: 'ledger',
    label: 'Stock Ledger',
    path: '/ledger',
    icon: NAV_ICONS.LEDGER,
    permission: PERMISSIONS.LEDGER_VIEW,
    category: 'AUDIT',
  },
  {
    id: 'warehouse',
    label: 'Warehouse Layout',
    path: '/warehouses',
    icon: NAV_ICONS.WAREHOUSE,
    permission: PERMISSIONS.WAREHOUSE_VIEW,
    category: 'FACILITIES',
  },
  {
    id: 'users',
    label: 'User Management',
    path: '/users',
    icon: NAV_ICONS.USERS,
    permission: PERMISSIONS.USERS_VIEW,
    category: 'ADMINISTRATION',
  },
  {
    id: 'settings',
    label: 'System Settings',
    path: '/settings',
    icon: NAV_ICONS.SETTINGS_VIEW,
    category: 'ADMINISTRATION',
  },
];

/**
 * Filter navigation items dynamically based on the user's role and permissions
 */
export const getNavigationForRole = (role, userPermissions = []) => {
  return ALL_NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  });
};
