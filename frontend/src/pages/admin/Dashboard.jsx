import { useState, useEffect } from 'react';
import { FileText, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/admin/StatCard';

const Dashboard = () => {
    const [stats, setStats] = useState({
        registered_complaint: 0,
        pending_complaint: 0,
        underprocessing_complaint: 0,
        completed_complaint: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/users/dashboard');
                if (response.data.status) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center mt-10 text-gray-500">Loading Dashboard...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Complaints" 
                    value={stats.registered_complaint} 
                    icon={FileText} 
                    color="blue" 
                />
                <StatCard 
                    title="Pending" 
                    value={stats.pending_complaint || 0} 
                    icon={Clock} 
                    color="yellow" 
                />
                <StatCard 
                    title="Under Processing" 
                    value={stats.underprocessing_complaint} 
                    icon={RefreshCw} 
                    color="orange" 
                />
                <StatCard 
                    title="Disposed" 
                    value={stats.completed_complaint} 
                    icon={CheckCircle} 
                    color="green" 
                />
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
                <p className="text-gray-500">Recent complaints list will appear here...</p>
            </div>
        </div>
    );
};

export default Dashboard;