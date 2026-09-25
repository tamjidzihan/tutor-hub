import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const showAllPages = totalPages <= 7;
  const showFirstJump = !showAllPages && currentPage >= 3;
  const showLastJump = !showAllPages && currentPage <= totalPages - 2;
  const pageNumbers = showAllPages
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : showFirstJump
      ? showLastJump
        ? currentPage === 3
          ? [2, 3, 4]
          : [currentPage - 1, currentPage, currentPage + 1]
        : [totalPages - 2, totalPages - 1, totalPages]
      : [1, 2, 3];

  return (
    <div className="flex items-center justify-center gap-1.5 py-6">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {showFirstJump && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="hidden h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:inline-flex sm:items-center"
          >
            First page
          </button>
          <span className="px-1 text-slate-400" aria-hidden="true">...</span>
        </>
      )}

      {pageNumbers.map((page, index) => (
        <React.Fragment key={`${page}-${index}`}>
          <button
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${currentPage === page
              ? 'bg-brand-500 text-white shadow-sm'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
          >
            {page}
          </button>
        </React.Fragment>
      ))}

      {showLastJump && (
        <>
          <span className="px-1 text-slate-400" aria-hidden="true">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="hidden h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:inline-flex sm:items-center"
          >
            Last page
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
