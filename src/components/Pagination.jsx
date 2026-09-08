import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (!totalItems || totalItems <= 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="table-pagination" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderTop: '1px solid #f1f5f9',
      background: '#ffffff',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
        Hiển thị <strong style={{ color: '#0f172a' }}>{startIndex + 1}</strong> - <strong style={{ color: '#0f172a' }}>{endIndex}</strong> trên <strong style={{ color: '#0f172a' }}>{totalItems}</strong> lịch hẹn
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '7px 14px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: currentPage === 1 ? '#f8fafc' : '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#334155',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.15s ease'
          }}
        >
          ◄ Trang trước
        </button>

        {pageNumbers.map(page => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            style={{
              minWidth: '36px',
              height: '36px',
              padding: '0 10px',
              borderRadius: '10px',
              border: page === currentPage ? '1px solid #0f6eff' : '1px solid #cbd5e1',
              background: page === currentPage ? '#0f6eff' : '#ffffff',
              color: page === currentPage ? '#ffffff' : '#334155',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: page === currentPage ? '700' : '600',
              boxShadow: page === currentPage ? '0 3px 10px rgba(15, 110, 255, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{
            padding: '7px 14px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: currentPage === totalPages || totalPages === 0 ? '#f8fafc' : '#ffffff',
            color: currentPage === totalPages || totalPages === 0 ? '#cbd5e1' : '#334155',
            cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.15s ease'
          }}
        >
          Trang sau ►
        </button>
      </div>
    </div>
  );
};

export default Pagination;
