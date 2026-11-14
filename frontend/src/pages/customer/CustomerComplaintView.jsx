import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Clock, FileDown } from 'lucide-react'; // ✅ FileDown add kiya
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

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!complaint) return <div className="text-center mt-10 text-red-500">Complaint not found!</div>;

    const histories = complaint.complaint_status_history || [];

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => navigate('/customer/dashboard')} className="flex items-center text-blue-600 font-medium hover:underline">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </button>
                    
                    {/* ✅ PDF Download Button */}
                    <button 
                        onClick={handleDownloadPdf}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition shadow-sm"
                    >
                        <FileDown className="w-5 h-5 mr-2" /> Download PDF
                    </button>
                </div>

                <div className="flex items-center space-x-3 mb-6 border-b pb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{complaint.complaint_no}</h2>
                        <p className="text-sm text-gray-500">Registered on: {new Date(complaint.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Description</h3>
                            <p className="bg-gray-50 p-3 rounded mt-1 text-sm">{complaint.complaint_description}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Remarks</h3>
                            <p className="bg-gray-50 p-3 rounded mt-1 text-sm">{complaint.remarks || 'N/A'}</p>
                        </div>
                        {complaint.complaint_document && (
                            <a href={`${import.meta.env.VITE_UPLOAD_BASE_URL}/complaintdocument/${complaint.complaint_document}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                                <Download className="w-4 h-4 mr-1" /> Download Complaint Document
                            </a>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><Clock className="w-5 h-5 mr-1" /> Status History</h3>
                        <div className="space-y-3">
                            {histories.map((h, idx) => (
                                <div key={idx} className="border-l-2 border-blue-500 pl-4 py-1 relative">
                                    <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[5.5px] top-2"></div>
                                    <p className="text-sm font-semibold">
                                        {h.complaint_status == 1 ? 'Pending' : h.complaint_status == 2 ? 'Under Processing' : 'Disposed'}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-1">{new Date(h.created_at).toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">{h.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerComplaintView;