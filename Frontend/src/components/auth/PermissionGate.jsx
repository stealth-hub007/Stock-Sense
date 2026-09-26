import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * PermissionGate
 * Granular control over UI elements (Buttons, Actions, Columns, Tabs)
 *
 * Usage:
 * <PermissionGate permission={PERMISSIONS.PRODUCTS_CREATE}>
 *   <button className="ss-btn ss-btn-primary">+ Add Product</button>
 * </PermissionGate>
 */
export const PermissionGate = ({
  permission,
  role,
  fallback = null,
  children,
}) => {
  const { can, hasRole } = useAuth();

  // If specific permission required
  if (permission && !can(permission)) {
    return fallback;
  }

  // If specific role(s) required
  if (role && !hasRole(role)) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGate;
