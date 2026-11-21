import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Upload,
  ArrowLeft,
  ArrowRight,
  Mail,
  CheckCircle2,
  MapPin,
  UserCheck,
  FileText,
  Loader2,
  FileCheck,
  X,
  Send,
  Lock,
} from "lucide-react";
import { masterService } from "../../services/masterService";
import { complaintService } from "../../services/complaintService";
import { notify } from "../../utils/notify"; 

const Registration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=OTP, 2=Contact, 3=Complaint
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");

  // Dropdowns
  const [disclosures, setDisclosures] = useState([]);
  const [angles, setAngles] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "Male",
    dob: "",
    mobile_no: "",
    landline_no: "",
    id_type: "Adhar Number",
    id_number: "",
    eligibility_of_whistle_blower: "Employee",
    disclosure_against: "",
    sr_number: "",
    address_line1: "",
    address_line2: "",
    address_line3: "",
    pincode: "",
    state_id: "",
    district_id: "",
    city_id: "",
    city_name: "",
    determinationof_vigilance_angle_id: "",
    complaint_description: "",
    remarks: "",
  });

  const [idPhoto, setIdPhoto] = useState(null);
  const [complaintDoc, setComplaintDoc] = useState(null);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [disclosureRes, angleRes, stateRes] = await Promise.all([
          masterService.getPublicDisclosures(),
          masterService.getPublicVigilanceAngles(),
          masterService.getStateList(),
        ]);
        if (disclosureRes.data) setDisclosures(disclosureRes.data);
        if (angleRes.data) setAngles(angleRes.data);
        if (stateRes.data) setStates(stateRes.data);
      } catch (err) {
        notify.error("Failed to load form data");
      }
    };
    fetchDropdowns();
  }, []);

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setFormData({
      ...formData,
      state_id: stateId,
      district_id: "",
      city_id: "",
    });
    setDistricts([]);
    setCities([]);
    if (stateId) {
      try {
        const response = await masterService.getDistrictsByState(stateId);
        if (response.data) setDistricts(response.data);
      } catch (err) {
        notify.error("Failed to load districts");
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setFormData({ ...formData, district_id: districtId, city_id: "" });
    setCities([]);
    if (districtId) {
      try {
        const response = await masterService.getCitiesByDistrict(districtId);
        if (response.data) setCities(response.data);
      } catch (err) {
        notify.error("Failed to load cities");
      }
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      city_id: value,
      city_name: value === "0" ? formData.city_name : "",
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      notify.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await complaintService.sendOtp(email);
      if (response.success) {
        setOtpToken(response.otp_token);
        notify.success("OTP sent to your email. Please check.");
      }
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      notify.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const response = await complaintService.verifyOtp(otp, otpToken);
      if (response.success) {
        setVerifiedToken(response.verified_token);
        setStep(2);
        notify.success("Email verified successfully!");
      }
    } catch (err) {
      const data = err.response?.data;

      // ✅ Naya Logic: Agar email already registered hai
      if (data?.email_registered) {
        // Custom icon ki jagah warning use kiya hai
        notify.warning(data.message || "This email is already registered.");
        
        // 2. User ko 2 second baad /login pe redirect kar do
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        notify.error(data?.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.city_id === "0" && !formData.city_name.trim()) {
      notify.error("Please enter city name for 'Other' option");
      return;
    }
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFullSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!idPhoto) {
      notify.error("ID Photo is required. Please upload a file.");
      setLoading(false);
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) =>
      submitData.append(key, formData[key]),
    );
    submitData.append("email_id", email);
    submitData.append("verified_token", verifiedToken);
    submitData.append("id_photo", idPhoto);
    if (complaintDoc) submitData.append("complaint_document", complaintDoc);

    try {
      const response = await complaintService.submitComplaint(submitData);
      if (response.success) {
        notify.success(
          `Complaint registered! Your Complaint No: ${response.complaint_no}`,
        );
        navigate("/login");
      }
    } catch (err) {
      notify.error(
        err.response?.data?.message || "Failed to register complaint.",
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Email Verification", subtitle: "OTP Authentication" },
    { id: 2, title: "Contact & Address", subtitle: "Location Details" },
    { id: 3, title: "Identity & Disclosure", subtitle: "Complaint Filing" },
  ];

  const inputClass =
    "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b2a5e]/20 focus:border-[#1b2a5e] transition-all disabled:opacity-60 disabled:cursor-not-allowed";

  const labelClass =
    "block text-xs font-bold uppercase tracking-wider text-[#1b2a5e] mb-1.5";

  return (
    <div className="min-h-screen bg-gray-100 py-1 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full  bg-white app_card rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Top Navy Header Banner */}
        <div className="bg-gradient-to-r from-[#1b2a5e] to-[#2c428c] px-6 sm:px-8 py-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Whistleblower Registration
                </h2>
                <p className="text-xs text-[#d2dfff] mt-1">
                  Your identity and disclosure details are strictly protected &
                  encrypted
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/10 text-[#d2dfff] px-3.5 py-1.5 rounded-full self-start sm:self-center">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Confidential
              Portal
            </span>
          </div>

          {/* 3-Step Visual Progress Stepper */}
          <div className="mt-1 pt-2 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-4">
            {steps.map((s) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-white/15 ring-1 ring-white/30"
                      : isCompleted
                        ? "bg-emerald-500/15"
                        : "opacity-55"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "bg-white text-[#1b2a5e]"
                          : "bg-white/20 text-white"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {s.title}
                    </p>
                    <p className="text-[10px] text-[#d2dfff] truncate hidden sm:block">
                      {s.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-3.5 rounded-r-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 1: Email & OTP Verification                  */}
          {/* ================================================= */}
          {step === 1 && (
            <div className="max-w-md mx-auto py-4 space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-[#d2dfff]/50 text-[#1b2a5e] flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1b2a5e]">
                  Verify Your Email Address
                </h3>
                <p className="text-xs text-gray-500">
                  We will send a 6-digit One-Time Password (OTP) to authenticate
                  your session.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="you@example.com"
                    required
                    disabled={loading || !!otpToken}
                  />
                </div>
              </div>

              {!otpToken ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading || !email || !email.includes("@")}
                  className="w-full flex items-center justify-center gap-2 bg-[#1b2a5e] hover:bg-[#2c428c] text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Verification OTP</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelClass}>
                        Enter 6-Digit OTP{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs font-semibold text-emerald-600">
                        OTP Sent!
                      </span>
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg tracking-[0.5em] text-center text-lg font-bold text-[#1b2a5e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b2a5e]/20 focus:border-[#1b2a5e]"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Proceed</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 2: Contact & Address Details                 */}
          {/* ================================================= */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-[#1b2a5e] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1b2a5e]" />
                  <span>Contact & Residential Address</span>
                </h3>
                <span className="text-xs text-gray-500">
                  <span className="text-red-500 font-bold">*</span> Mandatory
                  fields
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>
                    Verified E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={email}
                    readOnly
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile_no"
                    value={formData.mobile_no}
                    placeholder="Enter 10-digit mobile"
                    required
                    className={inputClass}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className={labelClass}>Landline Number</label>
                  <input
                    type="text"
                    name="landline_no"
                    value={formData.landline_no}
                    placeholder="Optional"
                    className={inputClass}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Address Line 1</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    placeholder="House / Flat / Building"
                    className={inputClass}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className={labelClass}>Address Line 2</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    placeholder="Street / Sector / Area"
                    className={inputClass}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className={labelClass}>Address Line 3</label>
                  <input
                    type="text"
                    name="address_line3"
                    value={formData.address_line3}
                    placeholder="Landmark (Optional)"
                    className={inputClass}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state_id}
                    onChange={handleStateChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.state_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.district_id}
                    onChange={handleDistrictChange}
                    required
                    disabled={!formData.state_id}
                    className={inputClass}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.district_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    placeholder="6-digit PIN"
                    required
                    className={inputClass}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.city_id}
                    onChange={handleCityChange}
                    required
                    disabled={!formData.district_id}
                    className={inputClass}
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.city_name}
                      </option>
                    ))}
                    <option value="0">Other</option>
                  </select>
                </div>

                {formData.city_id === "0" && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Specify City Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city_name"
                      value={formData.city_name}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Enter your city or town name"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="inline-flex items-center gap-2 text-[#1b2a5e] border border-[#1b2a5e]/30 hover:bg-[#d2dfff]/30 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#1b2a5e] hover:bg-[#2c428c] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer shadow-sm"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ================================================= */}
          {/* STEP 3: Personal Identity & Complaint Details     */}
          {/* ================================================= */}
          {step === 3 && (
            <form onSubmit={handleFullSubmit} className="space-y-8">
              {/* Section 3A: Personal & Identity Details */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#1b2a5e] border-b border-gray-200 pb-2.5 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#1b2a5e]" />
                  <span>Personal & Identity Verification</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      placeholder="First Name"
                      required
                      className={inputClass}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Middle Name</label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      placeholder="Optional"
                      className={inputClass}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      placeholder="Last Name"
                      required
                      className={inputClass}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      required
                      className={inputClass}
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Does Not Wish To Say">
                        Does Not Wish To Say
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      required
                      className={inputClass}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Identity Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_type"
                      value={formData.id_type}
                      required
                      className={inputClass}
                      onChange={handleChange}
                    >
                      <option value="Adhar Number">Aadhaar Number</option>
                      <option value="PAN Number">PAN Number</option>
                      <option value="Passport Number">Passport Number</option>
                      <option value="VoterID Number">VoterID Number</option>
                      <option value="Employee ID">Employee ID</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className={labelClass}>
                      {formData.id_type} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="id_number"
                      value={formData.id_number}
                      placeholder={`Enter your ${formData.id_type}`}
                      required
                      className={inputClass}
                      onChange={handleChange}
                    />
                  </div>

                  {/* ID Photo Upload */}
                  <div className="md:col-span-3">
                    <label className={labelClass}>
                      Upload ID Proof (JPG / PNG / PDF, max 1MB){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {!idPhoto ? (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#1b2a5e] rounded-lg p-4 bg-gray-50 hover:bg-[#d2dfff]/20 transition-all cursor-pointer">
                        <Upload className="w-5 h-5 text-[#1b2a5e] mb-1" />
                        <span className="text-xs font-bold text-[#1b2a5e]">
                          Click to upload ID document
                        </span>
                        <span className="text-[11px] text-gray-500 mt-0.5">
                          Supported: JPG, PNG, PDF (Max 1MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, setIdPhoto)}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#d2dfff]/40 border border-[#1b2a5e]/20 rounded-lg">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileCheck className="w-5 h-5 text-[#1b2a5e] shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-[#1b2a5e] truncate">
                              {idPhoto.name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {(idPhoto.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIdPhoto(null)}
                          className="p-1 text-gray-500 hover:text-red-600 rounded cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3B: Complaint Details */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#1b2a5e] border-b border-gray-200 pb-2.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1b2a5e]" />
                  <span>Complaint & Disclosure Details</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Eligibility of Whistleblower{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="eligibility_of_whistle_blower"
                      value={formData.eligibility_of_whistle_blower}
                      required
                      className={inputClass}
                      onChange={handleChange}
                    >
                      <option value="Employee">Employee</option>
                      <option value="Director of the Corporation">
                        Director of the Corporation
                      </option>
                      <option value="Trainee">Trainee</option>
                      <option value="Auditor">Auditor</option>
                      <option value="Vendor">Vendor</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      SR Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sr_number"
                      value={formData.sr_number}
                      placeholder="Enter SR Number"
                      required
                      className={inputClass}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Vigilance Angle <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="determinationof_vigilance_angle_id"
                      value={formData.determinationof_vigilance_angle_id}
                      required
                      className={inputClass}
                      onChange={handleChange}
                    >
                      <option value="">Select Vigilance Angle</option>
                      {angles.map((angle) => (
                        <option key={angle.id} value={angle.id}>
                          {angle.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Disclosure Against <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="disclosure_against"
                      value={formData.disclosure_against}
                      required
                      className={inputClass}
                      onChange={handleChange}
                    >
                      <option value="">Select Disclosure Against</option>
                      {disclosures.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Complaint Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="complaint_description"
                      value={formData.complaint_description}
                      placeholder="Describe the incident, dates, and relevant facts in detail..."
                      required
                      rows="3"
                      className={inputClass}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Remarks{" "}
                      <span className="text-gray-400 font-normal normal-case">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      placeholder="Any additional notes or context..."
                      rows="2"
                      className={inputClass}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Supporting Document Upload */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Supporting Complaint Document{" "}
                      <span className="text-gray-400 font-normal normal-case">
                        (PDF, max 1MB - Optional)
                      </span>
                    </label>
                    {!complaintDoc ? (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#1b2a5e] rounded-lg p-4 bg-gray-50 hover:bg-[#d2dfff]/20 transition-all cursor-pointer">
                        <Upload className="w-5 h-5 text-[#1b2a5e] mb-1" />
                        <span className="text-xs font-bold text-[#1b2a5e]">
                          Click to upload supporting PDF
                        </span>
                        <span className="text-[11px] text-gray-500 mt-0.5">
                          Supported: PDF only (Max 1MB)
                        </span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, setComplaintDoc)}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#d2dfff]/40 border border-[#1b2a5e]/20 rounded-lg">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileCheck className="w-5 h-5 text-[#1b2a5e] shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-[#1b2a5e] truncate">
                              {complaintDoc.name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {(complaintDoc.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setComplaintDoc(null)}
                          className="p-1 text-gray-500 hover:text-red-600 rounded cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="inline-flex items-center gap-2 text-[#1b2a5e] border border-[#1b2a5e]/30 hover:bg-[#d2dfff]/30 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Complaint...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Complaint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer Login Link */}
          <div className="mt-8 pt-5 border-t border-gray-100 text-center text-xs text-gray-600">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-[#1b2a5e] font-bold hover:underline"
            >
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;