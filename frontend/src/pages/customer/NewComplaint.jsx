import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import { complaintService } from '../../services/complaintService';
import { masterService } from '../../services/masterService';
import toast from 'react-hot-toast';

const NewComplaint = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [angles, setAngles] = useState([]);
    const [disclosures, setDisclosures] = useState([]);
    
    const [formData, setFormData] = useState({
        determinationof_vigilance_angle_id: '',
        disclosure_against: '',
        complaint_description: '',
        remarks: ''
    });
    const [complaintDoc, setComplaintDoc] = useState(null);

    // OTP
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpToken, setOtpToken] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [disclosureRes, angleRes] = await Promise.all([
                    masterService.getPublicDisclosures(),
                    masterService.getPublicVigilanceAngles()
                ]);
                if (disclosureRes.data) setDisclosures(disclosureRes.data);
                if (angleRes.data) setAngles(angleRes.data);
            } catch (err) {
                toast.error('Failed to load form data');
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            const response = await complaintService.sendOtp(JSON.parse(localStorage.getItem('user'))?.email_id);
            if (response.success) {
                setOtpToken(response.otp_token);
                setOtpSent(true);
                toast.success('OTP sent to your email!');
            }
        } catch (err) {
            toast.error('Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otpSent) {
            toast.error('Please click "Send OTP" first.');
            return;
        }
        setLoading(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
        submitData.append('otp', otp);
        submitData.append('otp_token', otpToken);
        if (complaintDoc) submitData.append('complaint_document', complaintDoc);

        try {
            const response = await complaintService.submitNewComplaint(submitData);
            if (response.success) {
                toast.success('Complaint registered successfully!');
                navigate('/customer/dashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register complaint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <button onClick={() => navigate('/customer/dashboard')} className="flex items-center text-blue-600 font-medium mb-4 hover:underline">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </button>
                <div className="flex items-center space-x-3 mb-6 border-b pb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Register New Complaint</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="determinationof_vigilance_angle_id" required className="border p-2 rounded-lg" onChange={handleChange}>
                            <option value="">Select Vigilance Angle</option>
                            {angles.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <select name="disclosure_against" required className="border p-2 rounded-lg" onChange={handleChange}>
                            <option value="">Select Disclosure Against</option>
                            {disclosures.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>

                    <textarea name="complaint_description" required placeholder="Complaint Description *" rows="4" className="w-full border p-2 rounded-lg" onChange={handleChange}></textarea>
                    <textarea name="remarks" placeholder="Remarks (Optional)" rows="2" className="w-full border p-2 rounded-lg" onChange={handleChange}></textarea>

                    <div>
                        <label className="block text-sm font-medium mb-1">Upload Document (PDF, Optional)</label>
                        <div className="flex items-center border p-2 rounded-lg bg-gray-50">
                            <Upload className="w-5 h-5 text-gray-400 mr-2" />
                            <input type="file" accept=".pdf" onChange={(e) => setComplaintDoc(e.target.files[0])} className="text-sm w-full" />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-2">Verify Your Email</h3>
                        {!otpSent ? (
                            <button type="button" onClick={handleSendOtp} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                                Send OTP
                            </button>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="border p-2 rounded-lg w-40 text-center font-bold tracking-widest" />
                                <span className="text-sm text-green-600 font-medium">OTP Sent!</span>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewComplaint;