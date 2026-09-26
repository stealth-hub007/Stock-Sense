import React from 'react';

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50],
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;
    const left = currentPage - delta;
    const right = currentPage + delta;
    let prev = null;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        if (prev !== null && i - prev > 1) pages.push('...');
        pages.push(i);
        prev = i;
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '32px', height: '32px', padding: '0 0.5rem', borderRadius: '6px',
    border: '1px solid var(--ss-border)', background: 'var(--ss-bg-surface)',
    color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 150ms ease', fontFamily: 'var(--ss-font-mono)',
  };

  const activeBtn = {
    ...btnBase, background: 'var(--ss-primary)', borderColor: 'var(--ss-primary)',
    color: '#fff', boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
  };

  const disabledBtn = { ...btnBase, opacity: 0.4, cursor: 'not-allowed' };

  if (totalItems === 0) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '0.75rem', padding: '0.875rem 1.25rem',
      borderTop: '1px solid var(--ss-border)', background: 'var(--ss-bg-app)',
      borderBottomLeftRadius: 'var(--ss-radius-lg)', borderBottomRightRadius: 'var(--ss-radius-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ss-text-muted)' }}>
          Showing <strong style={{ color: 'var(--ss-text-primary)' }}>{startItem}&ndash;{endItem}</strong>
          {' '}of <strong style={{ color: 'var(--ss-text-primary)' }}>{totalItems}</strong> records
        </span>
        {onItemsPerPageChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { onItemsPerPageChange(Number(e.target.value)); onPageChange(1); }}
              style={{
                fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                border: '1px solid var(--ss-border)', background: 'var(--ss-bg-surface)',
                color: 'var(--ss-text-primary)', cursor: 'pointer',
              }}
            >
              {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <button
          type="button" onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1} style={currentPage === 1 ? disabledBtn : btnBase}
          title="Previous page"
        >&#8249;</button>

        {pageNumbers.map((pg, idx) =>
          pg === '...' ? (
            <span key={`e-${idx}`} style={{ ...btnBase, border: 'none', background: 'transparent', cursor: 'default', color: 'var(--ss-text-muted)' }}>
              &hellip;
            </span>
          ) : (
            <button
              key={pg} type="button" onClick={() => onPageChange(pg)}
              style={pg === currentPage ? activeBtn : btnBase}
            >{pg}</button>
          )
        )}

        <button
          type="button" onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages} style={currentPage === totalPages ? disabledBtn : btnBase}
          title="Next page"
        >&#8250;</button>
      </div>
    </div>
  );
};

export default Pagination;

export const usePagination = (defaultPerPage = 10) => {
  const [page, setPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(defaultPerPage);

  const paginate = (array) => {
    const start = (page - 1) * itemsPerPage;
    return array.slice(start, start + itemsPerPage);
  };

  const handleSetItemsPerPage = (n) => { setItemsPerPage(n); setPage(1); };
  const resetPage = () => setPage(1);

  return { page, itemsPerPage, setPage, setItemsPerPage: handleSetItemsPerPage, paginate, resetPage };
};
