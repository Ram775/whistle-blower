import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { masterService } from "../../services/masterService";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Tooltip, Modal } from "antd";
import toast from "react-hot-toast";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { notify } from "../../utils/notify";

// UI Components
import ListTable from "../../components/ui/ListTable";
import ListHeader from "../../components/ui/ListHeader";
import ListRow from "../../components/ui/ListRow";
import ListPagination from "../../components/ui/ListPagination";
import TableFilters from "../../components/ui/TableFilters"; 
import TextHighlighter from "../../components/ui/TextHighlighter";

const { confirm } = Modal;

const MasterData = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "countries";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data State
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table State
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", sort_order: 0, status: "1" });

  const tabs = [
    { key: "countries", label: "Country" },
    { key: "states", label: "State" },
    { key: "districts", label: "District" },
    { key: "cities", label: "City" },
    { key: "vigilance-angles", label: "Event" },
    { key: "disclosure-details", label: "Disclosure Detail" },
  ];

  const currentTabLabel = tabs.find((t) => t.key === activeTab)?.label || "Master Data";

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const getService = () => {
    switch (activeTab) {
      case "countries": return { list: masterService.getCountries, create: masterService.createCountry, update: masterService.updateCountry, remove: masterService.deleteCountries, status: masterService.changeCountryStatus };
      case "states": return { list: masterService.getStates, create: masterService.createState, update: masterService.updateState, remove: masterService.deleteStates, status: masterService.changeStateStatus };
      case "districts": return { list: masterService.getDistricts, create: masterService.createDistrict, update: masterService.updateDistrict, remove: masterService.deleteDistricts, status: masterService.changeDistrictStatus };
      case "cities": return { list: masterService.getCities, create: masterService.createCity, update: masterService.updateCity, remove: masterService.deleteCities, status: masterService.changeCityStatus };
      case "vigilance-angles": return { list: masterService.getVigilanceAngles, create: masterService.createVigilanceAngle, update: masterService.updateVigilanceAngle, remove: masterService.deleteVigilanceAngles, status: masterService.changeVigilanceAngleStatus };
      case "disclosure-details": return { list: masterService.getDisclosures, create: masterService.createDisclosure, update: masterService.updateDisclosure, remove: masterService.deleteDisclosures, status: masterService.changeDisclosureStatus };
      default: return null;
    }
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await getService().list();
      if (response.data) setApiData(response.data);
    } catch (error) {
      toast.error(`Failed to load ${currentTabLabel}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    setSelectedIds([]); 
  }, [activeTab]);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row.id);
      setFormData({
        name: row.name || row.state_name || row.district_name || row.city_name,
        sort_order: row.sort_order || 0,
        status: String(row.status),
      });
    } else {
      setEditId(null);
      setFormData({ name: "", sort_order: 0, status: "1" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (activeTab === "states") payload.state_name = formData.name;
      else if (activeTab === "districts") payload.district_name = formData.name;
      else if (activeTab === "cities") payload.city_name = formData.name;
      else payload.name = formData.name;

      if (activeTab === "states") payload.country_id = 1;
      if (activeTab === "districts") payload.state_id = 1;
      if (activeTab === "cities") { payload.district_id = 1; payload.pincode = "400001"; }

      if (editId) {
        await getService().update(editId, payload);
        toast.success(`${currentTabLabel} updated successfully!`);
      } else {
        await getService().create(payload);
        toast.success(`${currentTabLabel} created successfully!`);
      }
      setShowModal(false);
      fetchList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteClick = (id) => {
    confirm({
      title: "Delete Confirmation",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete this ${currentTabLabel}?`,
      okText: "Yes, Delete",
      okType: "danger",
      async onOk() {
        try {
          setLoading(true);
          await getService().remove([id]);
          toast.success(`${currentTabLabel} deleted successfully!`);
          fetchList();
        } catch (error) {
          toast.error("Delete failed");
          setLoading(false);
        }
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return toast.warning("Please select at least one record.");
    confirm({
      title: "Delete Confirmation",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${selectedIds.length} records?`,
      okText: "Yes, Delete",
      okType: "danger",
      async onOk() {
        try {
          setLoading(true);
          await getService().remove(selectedIds);
          toast.success(`Records deleted successfully!`);
          setSelectedIds([]);
          fetchList();
        } catch (error) {
          toast.error("Delete failed");
          setLoading(false);
        }
      },
    });
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = String(currentStatus) === "1" ? "0" : "1";
    try {
      await getService().status(id, newStatus);
      toast.success("Status updated!");
      fetchList();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredData = useMemo(() => {
    const term = debouncedSearch?.toLowerCase().trim();
    let result = apiData || [];

    if (term) {
      result = result.filter((item) =>
        `${item.name || item.state_name || item.district_name || item.city_name || ""}`
          .toLowerCase()
          .includes(term)
      );
    }

    if (selectedFilter) {
      if (selectedFilter === "Active") result = result.filter((item) => String(item.status) === "1");
      else if (selectedFilter === "Inactive") result = result.filter((item) => String(item.status) === "0");
    }

    return result.map((item, index) => ({ ...item, sr: index + 1 }));
  }, [apiData, selectedFilter, debouncedSearch]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, perPage, selectedFilter]);

  const totalPages = Math.ceil(filteredData.length / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;

  const paginatedData = useMemo(() => filteredData.slice(startIndex, startIndex + perPage), [filteredData, startIndex, perPage]);

  const visiblePages = useMemo(() => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) start = Math.max(1, end - 2);
    start = Math.max(1, start);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i - 1);
    return pages;
  }, [totalPages, currentPage]);

  // ==========================================
  // ✅ EXCEL EXPORT FUNCTION
  // ==========================================
  const handleExportExcel = () => {
    try {
      if (filteredData.length === 0) return notify.warning("No data available to export.");
      
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB");
      const formattedTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const generationDateTime = `${formattedDate} ${formattedTime}`;

      const exportData = filteredData.map((item) => ({
        "SR No.": item.sr,
        "Name": item.name || item.state_name || item.district_name || item.city_name || "---",
        "Sort Order": item.sort_order || "---",
        "Status": String(item.status) === '1' ? 'Active' : 'Inactive',
      }));

      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(worksheet, [[`Report Generated On: ${generationDateTime}`]], { origin: "A1" });
      XLSX.utils.sheet_add_json(worksheet, exportData, { origin: "A3" });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, currentTabLabel);

      const colWidths = {};
      Object.keys(exportData[0] || {}).forEach((key) => {
        let maxLen = key.length;
        exportData.forEach((row) => {
          const val = String(row[key] || "");
          maxLen = Math.max(maxLen, val.length);
        });
        colWidths[key] = Math.min(maxLen, 50);
      });
      worksheet["!cols"] = Object.values(colWidths).map((w) => ({ wch: w }));

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

      const fileDate = now.toISOString().split("T")[0];
      const fileTime = now.toTimeString().split(" ")[0].replace(/:/g, "-");
      saveAs(blob, `${currentTabLabel}_List_${fileDate}_${fileTime}.xlsx`);
      notify.success("Excel exported successfully!");
    } catch (error) {
      console.error("Export Excel error:", error);
      notify.error("Failed to export Excel.");
    }
  };

  // ==========================================
  // ✅ PDF EXPORT FUNCTION
  // ==========================================
  const handleExportPDF = () => {
    try {
      if (filteredData.length === 0) return notify.warning("No data available to export.");
      const displayListName = `${currentTabLabel} List Report`;
      
      const cleanText = (value) => {
        if (!value) return "N/A";
        return String(value).replace(/<[^>]*>/g, "").trim();
      };

      const doc = new jsPDF({ orientation: "portrait" });
      const generatedDate = new Date().toLocaleDateString();
      const generatedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.textColor = [41, 128, 185];
      doc.text(displayListName.toUpperCase(), 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.textColor = [100, 100, 100];

      const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      const rightMargin = pageWidth - 14;

      doc.text(`Generated On: ${generatedDate} | ${generatedTime}`, 14, 22);
      doc.text(`Total Records: ${filteredData.length}`, rightMargin, 22, { align: "right" });
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 25, rightMargin, 25);

      const headers = ["SR No.", "Name", "Sort Order", "Status"];
      const rows = filteredData.map((item, index) => [
        (index + 1).toString(),
        cleanText(item.name || item.state_name || item.district_name || item.city_name),
        cleanText(item.sort_order),
        String(item.status) === '1' ? 'Active' : 'Inactive',
      ]);

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 2.5, lineColor: [200, 200, 200], lineWidth: 0.1 },
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(9);
          doc.textColor = [100, 100, 100];
          doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 25, pageHeight - 5);
        },
      });

      const dateStr = new Date().toISOString().split("T")[0];
      doc.save(`${currentTabLabel}_List_${dateStr}.pdf`);
      notify.success("PDF exported successfully!");
    } catch (error) {
      console.error("Export PDF error:", error);
      notify.error("Failed to export PDF.");
    }
  };

  const gridTemplate = "grid-cols-[50px_60px_1fr_100px_100px]";

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#1b2a5e]">
          {currentTabLabel} Management
        </h2>
      </div>

      <div className="p-4 md:p-5 flex flex-col gap-4">
        
        {/* ✅ FILTER ROW WITH EXPORT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
          
          <div className="w-full md:w-auto flex-1">
            <TableFilters
              search={search}
              setSearch={setSearch}
              perPage={perPage}
              setPerPage={setPerPage}
              setCurrentPage={setCurrentPage}
              showRoleFilter={true}
              selectedRole={selectedFilter}
              setSelectedRole={setSelectedFilter}
              roles={["Active", "Inactive"]}
              placeholder={`Search ${currentTabLabel}...`}
              showExportExcel={true}
              showExportPDF={true}
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              loading={loading}
              hasData={filteredData.length > 0}
            />
          </div>

          {/* Right: Action Buttons (Delete & Add New) */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={handleBulkDelete}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 rounded px-4 py-2 shadow-sm text-sm font-semibold text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 whitespace-nowrap transition-all"
            >
              <Trash2 size={16} /> Delete
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1b2a5e] text-white rounded px-4 py-2 shadow-sm text-sm font-semibold hover:bg-blue-800 whitespace-nowrap transition-all"
            >
              <Plus size={16} /> Add New
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <Loader2 className="animate-spin text-[#1b2a5e]" size={32} />
            </div>
          )}

          {/* MOBILE CARD VIEW */}
          <div className="block lg:hidden space-y-4 p-1">
            {!loading && paginatedData.length === 0 && (
              <div className="p-10 text-center text-gray-500 font-medium bg-white rounded-xl border border-dashed border-gray-300">
                No records found
              </div>
            )}
            {paginatedData.map((item, idx) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-blue-900"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}
                  />
                  <span className="overflow-hidden block flex-1">
                    <h4 className="font-bold text-gray-800 truncate">
                      <Tooltip title={item.name || item.state_name || item.district_name || item.city_name}>
                        <span className="cursor-help">
                          <TextHighlighter text={item.name || item.state_name || item.district_name || item.city_name || "N/A"} search={debouncedSearch} />
                        </span>
                      </Tooltip>
                    </h4>
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter text-[12px]">Status:</span>
                  <button onClick={() => handleStatusToggle(item.id, item.status)} className={`px-3 py-1 rounded text-xs font-semibold ${String(item.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {String(item.status) === '1' ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button onClick={() => handleOpenModal(item)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded font-bold text-xs uppercase hover:bg-blue-100 transition-colors">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDeleteClick(item.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded font-bold text-xs uppercase hover:bg-red-100 transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW - FLAT & CLEAN */}
          <div className="hidden lg:block w-full">
            <ListTable columns={gridTemplate}>
              {{
                header: (
                  <ListHeader className="bg-[#d2dfff] text-[#1b2a5e] rounded-none border-none py-2 uppercase text-[12px] font-bold">
                    <div className="text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded accent-blue-900"
                        onChange={(e) => setSelectedIds(e.target.checked ? paginatedData.map((i) => i.id) : [])}
                        checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                      />
                    </div>
                    <div className="text-left">Sr No</div>
                    <div className="text-left">Name</div>
                    <div className="flex justify-center">Status</div>
                    <div className="flex justify-center">Action</div>
                  </ListHeader>
                ),
                rows: paginatedData.length > 0 ? (
                  paginatedData.map((item, idx) => (
                    <ListRow key={item.id} columns={gridTemplate} className={`bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-none py-2 items-center ${selectedIds.includes(item.id) ? "bg-blue-50/50" : ""}`}>
                      <span className="flex justify-center">
                        <input type="checkbox" className="h-4 w-4 rounded accent-blue-900" checked={selectedIds.includes(item.id)} onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])} />
                      </span>
                      <span className="text-left truncate font-medium text-gray-700 text-[13px]">
                        <TextHighlighter text={String(startIndex + idx + 1)} search={debouncedSearch} />
                      </span>
                      <span className="text-left truncate text-gray-700 text-[13px]">
                        <Tooltip title={item.name || item.state_name || item.district_name || item.city_name}>
                          <span className="cursor-help">
                            <TextHighlighter text={item.name || item.state_name || item.district_name || item.city_name || "N/A"} search={debouncedSearch} />
                          </span>
                        </Tooltip>
                      </span>
                      <span className="flex justify-center">
                        <button onClick={() => handleStatusToggle(item.id, item.status)} className={`px-3 py-1 rounded text-[11px] font-semibold ${String(item.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {String(item.status) === '1' ? 'Active' : 'Inactive'}
                        </button>
                      </span>
                      <span className="flex justify-center gap-3">
                        <Tooltip title="Edit">
                          <Edit size={16} className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors" onClick={() => handleOpenModal(item)} />
                        </Tooltip>
                        <Tooltip title="Delete">
                          <Trash2 size={16} className="text-red-600 hover:text-red-800 cursor-pointer transition-colors" onClick={() => handleDeleteClick(item.id)} />
                        </Tooltip>
                      </span>
                    </ListRow>
                  ))
                ) : !loading && (
                  <div className="py-10 text-center text-gray-400 italic w-full">No records found</div>
                ),
              }}
            </ListTable>
          </div>
        </div>

        {/* Pagination */}
        <ListPagination
          currentPage={currentPage - 1}
          totalPages={totalPages}
          visiblePages={visiblePages}
          onPageChange={(p) => setCurrentPage(p + 1)}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        open={showModal} 
        onCancel={() => setShowModal(false)} 
        title={editId ? `Edit ${currentTabLabel}` : `Add ${currentTabLabel}`}
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <input type="number" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: e.target.value})} className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#1b2a5e] text-white rounded hover:bg-blue-800 text-sm font-medium">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MasterData;