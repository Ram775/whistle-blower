import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Eye, Loader2 } from "lucide-react";
import { complaintService } from "../../services/complaintService";
import toast from "react-hot-toast";
import { Tooltip } from "antd";

// UI Components (Same as MasterData/NewsList)
import ListTable from "../../components/ui/ListTable";
import ListHeader from "../../components/ui/ListHeader";
import ListRow from "../../components/ui/ListRow";
import ListPagination from "../../components/ui/ListPagination";
import TableFilters from "../../components/ui/TableFilters";
import TextHighlighter from "../../components/ui/TextHighlighter";

const ComplaintList = () => {
  // Data State
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table State
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("");

  // Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAllComplaints();
      if (res.status) {
        setApiData(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Sort Logic
  const filteredData = useMemo(() => {
    const term = debouncedSearch?.toLowerCase().trim();
    let result = apiData || [];

    if (term) {
      result = result.filter(
        (item) =>
          `${item.complaint_no} ${item.full_name} ${item.event} ${item.complaint_date} ${item.complaint_status}`
            .toLowerCase()
            .includes(term)
      );
    }

    if (selectedFilter) {
      result = result.filter((item) => item.complaint_status === selectedFilter);
    }

    return result;
  }, [apiData, selectedFilter, debouncedSearch]);

  // Reset page on filter/search change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, perPage, selectedFilter]);

  const totalPages = Math.ceil(filteredData.length / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;

  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + perPage);
  }, [filteredData, startIndex, perPage]);

  const visiblePages = useMemo(() => {
    const pages = [];
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) start = Math.max(1, end - 2);
    for (let i = start; i <= end; i++) pages.push(i - 1);
    return pages;
  }, [totalPages, currentPage]);

  // Desktop Table Grid Template
  const gridTemplate = "grid-cols-[60px_1.5fr_1.5fr_1.5fr_1fr_1.2fr_100px]";

  // Helper for Status Badge Color
  const getStatusColor = (status) => {
    if (status === "Disposed") return "bg-green-100 text-green-800";
    if (status === "Under Processing") return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800"; // Default Pending
  };

  return (
    <div className="app_card overflow-hidden rounded-lg border border-gray-200 shadow-md" role="main">
      {/* Header */}
      <div className="card_header flex items-center gap-3 justify-between w-full p-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
          All Complaints
        </h2>
      </div>

      <div className="p-4 md:p-6 space-y-4 bg-slate-50/30">
        
        {/* ✅ SINGLE LINE FILTERS */}
        <div className="w-full">
          <TableFilters
            search={search}
            setSearch={setSearch}
            perPage={perPage}
            setPerPage={setPerPage}
            setCurrentPage={setCurrentPage}
            showRoleFilter={true}
            selectedRole={selectedFilter}
            setSelectedRole={setSelectedFilter}
            roles={["Pending", "Under Processing", "Disposed"]} // Tabs ki jagah filter use kiya
            placeholder="Search Complaint No, Name, Event..."
            showExportExcel={false}
            showExportPDF={false}
            loading={loading}
            hasData={filteredData.length > 0}
          />
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-gray-100 rounded-lg relative min-h-[400px]">
          {loading && apiData.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-[1px]">
              <Loader2 className="animate-spin text-[#082164]" size={32} />
            </div>
          )}

          {/* ========== MOBILE CARD VIEW ========== */}
          <div className="block lg:hidden space-y-4 p-1">
            {!loading && paginatedData.length === 0 && (
              <div className="p-10 text-center text-gray-500 font-medium bg-white rounded-xl border border-dashed border-gray-300">
                No complaints found.
              </div>
            )}
            {paginatedData.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4"
                role="article"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-blue-700 text-lg">
                    <TextHighlighter text={item.complaint_no} search={debouncedSearch} />
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(item.complaint_status)}`}>
                    {item.complaint_status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase tracking-tighter">Complainant:</span>
                    <span className="text-gray-800 font-semibold truncate ml-4 text-right">
                      <TextHighlighter text={item.full_name} search={debouncedSearch} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase tracking-tighter">Event:</span>
                    <span className="text-gray-600 truncate ml-4 text-right">
                      <TextHighlighter text={item.event} search={debouncedSearch} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase tracking-tighter">Date:</span>
                    <span className="text-gray-600 truncate ml-4 text-right">
                      <TextHighlighter text={item.complaint_date} search={debouncedSearch} />
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-gray-100">
                  <Link
                    to={`/admin/complaints/${item.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs uppercase hover:bg-blue-100 transition-colors w-full"
                  >
                    <Eye size={16} /> View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ========== DESKTOP TABLE VIEW ========== */}
          <div className="hidden lg:block overflow-hidden">
            <ListTable columns={gridTemplate}>
              {{
                header: (
                  <ListHeader className="uppercase items-center">
                    <div className="text-left">Sr No</div>
                    <div className="text-left">Complaint No</div>
                    <div className="text-left">Complainant</div>
                    <div className="text-left">Event</div>
                    <div className="text-left">Date</div>
                    <div className="flex justify-center">Status</div>
                    <div className="flex justify-center">Action</div>
                  </ListHeader>
                ),
                rows: paginatedData.length > 0 ? (
                  paginatedData.map((item, idx) => (
                    <ListRow
                      key={item.id}
                      columns={gridTemplate}
                      className="hover:bg-blue-50/50 transition-colors items-center"
                    >
                      {/* Sr No */}
                      <span className="text-left font-medium">
                        <TextHighlighter text={String(startIndex + idx + 1)} search={debouncedSearch} />
                      </span>
                      
                      {/* Complaint No */}
                      <span className="text-left font-semibold text-blue-700">
                        <TextHighlighter text={item.complaint_no} search={debouncedSearch} />
                      </span>

                      {/* Complainant */}
                      <span className="text-left truncate">
                        <Tooltip title={item.full_name}>
                          <span className="cursor-help">
                            <TextHighlighter text={item.full_name} search={debouncedSearch} />
                          </span>
                        </Tooltip>
                      </span>

                      {/* Event */}
                      <span className="text-left truncate text-gray-600">
                        <Tooltip title={item.event}>
                          <span className="cursor-help">
                            <TextHighlighter text={item.event} search={debouncedSearch} />
                          </span>
                        </Tooltip>
                      </span>

                      {/* Date */}
                      <span className="text-left text-gray-600">
                        <TextHighlighter text={item.complaint_date} search={debouncedSearch} />
                      </span>

                      {/* Status */}
                      <span className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(item.complaint_status)}`}>
                          {item.complaint_status}
                        </span>
                      </span>

                      {/* Action */}
                      <span className="flex justify-center">
                        <Tooltip title="View Details">
                          <Link
                            to={`/admin/complaints/${item.id}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold text-xs uppercase transition-colors"
                          >
                            <Eye size={16} /> View
                          </Link>
                        </Tooltip>
                      </span>
                    </ListRow>
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-400 italic">
                    No complaints found for this category.
                  </div>
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
    </div>
  );
};

export default ComplaintList;