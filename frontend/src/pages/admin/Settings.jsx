import { useState, useEffect } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import toast from 'react-hot-toast';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await settingsService.getSettings();
            if (response.status) {
                setSettings(response.data);
                const obj = {};
                response.data.forEach(item => {
                    obj[item.config_key] = item.config_value || '';
                });
                setFormData(obj);
            }
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await settingsService.updateSettings(formData);
            if (response.status) {
                toast.success('Settings saved successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('save_folder', 'logo');

        try {
            const response = await settingsService.uploadSingleImage(uploadData);
            if (response.status) {
                setFormData({ ...formData, [fieldName]: response.filename });
                toast.success('Image uploaded successfully!');
            }
        } catch (error) {
            toast.error('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (fieldName) => {
        const currentImage = formData[fieldName];
        if (!currentImage) return;

        try {
            await settingsService.removeSingleImage(currentImage);
            setFormData({ ...formData, [fieldName]: '' });
            toast.success('Image removed');
        } catch (error) {
            toast.error('Failed to remove image');
        }
    };

    if (loading) return <div className="text-center mt-10">Loading settings...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center text-sm text-gray-500">
                <span className="text-blue-600 font-semibold">Home</span>
                <span className="mx-2">›</span>
                <span>Setting</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-800">Setting</h1>

            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-2 text-sm font-semibold transition-colors ${
                        activeTab === 'general' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab('image')}
                    className={`px-6 py-2 text-sm font-semibold transition-colors ${
                        activeTab === 'image' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Image
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                
                {/* ===== GENERAL TAB ===== */}
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.config_company_name || ''} onChange={(e) => setFormData({ ...formData, config_company_name: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Email <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.config_company_email || ''} onChange={(e) => setFormData({ ...formData, config_company_email: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" />
                            <p className="text-xs text-gray-500 mt-1">If you want multiple Email use comma "," for separation.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Mobile Number <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.config_company_mobile_number || ''} onChange={(e) => setFormData({ ...formData, config_company_mobile_number: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" />
                            <p className="text-xs text-gray-500 mt-1">If you want multiple Mobile use comma "," for separation.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Landline Number <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.config_company_landline_number || ''} onChange={(e) => setFormData({ ...formData, config_company_landline_number: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                            <textarea rows="3" value={formData.config_company_address || ''} onChange={(e) => setFormData({ ...formData, config_company_address: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm"></textarea>
                        </div>

                        {/* Social Media Links */}
                        <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-2">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Social Media Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                                    <input type="url" value={formData.config_facebook || ''} onChange={(e) => setFormData({ ...formData, config_facebook: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="https://facebook.com/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                                    <input type="url" value={formData.config_instagram || ''} onChange={(e) => setFormData({ ...formData, config_instagram: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="https://instagram.com/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                    <input type="url" value={formData.config_linkedin || ''} onChange={(e) => setFormData({ ...formData, config_linkedin: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="https://linkedin.com/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                                    <input type="url" value={formData.config_twitter || ''} onChange={(e) => setFormData({ ...formData, config_twitter: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="https://twitter.com/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                                    <input type="url" value={formData.config_you_tube || ''} onChange={(e) => setFormData({ ...formData, config_you_tube: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="https://youtube.com/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Map Address Link</label>
                                    <input type="url" value={formData.config_google_map_address_link || ''} onChange={(e) => setFormData({ ...formData, config_google_map_address_link: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="https://maps.google.com/..." />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Getting Complaint Details Emails</label>
                            <textarea rows="3" value={formData.config_getting_complaint_email || ''} onChange={(e) => setFormData({ ...formData, config_getting_complaint_email: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm"></textarea>
                            <p className="text-xs text-gray-500 mt-1">If you want multiple Email use comma "," for separation.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Curtain is Active</label>
                            <select value={formData.is_banner_active || '1'} onChange={(e) => setFormData({ ...formData, is_banner_active: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm">
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* ===== IMAGE TAB ===== */}
                {activeTab === 'image' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Company Logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                            <div className="border border-gray-300 rounded p-2 flex items-center justify-between bg-gray-50">
                                <span className="text-sm text-gray-500">{formData.company_logo ? formData.company_logo.split('/').pop() : 'No file chosen'}</span>
                                <label className="cursor-pointer bg-white border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-100">
                                    Choose File
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'company_logo')} />
                                </label>
                            </div>
                            {formData.company_logo && (
                                <div className="mt-4 relative">
                                    <img src={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${formData.company_logo}`} alt="Company Logo" className="h-20 object-contain" />
                                    <button type="button" onClick={() => handleRemoveImage('company_logo')} className="absolute top-0 left-24 text-red-500 hover:text-red-700 text-sm"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>

                        {/* Company Fav Logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Fav Logo</label>
                            <div className="border border-gray-300 rounded p-2 flex items-center justify-between bg-gray-50">
                                <span className="text-sm text-gray-500">{formData.company_fav_logo ? formData.company_fav_logo.split('/').pop() : 'No file chosen'}</span>
                                <label className="cursor-pointer bg-white border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-100">
                                    Choose File
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'company_fav_logo')} />
                                </label>
                            </div>
                            {formData.company_fav_logo && (
                                <div className="mt-4 relative">
                                    <img src={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${formData.company_fav_logo}`} alt="Company Fav Logo" className="h-20 object-contain" />
                                    <button type="button" onClick={() => handleRemoveImage('company_fav_logo')} className="absolute top-0 left-24 text-red-500 hover:text-red-700 text-sm"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <button type="submit" disabled={saving || uploading} className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition text-sm font-semibold disabled:bg-gray-400">
                        {saving ? 'Saving...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;