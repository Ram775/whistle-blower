import { useState, useEffect } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    // Profile Form State
    const [profileData, setProfileData] = useState({
        first_Name: '',
        last_Name: '',
        email_id: '',
        mobile_no: ''
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                first_Name: user.first_name || '',
                last_Name: user.last_name || '',
                email_id: user.email_id || '',
                mobile_no: user.mobile_no || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authService.updateProfile(profileData);
            if (response.status) {
                toast.success('Profile updated successfully!');
                // Note: AuthContext me user state update karne ka option rakhenge, abhi ke liye reload
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        try {
            const response = await authService.changePassword(passwordData);
            if (response.status) {
                toast.success('Password updated successfully!');
                setPasswordData({ old_password: '', new_password: '', confirm_new_password: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ==== Profile Update Card ==== */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500"/> Update Profile
                    </h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input 
                                type="text" 
                                value={profileData.first_Name}
                                onChange={(e) => setProfileData({...profileData, first_Name: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input 
                                type="text" 
                                value={profileData.last_Name}
                                onChange={(e) => setProfileData({...profileData, last_Name: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input 
                                type="email" 
                                value={profileData.email_id}
                                onChange={(e) => setProfileData({...profileData, email_id: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mobile</label>
                            <input 
                                type="text" 
                                value={profileData.mobile_no}
                                onChange={(e) => setProfileData({...profileData, mobile_no: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center">
                            <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>
                </div>

                {/* ==== Password Update Card ==== */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-red-500"/> Change Password
                    </h2>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Old Password</label>
                            <input 
                                type="password" 
                                value={passwordData.old_password}
                                onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password (min 8 chars)</label>
                            <input 
                                type="password" 
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                                required
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passwordData.confirm_new_password}
                                onChange={(e) => setPasswordData({...passwordData, confirm_new_password: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                                required
                                minLength={8}
                            />
                        </div>
                        <button type="submit" disabled={passwordLoading} className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300 flex items-center justify-center">
                            <Lock className="w-4 h-4 mr-2" /> {passwordLoading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;