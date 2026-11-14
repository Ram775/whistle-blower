import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, RefreshCw, CheckCircle, Eye } from 'lucide-react';
import { userService } from '../../services/userService';
import { complaintService } from '../../services/complaintService';
import StatCard from '../../components/admin/StatCard';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        registered_complaint: 0,
        pending_complaint: 0,
        underprocessing_complaint: 0,
        completed_complaint: 0
    });
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, complaintsRes] = await Promise.all([
                    userService.getDashboardStats(),
                    complaintService.getAllComplaints()
                ]);
                
                if (statsRes.status) setStats(statsRes.data);
                
                if (complaintsRes.status) {
                    // Only take first 5 (latest)
                    setRecentComplaints(complaintsRes.data.slice(0, 5));
                }
            } catch (error) {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center mt-10 text-gray-500">Loading Dashboard...</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Under Processing': return 'bg-orange-100 text-orange-800';
            case 'Disposed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Complaints" value={stats.registered_complaint} icon={FileText} color="blue" />
                <StatCard title="Pending" value={stats.pending_complaint || 0} icon={Clock} color="yellow" />
                <StatCard title="Under Processing" value={stats.underprocessing_complaint} icon={RefreshCw} color="orange" />
                <StatCard title="Disposed" value={stats.completed_complaint} icon={CheckCircle} color="green" />
            </div>

            {/* Recent Complaints Table */}
            <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Recent Complaints</h2>
                    <Link to="/admin/complaints" className="text-sm text-blue-600 hover:underline">View All →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complainant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentComplaints.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No recent complaints.</td></tr>
                            ) : (
                                recentComplaints.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{row.complaint_no}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.complaint_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(row.complaint_status)}`}>
                                                {row.complaint_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link to={`/admin/complaints/${row.id}`} className="text-blue-600 hover:text-blue-800 flex items-center font-medium">
                                                <Eye className="w-4 h-4 mr-1" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;