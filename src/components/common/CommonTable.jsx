import React from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

const TableEmptyState = ({ message = "No matching records found" }) => (
  <div className="py-16 px-4 flex justify-center items-center dark:bg-gray-200 ">
    <div className="text-center">
      <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-700">No data found</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-700">{message}</p>
    </div>
  </div>
);

const CommonTable = ({ columns, data, sorting, onSortingChange, isLoading, emptyMessage, pageNo, pageSize, total, onPageChange, onPageSizeChange }) => {
  const handleSort = (columnId) => {
    const isDesc = sorting && sorting.length > 0 && sorting[0].id === columnId && sorting[0].desc;
    onSortingChange && onSortingChange([{ id: columnId, desc: !isDesc }]);
  };

  const totalPages = total && pageSize ? Math.ceil(total / pageSize) : 1;
  const pageNumbers = [];
  const maxPageButtons = 3;
  let startPage = Math.max(1, (pageNo || 1) - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (isLoading) {
    return (
      <div className="w-full border-gray-200 dark:border-gray-300 relative scrollable-x-auto border dark:bg-gray-100">
        <div className="py-16 px-4 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-600">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <TableEmptyState message={emptyMessage || "No data found. Try adjusting your filters or search criteria."} />;
  }

  return (
    <>
      <div className="w-full overflow-x-auto dark:bg-gray-100 relative scrollable-x-auto border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={`px-2 sm:px-4 py-3 text-xs text-gray-800 font-bold border-l dark:border-gray-300 dark:text-gray-900 uppercase tracking-wider ${column.enableSorting ? 'cursor-pointer' : ''} ${column.meta?.headerClassName || 'text-left'}`}
                  onClick={() => column.enableSorting && handleSort(column.id)}
                >
                  <div className="flex items-center gap-1">
                    {typeof column.header === 'function' ? (column.header().props?.title || column.header({ column })) : column.header}
                    {column.enableSorting && sorting && sorting.length > 0 && sorting[0].id === column.id && (
                      sorting[0].desc ? <span>&#8595;</span> : <span>&#8593;</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-100 divide-y divide-gray-200 dark:divide-gray-300">
            {data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-200">
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.id}`}
                    className={`px-2 sm:px-4 py-3 text-sm border-l dark:border-gray-300 dark:text-gray-800 ${column.meta?.cellClassName || ''}`}
                  >
                    {column.cell({ row: { original: row } })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {typeof pageNo === 'number' && typeof pageSize === 'number' && typeof total === 'number' && onPageChange && onPageSizeChange && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-3 border-t border-gray-200 dark:bg-gray-100 dark:border-gray-300 gap-3">
          <div className="flex flex-wrap items-center w-full sm:w-auto">
            <span className="text-sm text-gray-700 dark:text-gray-800">
              Showing <span className="font-medium dark:text-gray-800">{data.length === 0 ? 0 : ((pageNo - 1) * pageSize) + 1}</span> to{" "}
              <span className="font-medium dark:text-gray-800">{Math.min(pageNo * pageSize, total)}</span> of{" "}
              <span className="font-medium dark:text-gray-800">{total}</span> results
            </span>
            <select
              value={pageSize}
              onChange={onPageSizeChange}
              className="ml-0 sm:ml-4 mt-2 sm:mt-0 border border-gray-300 rounded p-1 text-sm dark:bg-gray-200 dark:text-gray-800"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 w-full sm:w-auto justify-start sm:justify-end">
            <button
              onClick={() => onPageChange(1)}
              disabled={pageNo === 1}
              className={`px-2 py-1 rounded text-sm ${pageNo === 1 ? 'text-gray-400 cursor-not-allowed dark:text-gray-600' : 'text-blue-600 hover:bg-blue-50 dark:text-blue-700  dark:hover:bg-gray-300 dark:hover:text-gray-800'}`}
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange(pageNo - 1)}
              disabled={pageNo <= 1}
              className={`px-2 py-1 rounded text-sm ${pageNo <= 1 ? 'text-gray-400 cursor-not-allowed dark:text-gray-600' : 'text-blue-600 hover:bg-blue-50 dark:text-blue-700  dark:hover:bg-gray-300 dark:hover:text-gray-800'}`}
            >
              <ChevronLeft size={18} />
            </button>
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => onPageChange(number)}
                className={`px-3 py-1 rounded text-sm ${pageNo === number
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-300 dark:hover:text-gray-800'
                  }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => onPageChange(pageNo + 1)}
              disabled={pageNo >= totalPages}
              className={`px-2 py-1 rounded text-sm ${pageNo >= totalPages ? 'text-gray-400 cursor-not-allowed dark:text-gray-600' : 'text-blue-600 hover:bg-blue-50 dark:text-blue-700 dark:hover:bg-gray-300 dark:hover:text-gray-800'}`}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={pageNo === totalPages || totalPages === 0}
              className={`px-2 py-1 rounded text-sm ${pageNo === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed dark:text-gray-600' : 'text-blue-600 hover:bg-blue-50 dark:text-blue-700 dark:hover:bg-gray-300 dark:hover:text-gray-800'}`}
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CommonTable;
