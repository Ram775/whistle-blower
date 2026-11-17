import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  Check,
} from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { TbFileTypeXls } from "react-icons/tb";

const CustomSelect = ({ label, value, options, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontSize: "var(--font-size-goi-p1)" }}
        className={`flex items-center justify-between gap-2 w-full px-3 py-2 bg-white border shadow-sm transition-all duration-200 rounded-lg ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon className="h-4 w-4 text-blue-500 shrink-0" />}
          <span className="font-semibold text-gray-700 truncate text-sm">
            {selectedOption ? selectedOption.label : label}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[110] mt-1 w-full min-w-[140px] bg-white border border-gray-100 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in duration-150 origin-top">
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{ fontSize: "var(--font-size-goi-p1)" }}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all text-sm ${
                value === opt.value
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-gray-600 hover:bg-slate-50"
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <Check size={14} className="shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TableFilters = ({
  search,
  setSearch,
  perPage,
  setPerPage,
  setCurrentPage,
  showSearch = true,
  selectedRole,
  setSelectedRole,
  roles = [],
  showRoleFilter = false,
  showPerPage = true,
  showExportExcel = false,
  showExportPDF = false,
  onExportExcel,
  onExportPDF,
  loading = false,
  hasData = false,
  placeholder = "Search...",
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] items-center gap-3 w-full">
      
      {/* Search Bar */}
      {showSearch && (
        <div className="w-full">
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            maxLength={50}
            onChange={(e) => {
              setSearch(e.target.value.replace(/[^A-Za-z0-9 /.\- ]/g, ""));
              setCurrentPage(1);
            }}
            style={{ fontSize: "var(--font-size-goi-p1)" }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white shadow-sm text-sm"
          />
        </div>
      )}

      {/* Role/Status Filter */}
      {showRoleFilter && roles?.length > 0 && (
        <div className="w-full md:w-[140px]">
          <CustomSelect
            label="All"
            value={selectedRole}
            options={[
              { label: "All", value: "" },
              ...roles.map((r) => ({ label: r, value: r })),
            ]}
            onChange={(val) => {
              setSelectedRole(val);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Per Page Filter */}
      {showPerPage && (
        <div className="w-full md:w-[140px]">
          <CustomSelect
            icon={SlidersHorizontal}
            value={perPage}
            options={[10, 20, 30, 50].map((v) => ({
              label: `${v} per page`,
              value: v,
            }))}
            onChange={(v) => {
              setPerPage(Number(v));
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Export Buttons */}
      {(showExportExcel || showExportPDF) && (
        <div className="flex items-center gap-2">
          {showExportExcel && (
            <button
              disabled={loading || !hasData}
              onClick={onExportExcel}
              title="Download Excel"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
            >
              <TbFileTypeXls size={18} />
            </button>
          )}
          {showExportPDF && (
            <button
              disabled={loading || !hasData}
              onClick={onExportPDF}
              title="Download Pdf"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
            >
              <FaFilePdf size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TableFilters;