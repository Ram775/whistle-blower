import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/users/forgot-password/send-otp', { email });
            if (response.data.status) {
                setOtpToken(response.data.otp_token);
                setStep(2);
                toast.success('OTP sent to your email!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Email not registered');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP + Send Reset Link
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/users/forgot-password/verify-otp', { 
                email, otp, otp_token: otpToken 
            });
            if (response.data.status) {
                toast.success('OTP verified! Reset link sent to your email.');
                setTimeout(() => navigate('/admin/login'), 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex justify-center mb-4">
                    {step === 1 ? <Mail className="w-12 h-12 text-blue-600" /> : <KeyRound className="w-12 h-12 text-green-600" />}
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">
                    {step === 1 ? 'Forgot Password?' : 'Enter OTP'}
                </h2>
                <p className="text-sm text-center text-gray-500 mb-6">
                    {step === 1 ? 'Enter your email to receive an OTP' : `Enter the OTP sent to ${email}`}
                </p>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="admin@gicre.in"
                                required 
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Enter OTP</label>
                            <input 
                                type="text" 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-green-500"
                                placeholder="------"
                                maxLength={6}
                                required 
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                            {loading ? 'Verifying...' : 'Verify OTP & Send Reset Link'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-blue-600 hover:underline"
                        >
                            Change Email?
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/admin/login" className="text-sm text-blue-600 hover:underline flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;