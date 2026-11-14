import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Plus, LogOut, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await complaintService.getMyComplaints();
                if (response.status) {
                    setComplaints(response.data);
                }
            } catch (error) {
                toast.error('Failed to load complaints');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/customer/login');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Under Processing': return 'bg-orange-100 text-orange-800';
            case 'Disposed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h1 className="text-xl font-bold text-gray-800">Whistleblower Portal</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Welcome, <span className="font-bold">{user?.first_name}</span></span>
                        <button onClick={handleLogout} className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium">
                            <LogOut className="w-4 h-4 mr-1" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Hello, {user?.first_name}!</h2>
                        <p className="text-blue-100 mt-1">Track your complaints and their status here.</p>
                    </div>
                    <Link to="/customer/new-complaint" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold flex items-center hover:bg-gray-100 transition-colors">
                        <Plus className="w-5 h-5 mr-1" /> New Complaint
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800">My Registered Complaints</h3>
                    </div>
                    
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : complaints.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                            <p>No complaints registered yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigilance Angle</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {complaints.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{row.complaint_no}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.complaint_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.event}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(row.complaint_status)}`}>
                                                    {row.complaint_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link to={`/customer/complaint/${row.id}`} className="text-blue-600 hover:text-blue-800 flex items-center font-medium">
                                                    <Eye className="w-4 h-4 mr-1" /> View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;