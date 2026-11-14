import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ new_password: '', confirm_new_password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_new_password) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post(`/users/reset-password/${token}`, formData);
            if (response.data.status) {
                toast.success('Password reset successfully! Please login.');
                navigate('/admin/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex justify-center mb-4">
                    <Lock className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
                        <input 
                            type="password" 
                            value={formData.new_password}
                            onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required minLength={8}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
                        <input 
                            type="password" 
                            value={formData.confirm_new_password}
                            onChange={(e) => setFormData({...formData, confirm_new_password: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required minLength={8}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;