import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Filter } from 'lucide-react';
import { getComplaints } from '../../api/complaintApi';
import DataTable from '../../components/admin/DataTable';

const ComplaintList = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'Pending', 'Under Processing', 'Disposed'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getComplaints();
            if (res.status) {
                setComplaints(res.data);
                setFilteredComplaints(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'All') {
            setFilteredComplaints(complaints);
        } else {
            setFilteredComplaints(complaints.filter(c => c.complaint_status === tab));
        }
    };

    const columns = [
        { header: 'Sr No', accessor: 'srno' },
        { header: 'Complaint No', accessor: 'complaint_no', render: (row) => <span className="font-semibold text-blue-600">{row.complaint_no}</span> },
        { header: 'Complainant', accessor: 'full_name' },
        { header: 'Event', accessor: 'event' },
        { header: 'Date', accessor: 'complaint_date' },
        { 
            header: 'Status', 
            accessor: 'complaint_status',
            render: (row) => {
                let color = 'bg-yellow-100 text-yellow-800';
                if (row.complaint_status === 'Under Processing') color = 'bg-orange-100 text-orange-800';
                if (row.complaint_status === 'Disposed') color = 'bg-green-100 text-green-800';
                return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{row.complaint_status}</span>;
            }
        },
        { 
            header: 'Action', 
            accessor: 'id',
            render: (row) => (
                <Link 
                    to={`/admin/complaints/${row.id}`} 
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                >
                    <Eye className="w-4 h-4" /> View
                </Link>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">All Complaints</h1>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Table */}
            <DataTable 
                columns={columns} 
                data={filteredComplaints} 
                loading={loading} 
                emptyMessage="No complaints found for this category."
            />
        </div>
    );
};

export default ComplaintList;