import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    FileText, 
    Download, 
    Clock, 
    FileDown, 
    ShieldCheck, 
    Calendar, 
    MessageSquare, 
    Paperclip, 
    Activity, 
    Loader2 
} from 'lucide-react';
import api from '../../api/axios';

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
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaint();
    }, [id]);

    // ✅ PDF Download Function
    const handleDownloadPdf = () => {
        const token = localStorage.getItem('token');
        const pdfUrl = `${import.meta.env.VITE_API_BASE_URL}/complaints/pdf/${id}?token=${token}`;
        window.open(pdfUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1b2a5e]" />
                    <p className="text-sm font-medium">Loading complaint details...</p>
                </div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center  w-full">
                    <p className="text-red-600 font-bold text-base mb-2">Complaint not found!</p>
                    <p className="text-xs text-gray-500 mb-6">The requested record may not exist or you do not have permission to view it.</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center justify-center gap-2 bg-[#1b2a5e] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#2c428c] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const histories = complaint.complaint_status_history || [];

    const getStatusBadge = (statusValue) => {
        switch (Number(statusValue)) {
            case 1:
                return { label: 'Pending', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dot: bg-amber-500' };
            case 2:
                return { label: 'Under Processing', classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dot: bg-blue-500' };
            case 3:
                return { label: 'Disposed', classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dot: bg-emerald-500' };
            default:
                return { label: 'Unknown', classes: 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20 dot: bg-slate-500' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
            <div className="w-full mx-auto space-y-5">
                
                {/* Top Action Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1b2a5e] hover:underline cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </button>
                    
                    {/* ✅ PDF Download Button */}
                    <button 
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                        <FileDown className="w-4 h-4" />
                        <span>Download Complaint PDF</span>
                    </button>
                </div>

                {/* Main Card Container */}
                <div className="bg-white app_card rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    
                    {/* Card Header Banner */}
                    <div className="bg-gradient-to-r from-[#1b2a5e] to-[#2c428c] px-6 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-mono">
                                    {complaint.complaint_no}
                                </h2>
                                <p className="text-xs text-[#d2dfff] mt-1 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Registered on: {new Date(complaint.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </p>
                            </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 text-white px-3.5 py-1.5 rounded-full backdrop-blur-sm self-start sm:self-center">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Confidential Disclosure
                        </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Left Column: Details & Attachments */}
                        <div className="space-y-6">
                            {/* Description Box */}
                            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/60 space-y-1.5">
                                <h3 className="text-xs font-bold text-[#1b2a5e] uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-gray-500" /> Complaint Description
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pt-1">
                                    {complaint.complaint_description}
                                </p>
                            </div>

                            {/* Remarks Box */}
                            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/60 space-y-1.5">
                                <h3 className="text-xs font-bold text-[#1b2a5e] uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4 text-gray-500" /> Remarks
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed pt-1">
                                    {complaint.remarks || 'No remarks provided.'}
                                </p>
                            </div>

                            {/* Document Download Link */}
                            {complaint.complaint_document && (
                                <div className="pt-2">
                                    <a 
                                        href={`${import.meta.env.VITE_UPLOAD_BASE_URL}/complaintdocument/${complaint.complaint_document}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="inline-flex items-center gap-2 bg-[#d2dfff]/40 hover:bg-[#d2dfff]/70 border border-[#1b2a5e]/20 text-[#1b2a5e] font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors"
                                    >
                                        <Paperclip className="w-4 h-4 text-[#1b2a5e]" />
                                        <span>Download Supporting Document (PDF)</span>
                                        <Download className="w-3.5 h-3.5 ml-1 opacity-70" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Status Timeline History */}
                        <div className="bg-slate-50/70 p-5 rounded-2xl border border-gray-200/80 flex flex-col">
                            <h3 className="text-sm font-bold text-[#1b2a5e] mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#1b2a5e]" />
                                <span>Status History & Progression</span>
                            </h3>

                            {histories.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-xs italic">
                                    No status history available yet.
                                </div>
                            ) : (
                                <div className="space-y-4 pl-2 relative before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-blue-200">
                                    {histories.map((h, idx) => {
                                        const statusObj = getStatusBadge(h.complaint_status);
                                        return (
                                            <div key={idx} className="relative pl-6 space-y-1">
                                                {/* Timeline dot */}
                                                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[1px] top-1 ring-4 ring-blue-50" />
                                                
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${statusObj.classes}`}>
                                                        {statusObj.label}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 font-mono">
                                                        {new Date(h.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>

                                                {h.comment && (
                                                    <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200/60 mt-1 shadow-2xs">
                                                        {h.comment}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerComplaintView;