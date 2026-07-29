import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        Showing page <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentPage}</span> of <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalPages}</span>
      </span>
      
      <div style={{ display: 'flex', gap: '4px' }}>
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ 
            padding: '6px 12px', 
            border: '1px solid var(--border-color)', 
            backgroundColor: '#fff', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            color: 'var(--text-primary)'
          }}
        >
          Previous
        </button>
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ 
            padding: '6px 12px', 
            border: '1px solid var(--border-color)', 
            backgroundColor: '#fff', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            color: 'var(--text-primary)'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};
