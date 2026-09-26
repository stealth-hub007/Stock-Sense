import React from 'react';

export const DemoStepper = ({ currentStep = 1, onStepClick }) => {
  const steps = [
    { number: 1, label: 'Receive Stock', effect: '+ Stock Inflow', tab: 'receipts' },
    { number: 2, label: 'Internal Transfer', effect: '⇄ Relocate Bin', tab: 'transfers' },
    { number: 3, label: 'Delivery Dispatch', effect: '- Stock Outflow', tab: 'deliveries' },
    { number: 4, label: 'Cycle Adjustment', effect: 'Δ Floor Recount', tab: 'adjustments' },
    { number: 5, label: 'Stock Ledger', effect: '🛡️ Audit Trail', tab: 'ledger' },
  ];

  return (
    <div
      style={{
        background: 'var(--ss-bg-surface)',
        borderBottom: '1px solid var(--ss-border)',
        padding: '0.625rem var(--ss-space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--ss-shadow-sm)',
        flexShrink: 0,
        zIndex: 45,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: 'var(--ss-primary)',
            background: 'var(--ss-primary-subtle)',
            border: '1px solid var(--ss-primary-border)',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--ss-radius-sm)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Lifecycle Stages
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', fontWeight: 500 }}>
          Live verifiable double-entry inventory pipeline:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {steps.map((step, index) => {
          const isCurrent = currentStep === step.number;
          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(step.tab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.55rem',
                  borderRadius: 'var(--ss-radius-sm)',
                  border: isCurrent ? '1px solid var(--ss-primary)' : '1px solid var(--ss-border)',
                  background: isCurrent ? 'var(--ss-primary-subtle)' : '#ffffff',
                  color: isCurrent ? 'var(--ss-primary)' : 'var(--ss-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  boxShadow: isCurrent ? '0 1px 2px rgba(37, 99, 235, 0.1)' : 'none',
                }}
              >
                {isCurrent && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ss-primary)', display: 'inline-block' }} />
                )}
                <span>{step.label}</span>
                <span style={{ color: isCurrent ? 'var(--ss-primary)' : 'var(--ss-text-muted)', fontSize: '0.6875rem', fontWeight: 600 }}>
                  ({step.effect})
                </span>
              </button>

              {index < steps.length - 1 && (
                <span style={{ color: 'var(--ss-border)', fontSize: '0.75rem', fontWeight: 700 }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DemoStepper;
