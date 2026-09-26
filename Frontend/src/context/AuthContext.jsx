import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, ROLE_LABELS } from '../constants/roles';
import { ROLE_PERMISSIONS, checkPermission } from '../constants/permissions';

// Pre-configured mock operators for instant demo switching
export const DEMO_OPERATORS = [
  {
    id: 'op-01',
    name: 'Sarah Chen',
    email: 'sarah.manager@stocksense.io',
    role: ROLES.INVENTORY_MANAGER,
    title: 'Operations & Inventory Lead',
    facility: 'WH-01 Main DC (San Francisco)',
    avatar: 'SC',
    shiftStatus: 'Active Shift',
  },
  {
    id: 'op-02',
    name: 'Alex Rivera',
    email: 'alex.operator@stocksense.io',
    role: ROLES.WAREHOUSE_STAFF,
    title: 'Lead Receiving & Putaway Specialist',
    facility: 'WH-01 Main DC (San Francisco)',
    avatar: 'AR',
    shiftStatus: 'Active Shift',
  },
  {
    id: 'op-03',
    name: 'Marcus Vance',
    email: 'marcus.admin@stocksense.io',
    role: ROLES.ADMIN,
    title: 'Warehouse Systems Administrator',
    facility: 'Global Operations Headquarters',
    avatar: 'MV',
    shiftStatus: 'Admin Session',
  },
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Default to INVENTORY_MANAGER for rich demo readiness
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('stocksense_operator');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEMO_OPERATORS[0];
  });

  const [activeWarehouse, setActiveWarehouse] = useState({
    id: 'wh-01',
    code: 'WH-01',
    name: 'Main Distribution Center (Bay Area)',
    status: 'ONLINE',
  });

  // Keep localStorage in sync
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('stocksense_operator', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Dynamic permissions for current user's role
  const permissions = currentUser?.role ? ROLE_PERMISSIONS[currentUser.role] || [] : [];

  /**
   * BACKEND PLACEHOLDER:
   * When Python backend is ready, this function maps the server JWT/session
   * response to the frontend user model.
   *
   * Expected Backend Shape:
   * {
   *   id: string,
   *   email: string,
   *   first_name: string,
   *   last_name: string,
   *   role: 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF' | 'ADMIN',
   *   token: string
   * }
   */
  const mapBackendUserToSession = (backendResponse) => {
    return {
      id: backendResponse.id,
      name: `${backendResponse.first_name} ${backendResponse.last_name}`,
      email: backendResponse.email,
      role: backendResponse.role,
      title: ROLE_LABELS[backendResponse.role] || 'Staff Member',
      facility: activeWarehouse.name,
      avatar: (backendResponse.first_name?.[0] || 'U') + (backendResponse.last_name?.[0] || ''),
      token: backendResponse.token,
    };
  };

  // Permission verification helper
  const can = (permission) => {
    if (!currentUser?.role) return false;
    return checkPermission(currentUser.role, permission);
  };

  // Role verification helper (accepts single role string or array of roles)
  const hasRole = (targetRoles) => {
    if (!currentUser?.role) return false;
    if (Array.isArray(targetRoles)) {
      return targetRoles.includes(currentUser.role);
    }
    return currentUser.role === targetRoles;
  };

  // 1-Click Role Switcher for instant judge evaluation
  const switchRole = (newRole) => {
    const matched = DEMO_OPERATORS.find((op) => op.role === newRole);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser((prev) => ({
        ...prev,
        role: newRole,
        title: ROLE_LABELS[newRole] || 'Operator',
      }));
    }
  };

  const login = async (email, password) => {
    // If mock credentials or offline:
    const matched = DEMO_OPERATORS.find((op) => op.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      return { success: true, user: matched };
    }
    // Fallback default
    const fallbackUser = {
      ...DEMO_OPERATORS[0],
      email,
    };
    setCurrentUser(fallbackUser);
    return { success: true, user: fallbackUser };
  };

  const logout = () => {
    localStorage.removeItem('stocksense_operator');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        permissions,
        can,
        hasRole,
        switchRole,
        login,
        logout,
        activeWarehouse,
        setActiveWarehouse,
        demoOperators: DEMO_OPERATORS,
        mapBackendUserToSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
