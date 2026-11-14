import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { userService } from '../../services/userService';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import toast from 'react-hot-toast';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Add/Edit Modal State
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '', middle_name: '', last_name: '',
        email_id: '', mobile_no: '', password: '', status: '1'
    });

    // Confirm Dialog State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

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

    const handleOpenModal = async (id = null) => {
        if (id) {
            setEditId(id);
            try {
                const res = await userService.getUserById(id);
                if (res.data) {
                    setFormData({
                        first_name: res.data.first_name || '',
                        middle_name: res.data.middle_name || '',
                        last_name: res.data.last_name || '',
                        email_id: res.data.email_id || '',
                        mobile_no: res.data.mobile_no || '',
                        password: '',
                        status: String(res.data.status)
                    });
                }
            } catch (error) {
                toast.error('Failed to load user');
            }
        } else {
            setEditId(null);
            setFormData({
                first_name: '', middle_name: '', last_name: '',
                email_id: '', mobile_no: '', password: '', status: '1'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // Empty password na bheje
                await userService.updateUser(editId, payload);
                toast.success('User updated successfully!');
            } else {
                await userService.createUser(formData);
                toast.success('User created successfully!');
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
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

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            // Note: Backend me single delete route nahi hai, hum status change karke inactive kar sakte hain
            // Ya fir tu backend me delete route add kar sakta hai
            await userService.changeUserStatus(deleteId, '0');
            toast.success('User deactivated successfully!');
            setConfirmOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error('Operation failed');
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
                    <button onClick={() => handleOpenModal(row.id)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteClick(row.id)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manage Users (Vigilance)</h1>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 text-sm">
                    <UserPlus className="w-4 h-4 mr-2" /> Add New User
                </button>
            </div>

            <DataTable 
                columns={columns} 
                data={users} 
                loading={loading} 
                emptyMessage="No users found."
            />

            {/* Add/Edit User Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit User' : 'Add New User'}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="First Name *" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required className="border p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="Middle Name" value={formData.middle_name} onChange={(e) => setFormData({...formData, middle_name: e.target.value})} className="border p-2 rounded-lg text-sm" />
                    </div>
                    <input type="text" placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="border p-2 rounded-lg w-full text-sm" />
                    <input type="email" placeholder="Email *" value={formData.email_id} onChange={(e) => setFormData({...formData, email_id: e.target.value})} required className="border p-2 rounded-lg w-full text-sm" />
                    <input type="text" placeholder="Mobile (10 digits) *" value={formData.mobile_no} onChange={(e) => setFormData({...formData, mobile_no: e.target.value})} required className="border p-2 rounded-lg w-full text-sm" />
                    <input type="password" placeholder={editId ? "New Password (leave blank to keep current)" : "Password (min 8 chars) *"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editId} minLength={8} className="border p-2 rounded-lg w-full text-sm" />
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-2 rounded-lg w-full text-sm">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
                        {editId ? 'Update User' : 'Create User'}
                    </button>
                </form>
            </Modal>

            {/* Delete Confirm Dialog */}
            <ConfirmDialog 
                isOpen={confirmOpen}
                title="Deactivate User?"
                message="Are you sure you want to deactivate this user? They won't be able to login."
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
                confirmText="Deactivate"
            />
        </div>
    );
};

export default UserList;