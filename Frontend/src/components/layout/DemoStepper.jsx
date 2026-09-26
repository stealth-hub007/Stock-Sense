import React from 'react';

export const DemoStepper = ({ currentStep = 1, onStepClick }) => {
  const steps = [
    { number: 1, label: 'Receive Stock', effect: '+ Stock Increase', tab: 'receipts' },
    { number: 2, label: 'Internal Transfer', effect: '⇄ Location Shift', tab: 'transfers' },
    { number: 3, label: 'Delivery Dispatch', effect: '- Stock Decrease', tab: 'deliveries' },
    { number: 4, label: 'Cycle Adjustment', effect: 'Δ Reconcile Variance', tab: 'adjustments' },
    { number: 5, label: 'Stock Ledger', effect: '🛡️ Audit Trail Proof', tab: 'ledger' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #111827 0%, #162032 100%)',
        borderBottom: '1px solid var(--ss-border)',
        padding: '0.625rem var(--ss-space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: 'var(--ss-primary)',
            background: 'var(--ss-primary-subtle)',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--ss-radius-sm)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Demo Journey
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
          Every operation triggers an immediate, verifiable ledger consequence:
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
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--ss-radius-sm)',
                  border: isCurrent ? '1px solid var(--ss-primary)' : '1px solid var(--ss-border)',
                  background: isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'var(--ss-bg-app)',
                  color: isCurrent ? 'var(--ss-text-primary)' : 'var(--ss-text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--ss-primary)' : 'var(--ss-bg-surface-elevated)',
                    color: isCurrent ? '#ffffff' : 'var(--ss-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                  }}
                >
                  {step.number}
                </span>
                <span>{step.label}</span>
                <span style={{ color: isCurrent ? 'var(--ss-primary)' : 'var(--ss-text-disabled)', fontSize: '0.6875rem' }}>
                  ({step.effect})
                </span>
              </button>

              {index < steps.length - 1 && (
                <span style={{ color: 'var(--ss-text-disabled)', fontSize: '0.75rem' }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DemoStepper;
