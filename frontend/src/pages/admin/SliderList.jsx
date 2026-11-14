import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import DataTable from '../../components/admin/DataTable';
import toast from 'react-hot-toast';

const SliderList = () => {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ image: null, alt_tag: '', sort_order: 0, status: '1' });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchSliders();
    }, []);

    const fetchSliders = async () => {
        try {
            setLoading(true);
            const response = await settingsService.getSliders();
            if (response.data) setSliders(response.data);
        } catch (error) {
            toast.error('Failed to fetch sliders');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('save_folder', 'slider');
        try {
            const response = await settingsService.uploadSingleImage(uploadData);
            if (response.status) {
                setFormData({ ...formData, image: response.filename });
                toast.success('Image uploaded!');
            }
        } catch (error) {
            toast.error('Image upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await settingsService.createSlider(formData);
            toast.success('Slider added successfully!');
            setShowForm(false);
            setFormData({ image: null, alt_tag: '', sort_order: 0, status: '1' });
            fetchSliders();
        } catch (error) {
            toast.error('Failed to save slider');
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = String(currentStatus) === '1' ? '0' : '1';
        try {
            await settingsService.changeSliderStatus(id, newStatus);
            toast.success('Status updated!');
            fetchSliders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this slider?")) return;
        try {
            await settingsService.deleteSliders([id]);
            toast.success('Slider deleted!');
            fetchSliders();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const columns = [
        { header: 'Sr No', accessor: 'srno' },
        { 
            header: 'Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <img src={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${row.image}`} alt="slider" className="h-12 w-20 object-cover rounded" />
            ) : <span className="text-gray-400">No image</span>
        },
        { header: 'Sort Order', accessor: 'sort_order' },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <button onClick={() => handleStatusToggle(row.id, row.status)} className={`px-3 py-1 rounded-full text-xs font-semibold ${String(row.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {String(row.status) === '1' ? 'Active' : 'Inactive'}
                </button>
            )
        },
        {
            header: 'Action',
            accessor: 'id',
            render: (row) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manage Sliders</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 text-sm">
                    <Plus className="w-4 h-4 mr-2" /> Add New Slider
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 border-l-4 border-blue-500">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slider Image</label>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        {isUploading && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
                        {formData.image && <p className="text-xs text-green-600 mt-1">Image uploaded: {formData.image}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alt Tag (Optional)</label>
                            <input type="text" value={formData.alt_tag} onChange={(e) => setFormData({...formData, alt_tag: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                            <input type="number" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                         </div>
                    </div>
                    <button type="submit" disabled={isUploading || !formData.image} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        Save Slider
                    </button>
                </form>
            )}

            <DataTable columns={columns} data={sliders} loading={loading} emptyMessage="No sliders found." />
        </div>
    );
};

export default SliderList;