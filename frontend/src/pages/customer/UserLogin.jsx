import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { ShieldCheck, KeyRound, AlertTriangle, CreditCard, Calendar, ArrowRight, Lock } from 'lucide-react';
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
                navigate('/dashboard');
            } else {
                toast.error(response.message || 'Login failed.');
            }
        } catch (err) {
            const data = err.response?.data;

            if (data?.blocked) {
                setIsBlocked(true);
                toast.error("Your IP has been blocked due to too many failed attempts.");
            } else if (data?.attempts_remaining !== undefined) {
                setAttemptsLeft(data.attempts_remaining);
                toast.error(data.message || "Invalid Credentials.");
            } else {
                toast.error(data?.message || 'Invalid Login Details.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100 overflow-hidden">
                
                {/* Top Accent Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

                <div className="p-8 sm:p-10">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        
                    </div>

                    {/* ⚠️ Warning: Attempts Left */}
                    {attemptsLeft !== null && attemptsLeft > 0 && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-3.5 rounded-r-lg mb-6 text-sm flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <span className="font-semibold">Security Warning:</span> Only{' '}
                                <span className="font-bold underline">{attemptsLeft}</span> attempt{attemptsLeft !== 1 ? 's' : ''} remaining before a 15-minute IP lockout.
                            </p>
                        </div>
                    )}

                    {/* 🚨 Error: IP Blocked */}
                    {isBlocked && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-3.5 rounded-r-lg mb-6 text-sm flex items-start gap-3">
                            <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <span className="font-semibold">Access Temporarily Blocked:</span> Too many failed attempts. Please try again after 15 minutes.
                            </p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Identity Type */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Identity Type
                            </label>
                            <div className="relative">
                                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select 
                                    value={formData.id_type}
                                    onChange={(e) => setFormData({...formData, id_type: e.target.value})}
                                    disabled={isBlocked}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <option value="PAN Number">PAN Number</option>
                                    <option value="Passport Number">Passport Number</option>
                                    <option value="VoterID Number">VoterID Number</option>
                                    <option value="Adhar Number">Aadhaar Number</option>
                                    <option value="Employee ID">Employee ID</option>
                                </select>
                            </div>
                        </div>

                        {/* ID Number */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                ID Number
                            </label>
                            <div className="relative">
                                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input 
                                    type="text" 
                                    value={formData.id_number}
                                    onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                                    placeholder={`Enter your ${formData.id_type}`}
                                    required 
                                    disabled={isBlocked}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Date of Birth
                            </label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input 
                                    type="date" 
                                    value={formData.dob}
                                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                    required 
                                    disabled={isBlocked}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading || isBlocked}
                            className="w-full btn_base btn_primary flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/20 transition-all duration-200 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed mt-2 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verifying Identity...</span>
                                </>
                            ) : isBlocked ? (
                                <>
                                    <Lock className="w-4 h-4" />
                                    <span>IP Temporarily Blocked</span>
                                </>
                            ) : (
                                <>
                                    <span >Login</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className=" pt-6 border-t border-slate-100 space-y-2.5 text-center text-sm">
                        <p className="text-slate-600">
                            New complaint?{' '}
                            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                                Register here
                            </Link>
                        </p>
                       
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;