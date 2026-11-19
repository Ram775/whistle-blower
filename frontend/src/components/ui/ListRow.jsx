// src/components/ui/list/ListRow.jsx
const ListRow = ({ columns, selected, children }) => {
  return (
    <div
      className={`
        grid ${columns}
        table_grid_row 
        min-w-[800px] lg:min-w-full 
        transition-all duration-200
        ${selected ? "bg-[var(--color-primary-pale)]/60 border-[var(--color-primary-blue)]" : "bg-white"}
      `}
    >
      {children}
    </div>
  );
};

export default ListRow;