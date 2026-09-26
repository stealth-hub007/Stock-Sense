import React from 'react';

export const AdminPagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 5,
  onPageChange,
  itemName = 'entries',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  if (totalItems === 0) return null;

  const startIdx = (safeCurrentPage - 1) * pageSize + 1;
  const endIdx = Math.min(safeCurrentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--ss-border)',
        backgroundColor: 'var(--ss-bg-surface)',
        fontSize: '0.75rem',
        color: 'var(--ss-text-muted)',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <div>
        Showing <strong style={{ color: 'var(--ss-text-primary)' }}>{startIdx}</strong> to{' '}
        <strong style={{ color: 'var(--ss-text-primary)' }}>{endIdx}</strong> of{' '}
        <strong style={{ color: 'var(--ss-text-primary)' }}>{totalItems}</strong> {itemName}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            borderRadius: 'var(--ss-radius-sm)',
            border: '1px solid var(--ss-border)',
            background: 'var(--ss-bg-app)',
            color: safeCurrentPage === 1 ? 'var(--ss-text-muted)' : 'var(--ss-text-primary)',
            cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: safeCurrentPage === 1 ? 0.4 : 1,
          }}
          title="First Page"
        >
          ⇤
        </button>

        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
          disabled={safeCurrentPage === 1}
          style={{
            padding: '0.25rem 0.6rem',
            fontSize: '0.75rem',
            borderRadius: 'var(--ss-radius-sm)',
            border: '1px solid var(--ss-border)',
            background: 'var(--ss-bg-app)',
            color: safeCurrentPage === 1 ? 'var(--ss-text-muted)' : 'var(--ss-text-primary)',
            cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: safeCurrentPage === 1 ? 0.4 : 1,
          }}
          title="Previous Page"
        >
          ← Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
          .map((pageNum, idx, arr) => {
            const prev = arr[idx - 1];
            const hasGap = prev && pageNum - prev > 1;
            const isActive = pageNum === safeCurrentPage;

            return (
              <React.Fragment key={pageNum}>
                {hasGap && <span style={{ padding: '0 0.2rem', color: 'var(--ss-text-muted)' }}>...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  style={{
                    minWidth: '28px',
                    height: '28px',
                    padding: '0 0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 'var(--ss-radius-sm)',
                    border: isActive ? '1px solid var(--ss-primary)' : '1px solid var(--ss-border)',
                    backgroundColor: isActive ? 'var(--ss-primary)' : 'var(--ss-bg-app)',
                    color: isActive ? '#ffffff' : 'var(--ss-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {pageNum}
                </button>
              </React.Fragment>
            );
          })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
          disabled={safeCurrentPage === totalPages}
          style={{
            padding: '0.25rem 0.6rem',
            fontSize: '0.75rem',
            borderRadius: 'var(--ss-radius-sm)',
            border: '1px solid var(--ss-border)',
            background: 'var(--ss-bg-app)',
            color: safeCurrentPage === totalPages ? 'var(--ss-text-muted)' : 'var(--ss-text-primary)',
            cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: safeCurrentPage === totalPages ? 0.4 : 1,
          }}
          title="Next Page"
        >
          Next →
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage === totalPages}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            borderRadius: 'var(--ss-radius-sm)',
            border: '1px solid var(--ss-border)',
            background: 'var(--ss-bg-app)',
            color: safeCurrentPage === totalPages ? 'var(--ss-text-muted)' : 'var(--ss-text-primary)',
            cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: safeCurrentPage === totalPages ? 0.4 : 1,
          }}
          title="Last Page"
        >
          ⇥
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;
