import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, Clock, Download, FileDown } from 'lucide-react';
import api from '../../api/axios';
import { complaintService } from '../../services/complaintService'; // ✅ IMPORT ADD KIYA
import toast from 'react-hot-toast';

const ComplaintView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [statusData, setStatusData] = useState({ complaint_status: '', comment: '' });

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    const fetchComplaint = async () => {
        try {
            // Yahan bhi service use kar sakte hain, par abhi direct api call chalega
            const response = await api.get(`/complaints/admin/${id}`);
            if (response.data.status) {
                setComplaint(response.data.data);
                setStatusData({
                    complaint_status: String(response.data.data.complaint_status),
                    comment: ''
                });
            }
        } catch (error) {
            toast.error('Failed to load complaint details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);

        try {
            // ✅ Service call
            const response = await complaintService.updateComplaintStatus(id, statusData);
            if (response.status) {
                toast.success('Status updated successfully!');
                fetchComplaint(); // Refresh data
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdateLoading(false);
        }
    };

    // ✅ PDF Download Function
    const handleDownloadPdf = () => {
        const token = localStorage.getItem('token');
        const pdfUrl = `${import.meta.env.VITE_API_BASE_URL}/complaints/pdf/${id}?token=${token}`;
        window.open(pdfUrl, '_blank');
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!complaint) return <div className="text-center mt-10 text-red-500">Complaint not found!</div>;

    const user = complaint.user || {};
    const disclosure = complaint.disclosureDetail || {};
    const angle = complaint.determinationofvigilanceangle || {};
    const histories = complaint.complaint_status_history || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header with PDF Button */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/admin/complaints')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Complaint Details</h1>
                        <p className="text-sm text-gray-500 font-medium">{complaint.complaint_no}</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleDownloadPdf}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition shadow-sm"
                >
                    <FileDown className="w-5 h-5 mr-2" /> Download PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column (Details) */}
                <div className="md:col-span-2 space-y-6">
                    {/* Complaint Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-500"/> Complaint Information</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-500 block">Vigilance Angle</span> <span className="font-medium">{angle.name || 'N/A'}</span></div>
                            <div><span className="text-gray-500 block">Disclosure Against</span> <span className="font-medium">{disclosure.name || 'N/A'}</span></div>
                            <div className="col-span-2"><span className="text-gray-500 block">Description</span> <p className="font-medium bg-gray-50 p-3 rounded mt-1">{complaint.complaint_description}</p></div>
                            <div className="col-span-2"><span className="text-gray-500 block">Remarks</span> <p className="font-medium bg-gray-50 p-3 rounded mt-1">{complaint.remarks || 'N/A'}</p></div>
                            {complaint.complaint_document && (
                                <div className="col-span-2 mt-2">
                                    <a href={`${import.meta.env.VITE_UPLOAD_BASE_URL}/complaintdocument/${complaint.complaint_document}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                                        <Download className="w-4 h-4 mr-1" /> Download Complaint Document
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Complainant Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><User className="w-5 h-5 mr-2 text-green-500"/> Complainant Information</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-500 block">Name</span> <span className="font-medium">{user.first_name} {user.middle_name} {user.last_name}</span></div>
                            <div><span className="text-gray-500 block">Email</span> <span className="font-medium">{user.email_id}</span></div>
                            <div><span className="text-gray-500 block">Mobile</span> <span className="font-medium">{user.mobile_no}</span></div>
                            <div><span className="text-gray-500 block">Gender</span> <span className="font-medium">{user.gender || 'N/A'}</span></div>
                            <div><span className="text-gray-500 block">ID Type & Number</span> <span className="font-medium">{user.id_type} - {user.id_number}</span></div>
                            <div><span className="text-gray-500 block">DOB</span> <span className="font-medium">{user.dob || 'N/A'}</span></div>
                            <div><span className="text-gray-500 block">Eligibility</span> <span className="font-medium">{user.eligibility_of_whistle_blower || 'N/A'}</span></div>
                            <div><span className="text-gray-500 block">SR Number</span> <span className="font-medium">{user.sr_number || 'N/A'}</span></div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Status & History) */}
                <div className="space-y-6">
                    {/* Update Status Form */}
                    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500"/> Update Status</h2>
                        <form onSubmit={handleStatusUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    value={statusData.complaint_status}
                                    onChange={(e) => setStatusData({...statusData, complaint_status: e.target.value})}
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="1">Pending</option>
                                    <option value="2">Under Processing</option>
                                    <option value="3">Disposed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment / Remarks</label>
                                <textarea 
                                    value={statusData.comment}
                                    onChange={(e) => setStatusData({...statusData, comment: e.target.value})}
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Write update remarks..."
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={updateLoading}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 font-medium"
                            >
                                {updateLoading ? 'Updating...' : 'Update Status'}
                            </button>
                        </form>
                    </div>

                    {/* Status History */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">History Timeline</h2>
                        <div className="space-y-4">
                            {histories.length === 0 ? <p className="text-gray-500 text-sm">No history available.</p> : null}
                            {histories.map((h, idx) => (
                                <div key={idx} className="border-l-2 border-gray-200 pl-4 py-1 relative">
                                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-2"></div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {h.complaint_status == 1 ? 'Pending' : h.complaint_status == 2 ? 'Under Processing' : 'Disposed'}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-1">{new Date(h.created_at).toLocaleString()}</p>
                                    <p className="text-sm text-gray-700">{h.comment}</p>
                                    <p className="text-xs text-gray-500 mt-1">By: {h.User ? `${h.User.first_name} ${h.User.last_name}` : 'System'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintView;