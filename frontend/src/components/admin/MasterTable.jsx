import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { masterService } from '../../services/masterService';
import DataTable from './DataTable';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';

const MasterTable = ({ type, title }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', sort_order: 0, status: '1' });
    
    // Confirm Dialog State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const getService = () => {
        switch (type) {
            case 'countries': return { list: masterService.getCountries, create: masterService.createCountry, update: masterService.updateCountry, remove: masterService.deleteCountries, status: masterService.changeCountryStatus };
            case 'states': return { list: masterService.getStates, create: masterService.createState, update: masterService.updateState, remove: masterService.deleteStates, status: masterService.changeStateStatus };
            case 'districts': return { list: masterService.getDistricts, create: masterService.createDistrict, update: masterService.updateDistrict, remove: masterService.deleteDistricts, status: masterService.changeDistrictStatus };
            case 'cities': return { list: masterService.getCities, create: masterService.createCity, update: masterService.updateCity, remove: masterService.deleteCities, status: masterService.changeCityStatus };
            case 'vigilance-angles': return { list: masterService.getVigilanceAngles, create: masterService.createVigilanceAngle, update: masterService.updateVigilanceAngle, remove: masterService.deleteVigilanceAngles, status: masterService.changeVigilanceAngleStatus };
            case 'disclosure-details': return { list: masterService.getDisclosures, create: masterService.createDisclosure, update: masterService.updateDisclosure, remove: masterService.deleteDisclosures, status: masterService.changeDisclosureStatus };
            default: return null;
        }
    };

    useEffect(() => {
        fetchData();
    }, [type]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getService().list();
            if (response.data) setData(response.data);
        } catch (error) {
            toast.error(`Failed to load ${title}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (row = null) => {
        if (row) {
            setEditId(row.id);
            setFormData({ 
                name: row.name || row.state_name || row.district_name || row.city_name, 
                sort_order: row.sort_order || 0, 
                status: String(row.status) 
            });
        } else {
            setEditId(null);
            setFormData({ name: '', sort_order: 0, status: '1' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            
            if (type === 'states') payload.state_name = formData.name;
            else if (type === 'districts') payload.district_name = formData.name;
            else if (type === 'cities') payload.city_name = formData.name;
            else payload.name = formData.name;

            if (type === 'states') payload.country_id = 1;
            if (type === 'districts') payload.state_id = 1;
            if (type === 'cities') { payload.district_id = 1; payload.pincode = '400001'; }

            if (editId) {
                await getService().update(editId, payload);
                toast.success(`${title} updated successfully!`);
            } else {
                await getService().create(payload);
                toast.success(`${title} created successfully!`);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    // Delete Click - Opens Confirm Modal
    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    // Actual Delete
    const handleConfirmDelete = async () => {
        try {
            await getService().remove([deleteId]);
            toast.success(`${title} deleted successfully!`);
            setConfirmOpen(false);
            setDeleteId(null);
            fetchData();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = String(currentStatus) === '1' ? '0' : '1';
        try {
            await getService().status(id, newStatus);
            toast.success('Status updated!');
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const columns = [
        { header: 'Sr No', accessor: 'srno' },
        { 
            header: 'Name', 
            accessor: 'name',
            render: (row) => <span className="font-medium">{row.name || row.state_name || row.district_name || row.city_name || 'N/A'}</span>
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <button 
                    onClick={() => handleStatusToggle(row.id, row.status)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${String(row.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                    {String(row.status) === '1' ? 'Active' : 'Inactive'}
                </button>
            )
        },
        {
            header: 'Action',
            accessor: 'id',
            render: (row) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleOpenModal(row)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteClick(row.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 text-sm">
                    <Plus className="w-4 h-4 mr-1" /> Add New
                </button>
            </div>

            <DataTable columns={columns} data={data} loading={loading} emptyMessage={`No ${title} found.`} />

            {/* Add/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? `Edit ${title}` : `Add ${title}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Sort Order</label>
                        <input type="number" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: e.target.value})} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded-lg">
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Save</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirm Dialog */}
            <ConfirmDialog 
                isOpen={confirmOpen}
                title={`Delete ${title}?`}
                message={`Are you sure you want to delete this ${title}? This cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default MasterTable;





