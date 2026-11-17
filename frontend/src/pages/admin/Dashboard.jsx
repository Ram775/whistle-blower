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
  UserCheck,
  TrendingUp,
  AlertCircle,
  Calendar,
  LayoutDashboard,
} from "lucide-react";
import { userService } from "../../services/userService";
import { complaintService } from "../../services/complaintService";
import toast from "react-hot-toast";
import { Tooltip } from "antd";

// UI Components (Same as AdminDashboard)
import ListTable from "../../components/ui/ListTable";
import ListHeader from "../../components/ui/ListHeader";
import ListRow from "../../components/ui/ListRow";
import ListPagination from "../../components/ui/ListPagination";
import TextHighlighter from "../../components/ui/TextHighlighter";

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    registered_complaint: 0,
    pending_complaint: 0,
    underprocessing_complaint: 0,
    completed_complaint: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock pagination state for recent complaints (since we only show 5)
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
          setRecentComplaints(complaintsRes.data.slice(0, 5));
        }
      } catch (error) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- DYNAMIC STATS CARDS LOGIC (From 1st Code) ---
  const stats = useMemo(() => {
    return [
      {
        id: 1,
        title: "Total Complaints",
        value: statsData.registered_complaint || 0,
        icon: FileText,
        color: "bg-blue-500",
      },
      {
        id: 2,
        title: "Pending",
        value: statsData.pending_complaint || 0,
        icon: Clock,
        color: "bg-yellow-400",
      },
      {
        id: 3,
        title: "Under Processing",
        value: statsData.underprocessing_complaint || 0,
        icon: RefreshCw,
        color: "bg-orange-500",
      },
      {
        id: 4,
        title: "Disposed",
        value: statsData.completed_complaint || 0,
        icon: CheckCircle,
        color: "bg-green-500",
      },
    ];
  }, [statsData]);

  // --- HELPERS FOR RECENT COMPLAINTS TABLE ---
  const getStatusColor = (status) => {
    if (status === "Disposed") return "bg-green-100 text-green-800";
    if (status === "Under Processing") return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const gridTemplate = "grid-cols-[1.2fr_1.5fr_1fr_1fr_0.6fr]";
  const totalPages = Math.ceil(recentComplaints.length / perPage) || 1;

  return (
    <div className="app_card p-4 bg-[#f8f9fa]">
      <div className="car_header mx-auto">
        <div className="mb-4 flex justify-between">
          <h2 className="font-bold text-xl text-gray-800">Dashboard </h2>
        </div>

        {/* Dashboard Statistics Cards - Dynamic */}
        <div className="mb-6">
          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
                >
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
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow group"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[11px] uppercase font-bold text-gray-600 mb-1 truncate tracking-tight">
                        {item.title}
                      </p>
                      <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                        {item.value}
                      </h3>
                    </div>
                    <div
                      className={`p-2 rounded-lg ${item.color} text-white shadow-sm flex-shrink-0`}
                    >
                      <IconComponent className="text-current" size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Complaints Section (Table Style Same as AdminDashboard) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          
          {/* HEADER */}
          <div className="card_header flex items-center gap-3 justify-between w-full flex-wrap p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-blue-500" aria-hidden="true" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                Recent Complaints
              </h3>
            </div>
            <div className="flex items-center gap-5">
              <Link
                to="/admin/complaints"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All →
              </Link>
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-[1px]">
                <Loader2 className="animate-spin text-[#082164]" size={32} />
              </div>
            )}

            {/* 📱 MOBILE CARD VIEW */}
            <div className="lg:hidden p-4 space-y-4">
              {recentComplaints.length === 0 ? (
                <div className="py-20 text-center text-gray-400 italic">
                  No recent complaints.
                </div>
              ) : (
                recentComplaints.map((row, index) => (
                  <div
                    key={row.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                      <span className="text-xs text-gray-500 font-medium">
                        Sr.No. {index + 1}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.complaint_status)}`}
                      >
                        {row.complaint_status}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Complaint No:</span>
                        <span className="font-bold text-blue-600 text-sm">
                          {row.complaint_no}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Complainant:</span>
                        <span className="font-medium text-gray-800 text-sm">
                          {row.full_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Date:</span>
                        <span className="text-gray-800 text-sm">
                          {row.complaint_date}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-100">
                      <Link
                        to={`/admin/complaints/${row.id}`}
                        className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-700 py-2 rounded-lg font-bold text-xs uppercase hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={14} /> View Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 💻 DESKTOP VIEW */}
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
                      recentComplaints.map((row, index) => (
                        <ListRow
                          key={row.id}
                          columns={gridTemplate}
                          className="hover:bg-blue-50/40 transition-colors items-center"
                        >
                          <span className="ml-5 font-semibold text-blue-600 truncate">
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
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.complaint_status)}`}
                            >
                              {row.complaint_status}
                            </span>
                          </span>
                          <span>
                            <Tooltip title="View Details">
                              <Link
                                to={`/admin/complaints/${row.id}`}
                                className="text-blue-600 hover:text-blue-800 flex items-center font-bold text-xs uppercase transition-colors"
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

          {/* PAGINATION (Optional for 5 items, but kept to match UI) */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100">
              <ListPagination
                currentPage={currentPage}
                totalPages={totalPages}
                visiblePages={[0]} // Static since max 1 page for 5 items
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