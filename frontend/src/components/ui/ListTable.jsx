const ListTable = ({ columns, children, maxHeight = "none" }) => {
  return (
    <div className="w-full">
      <div
        className="w-full overflow-x-auto  custom-scrollbar  "
        style={{ maxHeight: maxHeight }}
      >
        <div className="min-w-[800px]    lg:min-w-full inline-block align-middle">
          <div
            className={`grid ${columns}  table_grid_header  sticky top-0 z-10 `}
          >
            {children.header}
          </div>

          <div className="  mt-1">{children.rows}</div>
        </div>
      </div>

      {/* Scroll Tip for Mobile users (Optional) */}
      <div className="lg:hidden text-[10px] text-gray-400 mt-1 text-center italic">
        ← Swipe horizontally to view more →
      </div>
    </div>
  );
};

export default ListTable;