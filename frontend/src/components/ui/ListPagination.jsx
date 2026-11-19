// src/components/ui/list/ListPagination.jsx
const ListPagination = ({
  currentPage,
  totalPages,
  visiblePages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="list_pagination_wrap  sm:mt-3   px-2 sm:px-4">
      <span className="list_pagination_info text-xs sm:text-sm md:text-base block text-center sm:text-left mb-3 sm:mb-2">
        Showing page {currentPage + 1} of {totalPages}
      </span>

      <div className="list_pagination_controls flex flex-wrap items-center justify-center sm:justify-between gap-2 sm:gap-3 overflow-x-auto">
        
        <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
            className="list_page_nav text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
          >
            «
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="list_page_nav text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
          >
            ‹
          </button>

          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`list_page_btn text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 ${
                page === currentPage ? "list_page_btn_active" : ""
              }`}
            >
              {page + 1}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="list_page_nav text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
          >
            ›
          </button>

          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
            className="list_page_nav text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListPagination;