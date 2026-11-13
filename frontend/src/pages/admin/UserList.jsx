import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            if (response.data.status) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === '1' ? '0' : '1';
        try {
            await api.post('/users/change_status', { status_id: id, status: newStatus });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Error changing status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        // Note: Backend me abhi single delete route nahi hai, but hum status inactive kar sakte hain
        // Agar multiple delete route hota to yahan use karte
        alert("Delete functionality will be added soon.");
    };

    const columns = [
        { header: 'Sr No', accessor: 'srno' },
        { header: 'Full Name', accessor: 'full_name', render: (row) => <span className="font-semibold">{row.full_name}</span> },
        { header: 'Email', accessor: 'email_id' },
        { header: 'Mobile', accessor: 'mobile_no' },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <button 
                    onClick={() => handleStatusToggle(row.id, row.status)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${row.status === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                    {row.status === '1' ? 'Active' : 'Inactive'}
                </button>
            )
        },
        {
            header: 'Action',
            accessor: 'id',
            render: (row) => (
                <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manage Users (Vigilance)</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 text-sm">
                    <UserPlus className="w-4 h-4 mr-2" /> Add New User
                </button>
            </div>

            <DataTable 
                columns={columns} 
                data={users} 
                loading={loading} 
                emptyMessage="No users found."
            />
        </div>
    );
};

export default UserList;