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
    if (!email) return { success: false, error: 'Email is required' };
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check demo operators
    const matched = DEMO_OPERATORS.find((op) => op.email.toLowerCase() === cleanEmail);
    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('stocksense_operator', JSON.stringify(matched));
      return { success: true, user: matched };
    }

    // 2. Check saved registered users in local storage
    try {
      const storedUsers = JSON.parse(localStorage.getItem('stocksense_registered_users') || '[]');
      const registeredMatch = storedUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (registeredMatch) {
        setCurrentUser(registeredMatch);
        localStorage.setItem('stocksense_operator', JSON.stringify(registeredMatch));
        return { success: true, user: registeredMatch };
      }
    } catch (e) {}

    // 3. Fallback: determine role from email or default to WAREHOUSE_STAFF if contains staff/operator
    const inferredRole = cleanEmail.includes('staff') || cleanEmail.includes('operator') || cleanEmail.includes('floor')
      ? ROLES.WAREHOUSE_STAFF
      : cleanEmail.includes('admin')
      ? ROLES.ADMIN
      : ROLES.INVENTORY_MANAGER;

    const fallbackUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0].toUpperCase(),
      role: inferredRole,
      title: ROLE_LABELS[inferredRole] || (inferredRole === ROLES.WAREHOUSE_STAFF ? 'Lead Receiving Specialist' : 'Inventory Manager'),
      facility: activeWarehouse?.name || 'WH-01 Main DC (Bay Area)',
      avatar: cleanEmail.slice(0, 2).toUpperCase(),
      shiftStatus: 'Active Shift',
    };
    setCurrentUser(fallbackUser);
    localStorage.setItem('stocksense_operator', JSON.stringify(fallbackUser));
    return { success: true, user: fallbackUser };
  };

  const register = (userData) => {
    const initials = userData.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'OP';
    const role = userData.role || ROLES.WAREHOUSE_STAFF;
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: userData.name,
      email: userData.email,
      role: role,
      title: ROLE_LABELS[role] || (role === ROLES.WAREHOUSE_STAFF ? 'Lead Receiving & Putaway Specialist' : 'Operations & Inventory Lead'),
      facility: userData.facility || activeWarehouse?.name || 'WH-01 Main DC (San Francisco)',
      avatar: initials,
      shiftStatus: 'Active Shift',
    };

    // Store in registered users directory
    try {
      const stored = JSON.parse(localStorage.getItem('stocksense_registered_users') || '[]');
      stored.push(newUser);
      localStorage.setItem('stocksense_registered_users', JSON.stringify(stored));
    } catch (e) {}

    setCurrentUser(newUser);
    localStorage.setItem('stocksense_operator', JSON.stringify(newUser));
    return { success: true, user: newUser };
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
        loginAs: (targetRole) => switchRole(targetRole),
        login,
        register,
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
