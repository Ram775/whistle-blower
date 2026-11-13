import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Upload } from 'lucide-react';
import api from '../../api/axios';

const Registration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: OTP Variables
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [verifiedToken, setVerifiedToken] = useState('');

    // Dropdowns Data
    const [disclosures, setDisclosures] = useState([]);
    const [angles, setAngles] = useState([]);

    // Step 2: Full Form State
    const [formData, setFormData] = useState({
        first_name: '', middle_name: '', last_name: '',
        gender: 'Male', dob: '', mobile_no: '',
        id_type: 'Adhar Number', id_number: '',
        eligibility_of_whistle_blower: 'Employee', 
        disclosure_against: '',
        sr_number: '', address_line1: '', pincode: '',
        determinationof_vigilance_angle_id: '',
        complaint_description: '', remarks: ''
    });

    // File Uploads State
    const [idPhoto, setIdPhoto] = useState(null);
    const [complaintDoc, setComplaintDoc] = useState(null);

    // Dropdowns fetch karo
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [disclosureRes, angleRes] = await Promise.all([
                    api.get('/master/disclosure-details-public'),
                    api.get('/master/vigilance-angles-public')
                ]);
                if (disclosureRes.data.data) setDisclosures(disclosureRes.data.data);
                if (angleRes.data.data) setAngles(angleRes.data.data);
            } catch (err) {
                console.error("Failed to load dropdowns", err);
            }
        };
        fetchDropdowns();
    }, []);

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/complaints/send-otp', { email_id: email });
            if (response.data.success) {
                setOtpToken(response.data.otp_token);
                alert("OTP sent to your email. Please check.");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/complaints/verify-otp', { otp, otp_token: otpToken });
            if (response.data.success) {
                setVerifiedToken(response.data.verified_token);
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle File Change
    const handleFileChange = (e, setter) => {
        setter(e.target.files[0]);
    };

    // Step 2: Submit Full Form
    const handleFullSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!idPhoto) {
            setError('ID Photo is required. Please upload a file.');
            setLoading(false);
            return;
        }

        const submitData = new FormData();
        
        // Saare text fields append karo
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });
        
        // Backend required fields
        submitData.append('email_id', email);
        submitData.append('verified_token', verifiedToken);
        submitData.append('state_id', '1'); // Abhi hardcoded
        submitData.append('district_id', '1'); // Abhi hardcoded
        submitData.append('city_id', '1'); // Abhi hardcoded
        
        // Files append karo
        submitData.append('id_photo', idPhoto);
        if (complaintDoc) {
            submitData.append('complaint_document', complaintDoc);
        }

        try {
            const response = await api.post('/complaints/submit_complaint', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                alert("Complaint Registered Successfully! Your Complaint No: " + response.data.complaint_no);
                navigate('/customer/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register complaint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
                <div className="flex justify-center mb-4">
                    <Shield className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">Register Complaint</h2>
                <p className="text-sm text-center text-gray-500 mb-6">Your identity will be kept confidential</p>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                {/* STEP 1: Email & OTP */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border p-2 rounded-lg"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        {!otpToken ? (
                            <button onClick={handleSendOtp} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Enter OTP</label>
                                    <input 
                                        type="text" 
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full border p-2 rounded-lg tracking-widest text-center text-lg font-bold"
                                        placeholder="------"
                                        maxLength={6}
                                    />
                                </div>
                                <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* STEP 2: Full Form */}
                {step === 2 && (
                    <form onSubmit={handleFullSubmit} className="space-y-6">
                        {/* Personal Info */}
                        <div>
                            <h3 className="font-bold text-lg text-blue-600 mb-3 border-b pb-2">1. Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input type="text" name="first_name" placeholder="First Name *" required className="border p-2 rounded" onChange={handleChange} />
                                <input type="text" name="middle_name" placeholder="Middle Name" className="border p-2 rounded" onChange={handleChange} />
                                <input type="text" name="last_name" placeholder="Last Name *" required className="border p-2 rounded" onChange={handleChange} />
                                <select name="gender" required className="border p-2 rounded" onChange={handleChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Transgender">Transgender</option>
                                    <option value="Does Not Wish To Say">Does Not Wish To Say</option>
                                </select>
                                <input type="date" name="dob" required className="border p-2 rounded" onChange={handleChange} title="Date of Birth" />
                                <input type="text" name="mobile_no" placeholder="Mobile Number (10 digits) *" required className="border p-2 rounded" onChange={handleChange} />
                            </div>
                        </div>

                        {/* Identity Info */}
                        <div>
                            <h3 className="font-bold text-lg text-blue-600 mb-3 border-b pb-2">2. Identity Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select name="id_type" required className="border p-2 rounded" onChange={handleChange}>
                                    <option value="Adhar Number">Adhar Number</option>
                                    <option value="PAN Number">PAN Number</option>
                                    <option value="Passport Number">Passport Number</option>
                                    <option value="VoterID Number">VoterID Number</option>
                                    <option value="Employee ID">Employee ID</option>
                                </select>
                                <input type="text" name="id_number" placeholder="Enter ID Number *" required className="border p-2 rounded" onChange={handleChange} />
                                
                                {/* ID PHOTO UPLOAD */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Upload ID Photo (JPG/PNG/PDF, max 1MB) *</label>
                                    <div className="flex items-center border p-2 rounded bg-gray-50">
                                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setIdPhoto)} required className="text-sm w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <h3 className="font-bold text-lg text-blue-600 mb-3 border-b pb-2">3. Address Details</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <input type="text" name="address_line1" placeholder="Address Line 1" className="border p-2 rounded" onChange={handleChange} />
                                <input type="text" name="pincode" placeholder="Pincode (6 digits) *" required className="border p-2 rounded" onChange={handleChange} />
                            </div>
                        </div>

                        {/* Complaint Details */}
                        <div>
                            <h3 className="font-bold text-lg text-blue-600 mb-3 border-b pb-2">4. Complaint Details</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <select name="eligibility_of_whistle_blower" required className="border p-2 rounded" onChange={handleChange}>
                                    <option value="Employee">Employee</option>
                                    <option value="Director of the Corporation">Director of the Corporation</option>
                                    <option value="Trainee">Trainee</option>
                                    <option value="Auditor">Auditor</option>
                                    <option value="Vendor">Vendor</option>
                                </select>
                                
                                <input type="text" name="sr_number" placeholder="SR Number *" required className="border p-2 rounded" onChange={handleChange} />

                                {/* Dropdown 1: Vigilance Angle */}
                                <select name="determinationof_vigilance_angle_id" required className="border p-2 rounded" onChange={handleChange}>
                                    <option value="">Select Vigilance Angle</option>
                                    {angles.map(angle => (
                                        <option key={angle.id} value={angle.id}>{angle.name}</option>
                                    ))}
                                </select>

                                {/* Dropdown 2: Disclosure Against */}
                                <select name="disclosure_against" required className="border p-2 rounded" onChange={handleChange}>
                                    <option value="">Select Disclosure Against</option>
                                    {disclosures.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>

                                <textarea name="complaint_description" placeholder="Complaint Description *" required rows="3" className="border p-2 rounded" onChange={handleChange}></textarea>
                                <textarea name="remarks" placeholder="Remarks (Optional)" rows="2" className="border p-2 rounded" onChange={handleChange}></textarea>

                                {/* COMPLAINT DOC UPLOAD */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Upload Complaint Document (PDF, max 1MB - Optional)</label>
                                    <div className="flex items-center border p-2 rounded bg-gray-50">
                                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                        <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setComplaintDoc)} className="text-sm w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                            {loading ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">Already registered? <Link to="/customer/login" className="text-blue-600 font-bold hover:underline">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Registration;