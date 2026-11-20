import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  FileCheck,
  Loader2,
  Save,
  Download,
  FileText,
} from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { masterService } from "../../services/masterService";
import toast from "react-hot-toast";

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [angles, setAngles] = useState([]);
  const [disclosures, setDisclosures] = useState([]);

  const [formData, setFormData] = useState({
    determinationof_vigilance_angle_id: "",
    disclosure_against: "",
    complaint_description: "",
    remarks: "",
  });
  const [complaintDoc, setComplaintDoc] = useState(null);
  const [existingDoc, setExistingDoc] = useState(null); // ✅ Purana document

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintRes, anglesRes, disclosuresRes] = await Promise.all([
          complaintService.getEditComplaint(id),
          masterService.getPublicVigilanceAngles(),
          masterService.getPublicDisclosures(),
        ]);

        if (anglesRes.data) setAngles(anglesRes.data);
        if (disclosuresRes.data) setDisclosures(disclosuresRes.data);

        if (complaintRes.status) {
          const c = complaintRes.data;
          setFormData({
            determinationof_vigilance_angle_id:
              c.determinationof_vigilance_angle_id || "",
            disclosure_against: c.disclosure_against || "",
            complaint_description: c.complaint_description || "",
            remarks: c.remarks || "",
          });
          // ✅ Purana document set karo
          if (c.complaint_document) {
            setExistingDoc(c.complaint_document);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load complaint.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("File size must be less than 1MB.");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }
    setComplaintDoc(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const submitData = new FormData();
    Object.keys(formData).forEach((key) =>
      submitData.append(key, formData[key]),
    );
    if (complaintDoc) submitData.append("complaint_document", complaintDoc);

    try {
      const response = await complaintService.updateComplaint(id, submitData);
      if (response.status) {
        toast.success("Complaint updated successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update complaint.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b2a5e]/20 focus:border-[#1b2a5e] transition-all";
  const labelClass =
    "block text-xs font-bold uppercase tracking-wider text-[#1b2a5e] mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1b2a5e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-5 px-4">
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center justify-center gap-2  text-blue-900 px-1 py-2 text-xs font-semibold  transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>
      <div className=" w-full mx-auto bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1b2a5e] to-[#2c428c] px-6 py-5 text-white">
          <h2 className="text-xl font-bold">Edit Complaint</h2>
          <p className="text-xs text-[#d2dfff] mt-1">
            Update your complaint details. Original submission time cannot be
            changed.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-3 rounded-r-lg text-sm">
              {error}
            </div>
          )}

          {/* Vigilance Angle */}
          <div>
            <label className={labelClass}>
              Vigilance Angle <span className="text-red-500">*</span>
            </label>
            <select
              name="determinationof_vigilance_angle_id"
              value={formData.determinationof_vigilance_angle_id}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select Vigilance Angle</option>
              {angles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Disclosure Against */}
          <div>
            <label className={labelClass}>
              Disclosure Against <span className="text-red-500">*</span>
            </label>
            <select
              name="disclosure_against"
              value={formData.disclosure_against}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select Disclosure Against</option>
              {disclosures.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Complaint Description */}
          <div>
            <label className={labelClass}>
              Complaint Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="complaint_description"
              value={formData.complaint_description}
              onChange={handleChange}
              required
              rows="4"
              className={inputClass}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className={labelClass}>Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="2"
              className={inputClass}
            />
          </div>

          {/* ==================== DOCUMENT SECTION ==================== */}
          <div>
            <label className={labelClass}>
              Supporting Document (PDF, max 1MB)
            </label>

            {/* ✅ Purana Document (agar exist karta hai aur naya upload nahi hua) */}
            {existingDoc && !complaintDoc && (
              <div className="mb-3 flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-blue-800 truncate">
                      Current Document
                    </p>
                    <p className="text-[11px] text-gray-600 truncate">
                      {existingDoc.split("/").pop()}
                    </p>
                  </div>
                </div>
                <a
                  href={`${import.meta.env.VITE_UPLOAD_BASE_URL}/complaintdocument/${existingDoc}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs px-3 py-1.5 rounded bg-white border border-blue-300 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4" />
                  View / Download
                </a>
              </div>
            )}

            {/* Upload Option */}
            {!complaintDoc ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#1b2a5e] rounded-lg p-4 bg-gray-50 hover:bg-[#d2dfff]/20 cursor-pointer">
                <Upload className="w-5 h-5 text-[#1b2a5e] mb-1" />
                <span className="text-xs font-bold text-[#1b2a5e]">
                  {existingDoc
                    ? "Click to replace with new PDF"
                    : "Click to upload PDF"}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5">
                  PDF only, Max 1MB
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#d2dfff]/40 border border-[#1b2a5e]/20 rounded-lg">
                <div className="flex items-center gap-2.5 truncate">
                  <FileCheck className="w-5 h-5 text-[#1b2a5e] shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#1b2a5e] truncate">
                      {complaintDoc.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {(complaintDoc.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setComplaintDoc(null)}
                  className="p-1 text-gray-500 hover:text-red-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 btn_base btn_secondary text-[#1b2a5e] border border-[#1b2a5e]/30 hover:bg-[#d2dfff]/30 font-semibold px-5 py-2.5 rounded-lg text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex btn_primary btn_base items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComplaint;
