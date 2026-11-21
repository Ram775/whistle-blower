
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  FileDown,
  ShieldCheck,
  CalendarDays,
  MessageSquare,
  Paperclip,
  Activity,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  FileCheck2,
} from "lucide-react";
import api from "../../api/axios";

const CustomerComplaintView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await api.get(`/complaints/my-complaints/${id}`);

        if (response.data.status) {
          setComplaint(response.data.data);
        }
      } catch (error) {
        console.error("Complaint fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  // PDF Download
  const handleDownloadPdf = () => {
    const token = localStorage.getItem("token");

    const pdfUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/complaints/pdf/${id}?token=${encodeURIComponent(token || "")}`;

    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  // Status Configuration
  const getStatusBadge = (statusValue) => {
    switch (Number(statusValue)) {
      case 1:
        return {
          label: "Pending",
          icon: Clock,
          classes: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };

      case 2:
        return {
          label: "Under Processing",
          icon: Activity,
          classes: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };

      case 3:
        return {
          label: "Disposed",
          icon: CheckCircle2,
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };

      default:
        return {
          label: "Unknown",
          icon: AlertCircle,
          classes: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-500",
        };
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-9 h-9 animate-spin text-[#1b2a5e]" />
          <p className="text-sm font-medium">
            Loading complaint details...
          </p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Complaint Not Found
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            The requested record may not exist or you do not have permission
            to view it.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center gap-2 bg-[#1b2a5e] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2c428c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const histories = complaint.complaint_status_history || [];

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4 sm:px-6">
      <div className="w-full mx-auto space-y-3">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1b2a5e] hover:text-[#2c428c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex btn_base btn_primary items-center justify-center gap-2 bg-[#1b2a5e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2c428c] transition-all shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            Download Complaint PDF
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1b2a5e] to-[#2c428c] px-5 sm:px-7 py-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

              <div className="flex items-center gap-4">
                

                <div className="min-w-0">
                  <p className="text-xs text-blue-200 font-medium mb-1">
                    Complaint Reference Number
                  </p>

                  <h2 className="text-lg sm:text-2xl font-bold tracking-tight font-mono break-all">
                    {complaint.complaint_no}
                  </h2>

                  <p className="text-xs text-blue-100 mt-2 flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" />

                    Registered on:{" "}
                    {new Date(complaint.created_at).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              
            </div>
          </div>

          {/* Main Content */}
          <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

            {/* Left Column */}
            <div className="space-y-5">

              {/* Complaint Description */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#1b2a5e]" />
                  </div>

                  <h3 className="text-sm font-bold text-[#1b2a5e]">
                    Complaint Description
                  </h3>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {complaint.complaint_description || "No description provided."}
                </p>
              </div>

              {/* Remarks */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-700" />
                  </div>

                  <h3 className="text-sm font-bold text-[#1b2a5e]">
                    Remarks
                  </h3>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {complaint.remarks || "No remarks provided."}
                </p>
              </div>

              {/* Supporting Document */}
              {complaint.complaint_document && (
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-white border border-blue-100 flex items-center justify-center shrink-0">
                      <Paperclip className="w-5 h-5 text-[#1b2a5e]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        Supporting Document
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Attached complaint document
                      </p>
                    </div>

                    <a
                      href={`${
                        import.meta.env.VITE_UPLOAD_BASE_URL
                      }/complaintdocument/${encodeURIComponent(
                        complaint.complaint_document
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Download supporting document"
                      className="w-9 h-9 rounded-lg bg-[#1b2a5e] text-white flex items-center justify-center hover:bg-[#2c428c] transition-colors shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Status Timeline */}
            <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-gray-200">

              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-[#1b2a5e] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#1b2a5e]">
                    Status History
                  </h3>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Complaint progress and updates
                  </p>
                </div>
              </div>

              {histories.length === 0 ? (
                <div className="py-10 text-center">
                  <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />

                  <p className="text-sm font-semibold text-gray-500">
                    No Status History Available
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Updates will appear here once available.
                  </p>
                </div>
              ) : (
                <div className="relative space-y-6 pl-1">

                  {histories.map((h, idx) => {
                    const statusObj = getStatusBadge(h.complaint_status);
                    const StatusIcon = statusObj.icon;

                    return (
                      <div
                        key={h.id || idx}
                        className="relative flex gap-3"
                      >
                        {/* Timeline Connector */}
                        {idx !== histories.length - 1 && (
                          <div className="absolute left-[17px] top-10 bottom-[-24px] w-0.5 bg-gray-200" />
                        )}

                        {/* Status Icon */}
                        <div className="relative z-10 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                          <StatusIcon className="w-4 h-4 text-[#1b2a5e]" />
                        </div>

                        {/* Status Details */}
                        <div className="flex-1 min-w-0 pb-1">

                          <div className="flex flex-wrap items-center justify-between gap-2">

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${statusObj.classes}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
                              {statusObj.label}
                            </span>

                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />

                              {new Date(h.created_at).toLocaleString(
                                "en-GB",
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }
                              )}
                            </span>
                          </div>

                          {h.comment && (
                            <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {h.comment}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-7 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Your complaint information is confidential.
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FileCheck2 className="w-4 h-4" />
              Complaint Details
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerComplaintView;


