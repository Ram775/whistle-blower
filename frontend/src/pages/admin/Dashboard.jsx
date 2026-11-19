import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  RefreshCw,
  CheckCircle,
  Eye,
  Loader2,
  Activity,
} from "lucide-react";
import { userService } from "../../services/userService";
import { complaintService } from "../../services/complaintService";

import { Tooltip } from "antd";

// UI Components
import ListTable from "../../components/ui/ListTable";
import ListHeader from "../../components/ui/ListHeader";
import ListRow from "../../components/ui/ListRow";
import ListPagination from "../../components/ui/ListPagination";
import { notify } from "../../utils/notify";

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    registered_complaint: 0,
    pending_complaint: 0,
    underprocessing_complaint: 0,
    completed_complaint: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const perPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, complaintsRes] = await Promise.all([
          userService.getDashboardStats(),
          complaintService.getAllComplaints(),
        ]);

        if (statsRes.status) setStatsData(statsRes.data);

        if (complaintsRes.status) {
          setRecentComplaints(complaintsRes.data.reverse().slice(0, 5));
        }
      } catch (error) {
        notify.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- STATS CARDS (Exact Match to Screenshot Colors) ---
  const stats = useMemo(() => {
    return [
      {
        id: 1,
        title: "TOTAL COMPLAINTS",
        value: statsData.registered_complaint || 0,
        icon: FileText,
        color: "bg-[#1b2a5e]", // Dark Blue (from screenshot)
      },
      {
        id: 2,
        title: "PENDING",
        value: statsData.pending_complaint || 0,
        icon: Clock,
        color: "bg-[#f4b400]", // Yellow/Gold
      },
      {
        id: 3,
        title: "UNDER PROCESSING",
        value: statsData.underprocessing_complaint || 0,
        icon: RefreshCw,
        color: "bg-[#f26f21]", // Orange
      },
      {
        id: 4,
        title: "DISPOSED",
        value: statsData.completed_complaint || 0,
        icon: CheckCircle,
        color: "bg-[#1e8e3e]", // Green
      },
    ];
  }, [statsData]);

  // --- STATUS BADGES (Exact Match to Screenshot) ---
  const getStatusColor = (status) => {
    if (status === "Disposed") return "bg-[#d1e7dd] text-[#1e8e3e]"; // Light green text
    if (status === "Under Processing") return "bg-[#fff3cd] text-[#f26f21]"; // Light orange
    return "bg-[#e2e3e5] text-[#383d41]"; // Light gray for Pending
  };

  const gridTemplate = "grid-cols-[1.2fr_1.5fr_1fr_1fr_0.6fr]";
  const totalPages = Math.ceil(recentComplaints.length / perPage) || 1;

  return (
    <div className="app_card bg-slate-50/30 overflow-hidden rounded-lg border border-gray-200 shadow-md bg-white">
      {/* HEADER */}
     <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg text-[#1b2a5e]">Dashboard</h2>
      </div>



<div className="p-4 md:p-5 space-y-3 ">
      {/* STATS CARDS */}
      <div className="mb-8">
        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stats.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
                  style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[12px] uppercase font-bold text-gray-500 mb-1 truncate tracking-tight">
                      {item.title}
                    </p>
                    <h3 className="text-[22px] font-extrabold text-gray-900 leading-tight">
                      {item.value}
                    </h3>
                  </div>
                  <div className={`p-2 rounded ${item.color} text-white flex-shrink-0`}>
                    <IconComponent size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECENT COMPLAINTS SECTION */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-[#1b2a5e]" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[#1b2a5e]">
              Recent Complaints
            </h3>
          </div>
          <Link
            to="/admin/complaints"
            className="text-sm font-semibold text-[#1b2a5e] hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* TABLE AREA */}
        <div className="relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <Loader2 className="animate-spin text-[#1b2a5e]" size={32} />
            </div>
          )}

          {/* MOBILE CARD VIEW */}
          <div className="lg:hidden p-4 space-y-4">
            {recentComplaints.length === 0 ? (
              <div className="py-20 text-center text-gray-500 italic">
                No recent complaints.
              </div>
            ) : (
              recentComplaints.map((row, index) => (
                <div key={row.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">Sr.No. {index + 1}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(row.complaint_status)}`}>
                      {row.complaint_status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Complaint No:</span>
                      <span className="font-bold text-[#1b2a5e]">{row.complaint_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Complainant:</span>
                      <span className="font-medium text-gray-800">{row.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-gray-800">{row.complaint_date}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link
                      to={`/admin/complaints/${row.id}`}
                      className="flex items-center justify-center gap-2 w-full bg-[#eef2ff] text-[#1b2a5e] py-2 rounded font-bold text-xs uppercase hover:bg-[#e0e7ff] transition-colors"
                    >
                      <Eye size={14} /> View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden lg:block overflow-x-auto">
            <ListTable columns={gridTemplate}>
              {{
                header: (
                  <ListHeader>
                    <div className="ml-5">COMPLAINT NO</div>
                    <div>COMPLAINANT</div>
                    <div>DATE</div>
                    <div>STATUS</div>
                    <div>ACTION</div>
                  </ListHeader>
                ),
                rows:
                  recentComplaints.length > 0 ? (
                    recentComplaints.map((row) => (
                      <ListRow
                        key={row.id}
                        columns={gridTemplate}
                        className="hover:bg-gray-50 transition-colors items-center"
                      >
                        <span className="ml-5 font-semibold text-[#1b2a5e] truncate">
                          {row.complaint_no}
                        </span>
                        <span className="truncate text-gray-700 font-medium">
                          <Tooltip title={row.full_name}>
                            <span className="cursor-help">{row.full_name}</span>
                          </Tooltip>
                        </span>
                        <span className="text-gray-600">
                          {row.complaint_date}
                        </span>
                        <span>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${getStatusColor(row.complaint_status)}`}>
                            {row.complaint_status}
                          </span>
                        </span>
                        <span>
                          <Tooltip title="View Details">
                            <Link
                              to={`/admin/complaints/${row.id}`}
                              className="text-[#1b2a5e] hover:underline flex items-center font-bold text-xs uppercase transition-colors"
                            >
                              <Eye size={16} className="mr-1" /> View
                            </Link>
                          </Tooltip>
                        </span>
                      </ListRow>
                    ))
                  ) : (
                    <div className="py-20 text-center text-gray-400 italic w-full">
                      No recent complaints.
                    </div>
                  ),
              }}
            </ListTable>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <ListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              visiblePages={[0]} 
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Dashboard;