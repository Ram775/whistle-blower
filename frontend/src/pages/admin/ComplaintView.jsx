import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, FileText, Clock, Download, FileDown, Loader2, ShieldAlert } from "lucide-react";
import api from "../../api/axios";
import { complaintService } from "../../services/complaintService";
import toast from "react-hot-toast";

const ComplaintView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [statusData, setStatusData] = useState({ complaint_status: "", comment: "" });

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await api.get(`/complaints/admin/${id}`);
      if (response.data.status) {
        setComplaint(response.data.data);
        setStatusData({
          complaint_status: String(response.data.data.complaint_status),
          comment: "",
        });
      }
    } catch (error) {
      toast.error("Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const response = await complaintService.updateComplaintStatus(id, statusData);
      if (response.status) {
        toast.success("Status updated successfully!");
        fetchComplaint(); // Refresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdateLoading(false);
    }
  };

  // PDF Download Function
  const handleDownloadPdf = () => {
    const token = localStorage.getItem("token");
    const pdfUrl = `${import.meta.env.VITE_API_BASE_URL}/complaints/pdf/${id}?token=${token}`;
    window.open(pdfUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#1b2a5e]">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading complaint details...
      </div>
    );
  }

  if (!complaint) {
    return <div className="p-10 text-center text-red-500 font-bold bg-white rounded-lg shadow-sm border border-gray-200">Complaint not found!</div>;
  }

  const user = complaint.user || {};
  const disclosure = complaint.disclosureDetail || {};
  const angle = complaint.determinationofvigilanceangle || {};
  const histories = complaint.complaint_status_history || [];

  // Input styling class
  const inputClass = "w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="w-full mx-auto space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/complaints")}
            className="p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors border border-gray-200"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1b2a5e] tracking-tight">Complaint Details</h1>
            <p className="text-sm text-[#1b2a5e] font-semibold tracking-wide">{complaint.complaint_no}</p>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition-all text-sm font-semibold shadow-sm active:scale-95"
        >
          <FileDown className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Details) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Complaint Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-bold text-[#1b2a5e] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Complaint Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <span className="text-gray-500 font-medium block mb-1">Vigilance Angle</span>
                <span className="font-semibold text-gray-800 bg-slate-50 p-2 rounded block border border-gray-100">
                  {angle.name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium block mb-1">Disclosure Against</span>
                <span className="font-semibold text-gray-800 bg-slate-50 p-2 rounded block border border-gray-100">
                  {disclosure.name || "N/A"}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 font-medium block mb-1">Description</span>
                <p className="text-gray-800 bg-slate-50 p-3 rounded border border-gray-100 leading-relaxed whitespace-pre-wrap">
                  {complaint.complaint_description}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 font-medium block mb-1">Remarks</span>
                <p className="text-gray-800 bg-slate-50 p-3 rounded border border-gray-100 leading-relaxed whitespace-pre-wrap">
                  {complaint.remarks || "N/A"}
                </p>
              </div>
              
              {complaint.complaint_document && (
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-100">
                  <a
                    href={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${complaint.complaint_document}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-[#1b2a5e] hover:text-blue-800 hover:underline bg-blue-50 px-4 py-2 rounded transition-colors border border-blue-100"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Complaint Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Complainant Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-bold text-[#1b2a5e] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <User className="w-5 h-5" /> Complainant Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Full Name</span>
                <span className="font-semibold text-gray-800">{user.first_name} {user.middle_name} {user.last_name}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Email Address</span>
                <span className="font-semibold text-gray-800">{user.email_id || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Mobile Number</span>
                <span className="font-semibold text-gray-800">{user.mobile_no || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Gender</span>
                <span className="font-semibold text-gray-800">{user.gender || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">ID Type & Number</span>
                <span className="font-semibold text-gray-800">{user.id_type ? `${user.id_type} - ${user.id_number}` : "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Date of Birth</span>
                <span className="font-semibold text-gray-800">{user.dob || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Eligibility</span>
                <span className="font-semibold text-gray-800">{user.eligibility_of_whistle_blower || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">SR Number</span>
                <span className="font-semibold text-gray-800">{user.sr_number || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Status & History) */}
        <div className="space-y-6">
          
          {/* Update Status Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#d2dfff]/40 p-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-[#1b2a5e] flex items-center gap-2">
                <Clock className="w-5 h-5" /> Update Status
              </h2>
            </div>
            <div className="p-5">
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Status</label>
                  <select
                    value={statusData.complaint_status}
                    onChange={(e) => setStatusData({ ...statusData, complaint_status: e.target.value })}
                    className={inputClass}
                    required
                  >
                    <option value="1">Pending</option>
                    <option value="2">Under Processing</option>
                    <option value="3">Disposed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Comment / Remarks</label>
                  <textarea
                    value={statusData.comment}
                    onChange={(e) => setStatusData({ ...statusData, comment: e.target.value })}
                    className={`${inputClass} resize-none`}
                    rows="3"
                    placeholder="Write update remarks here..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#1b2a5e] text-white py-2 rounded hover:bg-blue-800 transition-all disabled:bg-gray-400 font-semibold shadow-sm text-sm"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-bold text-[#1b2a5e] mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> History Timeline
            </h2>
            <div className="space-y-0">
              {histories.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No history available.</p>
              ) : null}
              
              {histories.map((h, idx) => {
                const isLast = idx === histories.length - 1;
                return (
                  <div key={idx} className="relative pl-6 pb-6">
                    {/* Vertical Line */}
                    {!isLast && <div className="absolute top-2 left-[5px] bottom-0 w-0.5 bg-gray-200"></div>}
                    
                    {/* Timeline Dot */}
                    <div className="absolute top-1.5 left-0 w-3 h-3 bg-white border-2 border-[#1b2a5e] rounded-full shadow-sm"></div>
                    
                    <div className="bg-gray-50 rounded p-3 border border-gray-100">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-[#1b2a5e]">
                          {h.complaint_status == 1 ? "Pending" : h.complaint_status == 2 ? "Under Processing" : "Disposed"}
                        </p>
                        <span className="text-[10px] font-semibold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                          {new Date(h.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{h.comment || "No remarks provided."}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <User size={12} className="text-gray-400" />
                        <p className="text-[11px] font-medium text-gray-500">
                          By: {h.User ? `${h.User.first_name} ${h.User.last_name}` : "System"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintView;