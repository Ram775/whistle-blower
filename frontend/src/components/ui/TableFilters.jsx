import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  Check,
  Download,
  FileSpreadsheet,
} from "lucide-react";

import { text } from "../../language/ui/tableFilter";
import { LanguageContext } from "../../context/LanguageContext";
import { FaFilePdf, FaRegFilePdf } from "react-icons/fa6";
import { BsFiletypeXls } from "react-icons/bs";
import { TbFileTypeXls } from "react-icons/tb";

/**
 * Modern Custom Dropdown Component
 */
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
    <div
      className="relative flex-1 sm:flex-none min-w-[120px]"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontSize: "var(--font-size-goi-p1)" }}
        className={`flex items-center justify-between w-full px-3 py-2 bg-white border shadow-sm transition-all duration-200 rounded ${
          isOpen
            ? "border-blue-500 ring-4 ring-blue-500/10"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon className="h-4 w-4 text-blue-500 shrink-0" />}
          <span className="font-semibold text-gray-700 truncate">
            {selectedOption ? selectedOption.label : label}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[110] mt-2 w-full min-w-[160px] bg-white border border-gray-100 rounded shadow-2xl py-2 animate-in fade-in zoom-in duration-150 origin-top">
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{ fontSize: "var(--font-size-goi-p1)" }}
              className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-all ${
                value === opt.value
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-gray-600 hover:bg-slate-50"
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={14} />}
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
  sort,
  setSort,
  sortOrder,
  setSortOrder,
  perPage,
  setPerPage,
  setCurrentPage,
  sortOptions = [],
  selectedRole,
  setSelectedRole,
  roles = [],
  showSearch = true,
  showRoleFilter = false,
  showSortOrder = false,
  showPerPage = true,
  showExportExcel = false,
  showExportPDF = false,
  onExportExcel,
  onExportPDF,
  loading = false,
  hasData = false,
}) => {
  const { lang } = useContext(LanguageContext);
  const t = text[lang];

  return (
    <div
      className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 "
      style={{ fontSize: "var(--font-size-goi-p1)" }}
    >
      {showSearch && (
        <div className="relative w-full xl:max-w-sm ">
       
          <input
            type="text"
            placeholder={t.search_placeholder}
            value={search}
            maxLength={50}
            onChange={(e) => {
              setSearch(e.target.value.replace(/[^A-Za-z0-9 /.\- ]/g, ""));
              setCurrentPage(1);
            }}
            style={{ fontSize: "var(--font-size-goi-p1)" }}
            className=" pl-5 pr-4 py-2 border border-gray-200 rounded focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none bg-white shadow-sm"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {showRoleFilter && roles?.length > 0 && (
          <CustomSelect
            label={t.all_roles}
            value={selectedRole}
            options={[
              { label: t.all_roles, value: "" },
              ...roles.map((r) => ({ label: r, value: r })),
            ]}
            onChange={(val) => {
              setSelectedRole(val);
              setCurrentPage(1);
            }}
          />
        )}
        {showSortOrder && (
          <CustomSelect
            icon={ArrowUpDown}
            value={sortOrder}
            options={[
              { label: t.ascending, value: "asc" },
              { label: t.descending, value: "desc" },
            ]}
            onChange={setSortOrder}
          />
        )}
        {showPerPage && (
          <CustomSelect
            icon={SlidersHorizontal}
            value={perPage}
            options={[ 10, 20, 30, 50].map((v) => ({
              label: `${v} ${t.per_page}`,
              value: v,
            }))}
            onChange={(v) => {
              setPerPage(Number(v));
              setCurrentPage(1);
            }}
          />
        )}

        {/* Buttons Section */}
        {(showExportExcel || showExportPDF) && (
          <div className="flex items-center gap-2 ml-auto xl:ml-0">
            {showExportExcel && (
              <button
                disabled={loading || !hasData}
                onClick={onExportExcel}
                title="Download Excel"
                className="flex items-center btn_base font-extrabold   gap-2 px-4 py-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50  uppercase text-[10px]"
              >
                <TbFileTypeXls   size={16} />
              </button>
            )}
            {showExportPDF && (
              <button
                disabled={loading || !hasData}
                onClick={onExportPDF}
                title="Download Pdf"
                className="flex items-center gap-2  btn_base px-4 py-2 rounded bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 font-extrabold uppercase text-[10px]"
              >
                <FaFilePdf  size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableFilters;