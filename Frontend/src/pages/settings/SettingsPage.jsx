import React, { useState } from 'react';
import { INITIAL_SETTINGS } from '../../services/mockData';

export const SettingsPage = ({ onResetData }) => {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [savedToast, setSavedToast] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast('Operational configuration saved successfully.');
    setTimeout(() => setSavedToast(null), 4000);
  };

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Toast */}
      {savedToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            background: 'var(--ss-bg-surface-elevated)',
            border: '1px solid var(--ss-success)',
            borderRadius: 'var(--ss-radius-md)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-text-primary)',
          }}
        >
          <span style={{ color: 'var(--ss-success)', fontSize: '1.25rem' }}>✓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-success)' }}>
              Configuration Saved
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              {savedToast}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 'var(--ss-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--ss-text-primary)', letterSpacing: '-0.025em' }}>
            System Settings & Warehouse Governance
          </h1>
          <span className="ss-badge ss-badge-info">CONFIGURATION</span>
        </div>
        <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
          Operational safety thresholds, ledger audit retention, and facility dock parameters.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ss-space-5)' }}>
        {/* Section 1: Facility Identity */}
        <div className="ss-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginBottom: '0.25rem' }}>
            Facility Profile & Active Node
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '1rem' }}>
            Primary node settings for inventory tracking.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                Warehouse Facility Name
              </label>
              <input
                type="text"
                className="ss-input"
                value={settings.facilityName}
                onChange={(e) => setSettings({ ...settings, facilityName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                Facility Code
              </label>
              <input
                type="text"
                className="ss-input"
                value={settings.facilityCode}
                onChange={(e) => setSettings({ ...settings, facilityCode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Operational Docks & Thresholds */}
        <div className="ss-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginBottom: '0.25rem' }}>
            Dock Allocation & Safety Reorder Thresholds
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '1rem' }}>
            Controls automatic low-stock warnings and default intake bays.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                Default Inbound Dock
              </label>
              <input
                type="text"
                className="ss-input"
                value={settings.defaultReceivingBay}
                onChange={(e) => setSettings({ ...settings, defaultReceivingBay: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                Default Outbound Dispatch Bay
              </label>
              <input
                type="text"
                className="ss-input"
                value={settings.defaultDispatchDock}
                onChange={(e) => setSettings({ ...settings, defaultDispatchDock: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                Low Stock Threshold (%)
              </label>
              <input
                type="number"
                className="ss-input"
                value={settings.lowStockThresholdPct}
                onChange={(e) => setSettings({ ...settings, lowStockThresholdPct: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                Critical Stockout Warning (Units)
              </label>
              <input
                type="number"
                className="ss-input"
                value={settings.criticalThresholdUnits}
                onChange={(e) => setSettings({ ...settings, criticalThresholdUnits: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Double-Entry Ledger Enforcement */}
        <div className="ss-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginBottom: '0.25rem' }}>
            Double-Entry Audit & Ledger Policy
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '1rem' }}>
            StockSense core operational law: every quantity or location shift must generate a signed ledger record.
          </p>

          <div style={{ padding: '0.875rem', background: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)', border: '1px solid var(--ss-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ color: 'var(--ss-text-primary)', fontSize: '0.8125rem' }}>Strict Ledger Immutability</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                  Prevents arbitrary database overwrites. Numbers only change through discrete signed operations.
                </div>
              </div>
              <span className="ss-badge ss-badge-success">ACTIVE & ENFORCED</span>
            </div>
          </div>
        </div>

        {/* Section 4: Demo State Management */}
        <div className="ss-card" style={{ borderColor: 'var(--ss-primary-border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginBottom: '0.25rem' }}>
            Hackathon Demo State Control
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '1rem' }}>
            Reset all modified stocks, queues, and ledger entries back to pristine baseline for new evaluation runs.
          </p>

          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={onResetData}
            style={{ fontSize: '0.8125rem' }}
          >
            ↺ Reset Demo Data to Initial Baseline
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="submit" className="ss-btn ss-btn-primary">
            Save Operational Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
