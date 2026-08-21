import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Reusable pagination component
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-t border-slate-800">
      <div className="text-sm text-slate-400">
        Showing {startIndex} to {endIndex} of {total} results
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            className="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded text-sm hover:border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="px-3 py-1 text-sm text-slate-300">
            Page {page} of {totalPages}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
