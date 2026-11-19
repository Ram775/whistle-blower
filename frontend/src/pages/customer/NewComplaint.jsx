import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Upload,
    ArrowLeft,
    ShieldCheck,
    Mail,
    CheckCircle2,
    Loader2,
    FileCheck,
    X,
    Send
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { masterService } from '../../services/masterService';
import toast from 'react-hot-toast';

const NewComplaint = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [angles, setAngles] = useState([]);
    const [disclosures, setDisclosures] = useState([]);
    
    const [formData, setFormData] = useState({
        determinationof_vigilance_angle_id: '',
        disclosure_against: '',
        complaint_description: '',
        remarks: ''
    });
    const [complaintDoc, setComplaintDoc] = useState(null);

    // OTP
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpToken, setOtpToken] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [disclosureRes, angleRes] = await Promise.all([
                    masterService.getPublicDisclosures(),
                    masterService.getPublicVigilanceAngles()
                ]);
                if (disclosureRes.data) setDisclosures(disclosureRes.data);
                if (angleRes.data) setAngles(angleRes.data);
            } catch (err) {
                toast.error('Failed to load form data');
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        setOtpLoading(true);
        try {
            const response = await complaintService.sendOtp(JSON.parse(localStorage.getItem('user'))?.email_id);
            if (response.success) {
                setOtpToken(response.otp_token);
                setOtpSent(true);
                toast.success('OTP sent to your email!');
            }
        } catch (err) {
            toast.error('Failed to send OTP.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otpSent) {
            toast.error('Please click "Send OTP" first.');
            return;
        }
        setLoading(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
        submitData.append('otp', otp);
        submitData.append('otp_token', otpToken);
        if (complaintDoc) submitData.append('complaint_document', complaintDoc);

        try {
            const response = await complaintService.submitNewComplaint(submitData);
            if (response.success) {
                toast.success('Complaint registered successfully!');
                navigate('/dashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register complaint.');
        } finally {
            setLoading(false);
        }
    };

    const userEmail = JSON.parse(localStorage.getItem('user'))?.email_id;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
            <div className="w-full mx-auto space-y-4">
                
                {/* Back Navigation */}
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1b2a5e] hover:underline cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>

                {/* Main Card */}
                <div className="bg-white app_card rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-[#1b2a5e] to-[#2c428c] px-6 py-5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                                    Register New Complaint
                                </h2>
                                <p className="text-xs text-[#d2dfff] mt-0.5">
                                    Submit a confidential vigilance disclosure
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/10 text-[#d2dfff] px-3 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" /> Confidential
                        </span>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                        
                        {/* Dropdowns Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#1b2a5e] mb-1.5">
                                    Vigilance Angle <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="determinationof_vigilance_angle_id"
                                    value={formData.determinationof_vigilance_angle_id}
                                    required
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b2a5e]/20 focus:border-[#1b2a5e] transition-all"
                                >
                                    <option value="">Select Vigilance Angle</option>
                                    {angles.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#1b2a5e] mb-1.5">
                                    Disclosure Against <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="disclosure_against"
                                    value={formData.disclosure_against}
                                    required
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b2a5e]/20 focus:border-[#1b2a5e] transition-all"
                                >
                                    <option value="">Select Disclosure Against</option>
                                    {disclosures.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Complaint Description */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b2a5e] mb-1.5">
                                Complaint Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="complaint_description"
                                value={formData.complaint_description}
                                required
                                rows="4"
                                placeholder="Provide detailed facts, dates, and individuals involved in the incident..."
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b2a5e]/20 focus:border-[#1b2a5e] transition-all"
                            />
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b2a5e] mb-1.5">
                                Additional Remarks <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                rows="2"
                                placeholder="Any supporting context or additional notes..."
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b2a5e]/20 focus:border-[#1b2a5e] transition-all"
                            />
                        </div>

                        {/* Document Upload */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b2a5e] mb-1.5">
                                Supporting Document <span className="text-gray-400 font-normal normal-case">(PDF only, Optional)</span>
                            </label>

                            {!complaintDoc ? (
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#1b2a5e] rounded-lg p-5 bg-gray-50 hover:bg-[#d2dfff]/20 transition-all cursor-pointer">
                                    <Upload className="w-6 h-6 text-[#1b2a5e] mb-1.5" />
                                    <span className="text-sm font-semibold text-[#1b2a5e]">
                                        Click to upload supporting PDF
                                    </span>
                                    <span className="text-xs text-gray-500 mt-0.5">
                                        Only .pdf format is supported
                                    </span>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setComplaintDoc(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="flex items-center justify-between px-4 py-3 bg-[#d2dfff]/40 border border-[#1b2a5e]/20 rounded-lg">
                                    <div className="flex items-center gap-2.5 truncate">
                                        <FileCheck className="w-5 h-5 text-[#1b2a5e] flex-shrink-0" />
                                        <div className="truncate">
                                            <p className="text-sm font-semibold text-[#1b2a5e] truncate">
                                                {complaintDoc.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(complaintDoc.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setComplaintDoc(null)}
                                        className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors cursor-pointer"
                                        title="Remove file"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* OTP Verification Section */}
                        <div className="bg-[#d2dfff]/30 p-4 sm:p-5 rounded-lg border border-[#1b2a5e]/15 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-[#1b2a5e] flex items-center gap-1.5">
                                        <Mail className="w-4 h-4" />
                                        <span>Email Verification</span>
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {userEmail
                                            ? `Verify your identity via OTP sent to ${userEmail}`
                                            : 'Verify your registered email address before submitting'}
                                    </p>
                                </div>
                                {otpSent && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> OTP Sent
                                    </span>
                                )}
                            </div>

                            {!otpSent ? (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpLoading || loading}
                                    className="inline-flex items-center gap-2 bg-[#1b2a5e] hover:bg-[#2c428c] text-white font-semibold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-60 cursor-pointer"
                                >
                                    {otpLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Sending OTP...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Send Verification OTP</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="px-3.5 py-2 bg-white border border-gray-300 rounded-lg w-44 text-center text-sm font-bold text-[#1b2a5e] tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1b2a5e]/20 focus:border-[#1b2a5e]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={otpLoading}
                                        className="text-xs font-bold text-[#1b2a5e] hover:underline cursor-pointer disabled:opacity-50"
                                    >
                                        {otpLoading ? 'Resending...' : 'Resend OTP'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Submit Action */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1b2a5e] hover:bg-[#2c428c] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Submitting Complaint...</span>
                                    </>
                                ) : (
                                    <span>Submit Complaint</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewComplaint;