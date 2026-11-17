import { useState, useEffect } from "react";
import { User, Save, Loader2 } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    first_Name: "",
    last_Name: "",
    email_id: "",
    mobile_no: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_Name: user.first_name || "",
        last_Name: user.last_name || "",
        email_id: user.email_id || "",
        mobile_no: user.mobile_no || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.updateProfile(profileData);
      if (response.status) {
        toast.success("Profile updated successfully!");
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Common Input Class for consistency
  const inputClass =
    "w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
      </div>

      {/* Full Width Card (No grid now, since only 1 card is left) */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Update Profile</h2>
            <p className="text-sm text-gray-500">Update your personal information here.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileData.first_Name}
                onChange={(e) => setProfileData({ ...profileData, first_Name: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={profileData.last_Name}
                onChange={(e) => setProfileData({ ...profileData, last_Name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={profileData.email_id}
                onChange={(e) => setProfileData({ ...profileData, email_id: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={profileData.mobile_no}
                onChange={(e) => setProfileData({ ...profileData, mobile_no: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;