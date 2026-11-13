import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Shield, Key } from 'lucide-react';

const UserLogin = () => {
    const [formData, setFormData] = useState({
        id_type: 'PAN Number',
        id_number: '',
        dob: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // NOTE: Backend me ID Number ko AES-GCM se encrypt karke bhejna hota hai (Laravel logic).
            // Abhi hum plain bhej rahe hain. Agar backend me decrypt error aaye, toh hume frontend me crypto logic add karna hoga.
            const response = await api.post('/frontend/account_login', formData);
            
            if (response.data.status) {
                login(response.data.user, response.data.token);
                navigate('/customer/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Login Details. Please check your ID and DOB.');
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
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Identity Type</label>
                        <select 
                            value={formData.id_type}
                            onChange={(e) => setFormData({...formData, id_type: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 mt-2"
                    >
                        {loading ? 'Verifying...' : 'Login'}
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