import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Shield, Key, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const UserLogin = () => {
    const [formData, setFormData] = useState({
        id_type: 'PAN Number',
        id_number: '',
        dob: ''
    });
    const [loading, setLoading] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAttemptsLeft(null);
        setIsBlocked(false);

        try {
            const response = await authService.customerLogin(formData);
            
            if (response.status) {
                login(response.user, response.token);
                toast.success(`Welcome back, ${response.user.first_name || 'User'}!`);
                navigate('/customer/dashboard');
            } else {
                toast.error(response.message || 'Login failed.');
            }
        } catch (err) {
            const data = err.response?.data;

            // ✅ Agar IP blocked hai
            if (data?.blocked) {
                setIsBlocked(true);
                toast.error("Your IP has been blocked due to too many failed attempts.");
            } 
            // ✅ Agar attempts remaining hain
            else if (data?.attempts_remaining !== undefined) {
                setAttemptsLeft(data.attempts_remaining);
                toast.error(data.message || "Invalid Credentials.");
            } 
            // ✅ Baaki errors
            else {
                toast.error(data?.message || 'Invalid Login Details.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-center mb-4">
                    <Shield className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Whistleblower Login</h2>
                <p className="text-sm text-center text-gray-500 mb-6">Access your registered complaints</p>

                {/* ⚠️ Warning: Attempts Left */}
                {attemptsLeft !== null && attemptsLeft > 0 && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded-lg mb-4 text-sm flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                            <strong>Warning:</strong> Only <strong>{attemptsLeft}</strong> attempt{attemptsLeft !== 1 ? 's' : ''} remaining. After that, your IP will be blocked for 15 minutes.
                        </span>
                    </div>
                )}

                {/* 🚨 Error: IP Blocked */}
                {isBlocked && (
                    <div className="bg-red-100 border border-red-400 text-red-800 p-3 rounded-lg mb-4 text-sm flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                            🚨 Your IP has been blocked due to too many failed attempts. Please try again after 15 minutes.
                        </span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Identity Type</label>
                        <select 
                            value={formData.id_type}
                            onChange={(e) => setFormData({...formData, id_type: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isBlocked}
                        >
                            <option value="PAN Number">PAN Number</option>
                            <option value="Passport Number">Passport Number</option>
                            <option value="VoterID Number">VoterID Number</option>
                            <option value="Adhar Number">Adhar Number</option>
                            <option value="Employee ID">Employee ID</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">ID Number</label>
                        <div className="relative">
                            <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            <input 
                                type="text" 
                                value={formData.id_number}
                                onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your ID number"
                                required 
                                disabled={isBlocked}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Date of Birth</label>
                        <input 
                            type="date" 
                            value={formData.dob}
                            onChange={(e) => setFormData({...formData, dob: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required 
                            disabled={isBlocked}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || isBlocked}
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 mt-2"
                    >
                        {loading ? 'Verifying...' : isBlocked ? 'IP Blocked' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">Don't have an account? <Link to="/customer/register" className="text-blue-600 font-bold hover:underline">Register Complaint</Link></p>
                    <p className="text-gray-600 mt-2">Admin? <Link to="/admin/login" className="text-blue-600 hover:underline">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;