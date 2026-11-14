import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { userService } from '../../services/userService';
import DataTable from '../../components/admin/DataTable';
import toast from 'react-hot-toast';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            if (response.status) {
                setUsers(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === '1' ? '0' : '1';
        try {
            const response = await userService.changeUserStatus(id, newStatus);
            if (response.status) {
                toast.success('User status updated!');
                fetchUsers();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
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
                    <button className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="w-4 h-4" /></button>
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