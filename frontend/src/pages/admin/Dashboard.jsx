import { useState, useEffect } from 'react';
import api from '../../api/axios';

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

    const cards = [
        { title: 'Total Complaints', value: stats.registered_complaint || stats.pending_complaint + stats.underprocessing_complaint + stats.completed_complaint, color: 'bg-blue-500', icon: '📋' },
        { title: 'Pending', value: stats.pending_complaint || 0, color: 'bg-yellow-500', icon: '⏳' },
        { title: 'Under Processing', value: stats.underprocessing_complaint || 0, color: 'bg-orange-500', icon: '🔄' },
        { title: 'Disposed', value: stats.completed_complaint || 0, color: 'bg-green-500', icon: '✅' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between border-l-4 border-transparent hover:border-blue-500 transition-all">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{card.title}</p>
                            <h2 className="text-3xl font-bold text-gray-800 mt-2">{card.value}</h2>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${card.color} bg-opacity-20`}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Complaints Table Placeholder */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
                <p className="text-gray-500">Recent complaints list will appear here...</p>
            </div>
        </div>
    );
};

export default Dashboard;