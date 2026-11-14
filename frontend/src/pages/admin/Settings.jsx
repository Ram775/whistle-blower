import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import toast from 'react-hot-toast';

const Settings = () => {
    const [settings, setSettings] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    if (loading) return <div className="text-center mt-10">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Site Settings</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                {settings.map((setting) => (
                    <div key={setting.config_key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {setting.config_key.replace(/_/g, ' ')}
                        </label>
                        <input
                            type="text"
                            value={formData[setting.config_key] || ''}
                            onChange={(e) => setFormData({ ...formData, [setting.config_key]: e.target.value })}
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                ))}
                <button type="submit" disabled={saving} className="flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 mt-4">
                    <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
};

export default Settings;