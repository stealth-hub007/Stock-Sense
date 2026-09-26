import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const AdminSettingsPage = ({ onResetData }) => {
  const { adminSettings, updateAdminSettings } = useInventory();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [form, setForm] = useState({
    systemName: adminSettings?.systemName || 'StockSense Cloud WMS Engine',
    version: adminSettings?.version || 'v2.4-enterprise',
    maintenanceMode: adminSettings?.maintenanceMode || false,
    requireApprovalForNewUsers: adminSettings?.requireApprovalForNewUsers ?? true,
    discrepancyApprovalThreshold: adminSettings?.discrepancyApprovalThreshold || 5,
    sessionInactivityTimeoutMins: adminSettings?.sessionInactivityTimeoutMins || 30,
    automaticLedgerSync: adminSettings?.automaticLedgerSync ?? true,
    enforceDoubleEntryAccounting: adminSettings?.enforceDoubleEntryAccounting ?? true,
    supportEmail: adminSettings?.supportEmail || 'ops.admin@stocksense.io',
  });

  const handleToggle = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateAdminSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1000px', margin: '0 auto' }}>
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
            System Administration Settings
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
            Core Governance
          </span>
        </div>
        <p
          style={{
            fontSize: 'var(--ss-text-sm)',
            color: 'var(--ss-text-secondary)',
            marginTop: '0.25rem',
          }}
        >
          Configure user registration gatekeeping, discrepancy variance limits, session policies, and system maintenance.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--ss-radius-md)',
            color: 'var(--ss-success)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: 'var(--ss-space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>✓</span>
          <span>Configuration parameters updated and broadcast to all warehouse terminals.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ss-space-6)' }}>
        {/* Section 1: User Registration & Access Gatekeeping */}
        <div
          style={{
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            padding: 'var(--ss-space-5)',
            boxShadow: 'var(--ss-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🛡️</span>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
              Registration & Panel Gatekeeping
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginBottom: '1rem' }}>
            Controls what happens when new users register through the login portal.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Approval Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: 'var(--ss-bg-app)',
                borderRadius: 'var(--ss-radius-md)',
                border: '1px solid var(--ss-border)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
                  Require Administrator Approval for New Portal Signups
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                  When enabled, all newly registered accounts enter "Pending Review" status until an Admin authorizes their role and facility clearance.
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.requireApprovalForNewUsers}
                onChange={() => handleToggle('requireApprovalForNewUsers')}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--ss-primary)' }}
              />
            </div>

            {/* Inactivity Timeout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  SESSION INACTIVITY TIMEOUT:
                </label>
                <select
                  value={form.sessionInactivityTimeoutMins}
                  onChange={(e) => setForm({ ...form, sessionInactivityTimeoutMins: Number(e.target.value) })}
                  className="ss-input"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={60}>60 Minutes</option>
                  <option value={120}>2 Hours</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                  ADMIN NOTIFICATION EMAIL:
                </label>
                <input
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  className="ss-input"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Inventory & Ledger Operational Controls */}
        <div
          style={{
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            padding: 'var(--ss-space-5)',
            boxShadow: 'var(--ss-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⚖️</span>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
              Operational Thresholds & Ledger Rules
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginBottom: '1rem' }}>
            Discrepancy validation parameters and double-entry balanced accounting enforcement.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.25rem' }}>
                DISCREPANCY VARIANCE APPROVAL THRESHOLD (UNITS):
              </label>
              <input
                type="number"
                value={form.discrepancyApprovalThreshold}
                onChange={(e) => setForm({ ...form, discrepancyApprovalThreshold: Number(e.target.value) })}
                className="ss-input"
                style={{ maxWidth: '280px' }}
                min="1"
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', display: 'block', marginTop: '4px' }}>
                Physical cycle count deltas exceeding this unit value require formal Manager sign-off before reconciling the ledger.
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: 'var(--ss-bg-app)',
                borderRadius: 'var(--ss-radius-md)',
                border: '1px solid var(--ss-border)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
                  Enforce Double-Entry Ledger Validation
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                  Every physical transfer, receipt, and delivery strictly produces an immutable debit/credit balanced transaction.
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.enforceDoubleEntryAccounting}
                onChange={() => handleToggle('enforceDoubleEntryAccounting')}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--ss-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Maintenance & Emergency Mode */}
        <div
          style={{
            backgroundColor: 'var(--ss-bg-surface)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            padding: 'var(--ss-space-5)',
            boxShadow: 'var(--ss-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🔧</span>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
              System Maintenance Mode
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginBottom: '1rem' }}>
            Temporarily pause inbound and outbound operations during physical inventory wall-to-wall counts.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem',
              backgroundColor: form.maintenanceMode ? 'rgba(239, 68, 68, 0.08)' : 'var(--ss-bg-app)',
              borderRadius: 'var(--ss-radius-md)',
              border: form.maintenanceMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--ss-border)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: form.maintenanceMode ? 'var(--ss-danger)' : 'var(--ss-text-primary)' }}>
                {form.maintenanceMode ? '⚠️ System Under Maintenance Mode' : 'Operational (Normal Run State)'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                When activated, floor execution terminals are locked to read-only mode to prevent movement discrepancies during audit.
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={() => handleToggle('maintenanceMode')}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--ss-danger)' }}
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 'var(--ss-space-2)' }}>
          <button
            type="submit"
            className="ss-btn ss-btn-primary"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
