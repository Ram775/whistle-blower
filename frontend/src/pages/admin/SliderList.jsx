import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';

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
            const response = await api.get('/admin/sliders');
            if (response.data.data) {
                setSliders(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching sliders:", error);
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
        uploadData.append('save_folder', 'slider'); // Backend me save_folder 'slider' hai

        try {
            const response = await api.post('/upload/single_image', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.status) {
                setFormData({ ...formData, image: response.data.filename }); // DB me filename jayega
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Image upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/sliders', formData);
            setShowForm(false);
            setFormData({ image: null, alt_tag: '', sort_order: 0, status: '1' });
            fetchSliders();
        } catch (error) {
            console.error(error);
            alert("Failed to save slider");
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === '1' ? '0' : '1';
        try {
            await api.post('/admin/sliders/change_status', { status_id: id, status: newStatus });
            fetchSliders();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this slider?")) return;
        try {
            await api.post('/admin/sliders/multiple_delete', { data_id: JSON.stringify([id]) });
            fetchSliders();
        } catch (error) {
            console.error(error);
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
                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manage Sliders</h1>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 text-sm"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New Slider
                </button>
            </div>

            {/* Add Slider Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 border-l-4 border-blue-500">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slider Image</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
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

            <DataTable 
                columns={columns} 
                data={sliders} 
                loading={loading} 
                emptyMessage="No sliders found."
            />
        </div>
    );
};

export default SliderList;