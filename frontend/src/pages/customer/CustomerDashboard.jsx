import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Plus, LogOut, Eye, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { complaintService } from "../../services/complaintService";
import { notify } from "../../utils/notify";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import ListTable from "../../components/ui/ListTable";
import ListHeader from "../../components/ui/ListHeader";
import ListRow from "../../components/ui/ListRow";
import ListPagination from "../../components/ui/ListPagination";
import TableFilters from "../../components/ui/TableFilters";
import TextHighlighter from "../../components/ui/TextHighlighter";

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getMyComplaints();
      if (response.status) {
        setApiData(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

 

  const filteredData = useMemo(() => {
    const term = debouncedSearch?.toLowerCase().trim();
    let result = apiData || [];

    if (term) {
      result = result.filter((item) =>
        `${item.complaint_no} ${item.event} ${item.complaint_date} ${item.complaint_status}`
          .toLowerCase()
          .includes(term),
      );
    }

    if (selectedFilter) {
      result = result.filter(
        (item) => item.complaint_status === selectedFilter,
      );
    }

    return result.map((item, index) => ({ ...item, sr: index + 1 }));
  }, [apiData, selectedFilter, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, perPage, selectedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const paginatedData = useMemo(
    () => filteredData.slice(startIndex, startIndex + perPage),
    [filteredData, startIndex, perPage],
  );

  const visiblePages = useMemo(() => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) start = Math.max(1, end - 2);
    start = Math.max(1, start);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i - 1);
    return pages;
  }, [totalPages, currentPage]);

  const getStatusColor = (status) => {
    if (status === "Disposed") return "bg-green-100 text-green-800";
    if (status === "Under Processing") return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  // ==========================================
  // ✅ EXCEL EXPORT FUNCTION
  // ==========================================
  const handleExportExcel = () => {
    try {
      if (filteredData.length === 0) {
        return notify.warning("No data available to export.");
      }

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB");
      const formattedTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const generationDateTime = `${formattedDate} ${formattedTime}`;

      const exportData = filteredData.map((item) => ({
        "SR No.": item.sr,
        "Complaint No": item?.complaint_no ?? "---",
        "Vigilance Angle": item?.event ?? "---",
        Date: item?.complaint_date ?? "---",
        Status: item?.complaint_status ?? "---",
      }));

      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [[`Report Generated On: ${generationDateTime}`]],
        { origin: "A1" },
      );
      XLSX.utils.sheet_add_json(worksheet, exportData, { origin: "A3" });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "My Complaints");

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

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      const fileDate = now.toISOString().split("T")[0];
      const fileTime = now.toTimeString().split(" ")[0].replace(/:/g, "-");

      saveAs(blob, `My_Complaints_${fileDate}_${fileTime}.xlsx`);
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
      if (filteredData.length === 0) {
        return notify.warning("No data available to export.");
      }

      const displayListName = "My Registered Complaints Report";

      const cleanText = (value) => {
        if (!value) return "N/A";
        return String(value)
          .replace(/&#13;&#10;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&#8220;/g, '"')
          .replace(/&#8221;/g, '"')
          .replace(/&#8217;/g, "'")
          .replace(/<[^>]*>/g, "")
          .trim();
      };

      const hasLongContent = filteredData.some(
        (item) =>
          (item.complaint_no && item.complaint_no.length > 30) ||
          (item.event && item.event.length > 30),
      );

      const dynamicOrientation = hasLongContent ? "landscape" : "portrait";
      const doc = new jsPDF({ orientation: dynamicOrientation });

      const generatedDate = new Date().toLocaleDateString();
      const generatedTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const totalRecords = filteredData.length;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(27, 42, 94);
      doc.text(displayListName.toUpperCase(), 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);

      const pageWidth =
        doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      const rightMargin = pageWidth - 14;

      doc.text(`Generated On: ${generatedDate} | ${generatedTime}`, 14, 22);
      doc.text(`Total Records: ${totalRecords}`, rightMargin, 22, {
        align: "right",
      });

      doc.setDrawColor(220, 220, 220);
      doc.line(14, 25, rightMargin, 25);

      const headers = [
        "SR No.",
        "Complaint No",
        "Vigilance Angle",
        "Date",
        "Status",
      ];

      const rows = filteredData.map((item, index) => [
        (index + 1).toString(),
        cleanText(item?.complaint_no),
        cleanText(item?.event),
        cleanText(item?.complaint_date),
        cleanText(item?.complaint_status),
      ]);

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        theme: "striped",
        styles: {
          fontSize: dynamicOrientation === "portrait" ? 7.5 : 8.5,
          cellPadding: 2.5,
          overflow: "linebreak",
          valign: "middle",
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [27, 42, 94],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          fontSize: 9,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255],
        },
        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            pageWidth - 25,
            pageHeight - 5,
          );
        },
      });

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      doc.save(`My_Complaints_${dateStr}.pdf`);
      notify.success("PDF exported successfully!");
    } catch (error) {
      console.error("Export PDF error:", error);
      notify.error("Failed to export PDF: " + error.message);
    }
  };

  const gridTemplate = "grid-cols-[80px_1.8fr_1.6fr_1.4fr_1.2fr_1fr]";

  return (
    <div className="min-h-screen bg-gray-100">
      

      <main className="w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1b2a5e] to-[#2c428c] rounded-lg p-6 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Hello, {user?.first_name}!</h2>
            <p className="text-[#d2dfff] text-sm mt-1">
              Track your registered complaints and their real-time status here.
            </p>
          </div>
          <Link
            to="/new-complaint"
            className="bg-white text-[#1b2a5e] px-4 py-2 rounded-lg font-bold text-sm flex items-center hover:bg-[#d2dfff] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Complaint
          </Link>
        </div>

        {/* Main Card - Exact ComplaintList UI */}
        <div className="bg-white app_card rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Card Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-[#1b2a5e]">
              My Registered Complaints
            </h2>
          </div>

          <div className="p-4 md:p-5 flex flex-col gap-4">
            {/* Table Filters */}
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
                roles={["Pending", "Under Processing", "Disposed"]}
                placeholder="Search Complaint No, Vigilance Angle, Date..."
                showExportExcel={true}
                showExportPDF={true}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                loading={loading}
                hasData={filteredData.length > 0}
              />
            </div>

            {/* Table Container */}
            <div className="overflow-hidden relative min-h-[300px]">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                  <Loader2 className="animate-spin text-[#1b2a5e]" size={32} />
                </div>
              )}

              {/* Desktop Table View */}
              <div className="hidden lg:block w-full">
                <ListTable columns={gridTemplate}>
                  {{
                    header: (
                      <ListHeader className="bg-[#d2dfff] text-[#1b2a5e] rounded-none border-none py-2 uppercase text-[12px] font-bold">
                        <div className="text-center">SR. NO</div>
                        <div className="text-left pl-2">Complaint No</div>
                        <div className="text-left pl-2">Vigilance Angle</div>
                        <div className="text-left pl-2">Date</div>
                        <div className="text-center">Status</div>
                        <div className="text-center">Action</div>
                      </ListHeader>
                    ),
                    rows:
                      paginatedData.length > 0
                        ? paginatedData.map((item) => (
                            <ListRow
                              key={item?.id}
                              columns={gridTemplate}
                              className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-none py-2"
                            >
                              <span className="text-center font-medium text-gray-700 text-[13px]">
                                {item.sr}
                              </span>
                              <span className="text-left pl-2 font-semibold text-[#1b2a5e] truncate text-[13px]">
                                <TextHighlighter
                                  text={item?.complaint_no}
                                  search={search}
                                />
                              </span>
                              <span className="text-left pl-2 truncate text-gray-700 text-[13px]">
                                <TextHighlighter
                                  text={item?.event}
                                  search={search}
                                />
                              </span>
                              <span className="text-left pl-2 text-gray-700 text-[13px]">
                                <TextHighlighter
                                  text={item?.complaint_date}
                                  search={search}
                                />
                              </span>
                              <span className="flex justify-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusColor(
                                    item.complaint_status,
                                  )}`}
                                >
                                  {item.complaint_status}
                                </span>
                              </span>
                              <span className="flex justify-center">
                                <Link
                                  to={`/complaint/${item.id}`}
                                  className="text-[#1b2a5e] hover:underline flex items-center gap-1 font-bold text-[11px] uppercase"
                                >
                                  <Eye size={14} /> View
                                </Link>
                              </span>
                            </ListRow>
                          ))
                        : !loading && (
                            <div className="py-10 text-center text-gray-400 italic w-full">
                              No complaints registered yet
                            </div>
                          ),
                  }}
                </ListTable>
              </div>

              {/* Mobile / Tablet Card Fallback */}
              <div className="lg:hidden space-y-3">
                {paginatedData.length > 0
                  ? paginatedData.map((item) => (
                      <div
                        key={item?.id}
                        className="border border-gray-200 rounded-lg p-3.5 bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1b2a5e]">
                            #{item.sr} •{" "}
                            <TextHighlighter
                              text={item?.complaint_no}
                              search={search}
                            />
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusColor(
                              item.complaint_status,
                            )}`}
                          >
                            {item.complaint_status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700">
                          <span className="font-semibold text-gray-500">
                            Vigilance Angle:{" "}
                          </span>
                          <TextHighlighter text={item?.event} search={search} />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            <TextHighlighter
                              text={item?.complaint_date}
                              search={search}
                            />
                          </span>
                          <Link
                            to={`/complaint/${item.id}`}
                            className="text-[#1b2a5e] hover:underline flex items-center gap-1 font-bold text-[11px] uppercase"
                          >
                            <Eye size={14} /> View
                          </Link>
                        </div>
                      </div>
                    ))
                  : !loading && (
                      <div className="py-10 text-center text-gray-400 italic">
                        No complaints registered yet
                      </div>
                    )}
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
      </main>
    </div>
  );
};

export default CustomerDashboard;
