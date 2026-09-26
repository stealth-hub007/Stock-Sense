/**
 * StockSense Core Roles
 * Strictly adhering to backend specifications.
 * Do not invent additional roles.
 */
export const ROLES = {
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  WAREHOUSE_STAFF: 'WAREHOUSE_STAFF',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  [ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
  [ROLES.WAREHOUSE_STAFF]: 'Warehouse Staff',
  [ROLES.ADMIN]: 'System Admin',
};

export const ROLE_BADGE_STYLES = {
  [ROLES.INVENTORY_MANAGER]: {
    label: 'Inventory Manager',
    badgeClass: 'ss-badge-info',
    dotColor: '#22d3ee',
  },
  [ROLES.WAREHOUSE_STAFF]: {
    label: 'Warehouse Staff',
    badgeClass: 'ss-badge-success',
    dotColor: '#34d399',
  },
  [ROLES.ADMIN]: {
    label: 'Admin',
    badgeClass: 'ss-badge-warning',
    dotColor: '#fbbf24',
  },
};
