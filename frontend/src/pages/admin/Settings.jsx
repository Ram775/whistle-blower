import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';

const Settings = () => {
    const [settings, setSettings] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            if (response.data.status) {
                setSettings(response.data.data);
                // Convert array to object for easy form handling
                const obj = {};
                response.data.data.forEach(item => {
                    obj[item.config_key] = item.config_value || '';
                });
                setFormData(obj);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const response = await api.post('/admin/settings', formData);
            if (response.data.status) {
                setMessage('Settings saved successfully!');
            }
        } catch (error) {
            setMessage('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Site Settings</h1>
            
            {message && (
                <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                {settings.map((setting) => (
                    <div key={setting.config_key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {setting.config_key.replace(/_/g, ' ')}
                        </label>
                        {setting.config_key.includes('logo') || setting.config_key.includes('image') ? (
                             <div className="flex items-center space-x-2 text-gray-500 text-sm">
                                 <ImageIcon className="w-4 h-4" />
                                 <span>File upload component will be added here.</span>
                             </div>
                        ) : (
                            <input
                                type="text"
                                value={formData[setting.config_key] || ''}
                                onChange={(e) => handleChange(setting.config_key, e.target.value)}
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        )}
                    </div>
                ))}
                
                <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 mt-4"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
};

export default Settings;