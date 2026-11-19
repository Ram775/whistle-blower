import { useState, useEffect } from "react";
import { Save, Upload, X, Building2, Globe, ImageIcon, Loader2 } from "lucide-react";
import { settingsService } from "../../services/settingsService";
import { notify } from "../../utils/notify";


const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      if (response.status) {
        setSettings(response.data);
        const obj = {};
        response.data.forEach((item) => {
          obj[item.config_key] = item.config_value || "";
        });
        setFormData(obj);
      }
    } catch (error) {
      notify.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await settingsService.updateSettings(formData);
      if (response.status) {
        notify.success("Settings saved successfully!");
      }
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("save_folder", "setting_logo");

    try {
      const response = await settingsService.uploadSingleImage(uploadData);
      if (response.status) {
        setFormData({ ...formData, [fieldName]: response.filename });
        notify.success("Image uploaded successfully!");
      }
    } catch (error) {
      notify.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (fieldName) => {
    const currentImage = formData[fieldName];
    if (!currentImage) return;

    try {
      await settingsService.removeSingleImage(currentImage);
      setFormData({ ...formData, [fieldName]: "" });
      notify.success("Image removed");
    } catch (error) {
      notify.error("Failed to remove image");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#1b2a5e]">
        <Loader2 className="animate-spin mr-2" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#1b2a5e]">Settings Management</h2>
      </div>

      <div className="p-4 md:p-5 flex flex-col gap-6">
        
        {/* Tabs (Flat & Clean) */}
        <div className="flex space-x-1 border-b border-gray-200 w-full overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "general"
                ? "border-[#1b2a5e] text-[#1b2a5e]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Building2 size={16} /> General Settings
          </button>
          <button
            onClick={() => setActiveTab("image")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "image"
                ? "border-[#1b2a5e] text-[#1b2a5e]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <ImageIcon size={16} /> Logo & Images
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="relative space-y-8">
          
          {/* Saving Overlay */}
          {(saving || uploading) && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
              <Loader2 className="animate-spin text-[#1b2a5e]" size={32} />
            </div>
          )}

          {/* ===== GENERAL TAB ===== */}
          {activeTab === "general" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Company Info Section */}
              <div>
                <h3 className="text-md font-bold text-[#1b2a5e] border-b pb-2 mb-4 flex items-center gap-2">
                  <Building2 size={18} /> Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.config_company_name || ""}
                      onChange={(e) => setFormData({ ...formData, config_company_name: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Company Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.config_company_email || ""}
                      onChange={(e) => setFormData({ ...formData, config_company_email: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Separate multiple emails with comma ( , )</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Company Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.config_company_mobile_number || ""}
                      onChange={(e) => setFormData({ ...formData, config_company_mobile_number: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Separate multiple mobiles with comma ( , )</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Company Landline Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.config_company_landline_number || ""}
                      onChange={(e) => setFormData({ ...formData, config_company_landline_number: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Company Address</label>
                    <textarea
                      rows="3"
                      value={formData.config_company_address || ""}
                      onChange={(e) => setFormData({ ...formData, config_company_address: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-md font-bold text-[#1b2a5e] mb-4 flex items-center gap-2">
                  <Globe size={18} /> Social Media Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Facebook URL</label>
                    <input
                      type="url"
                      value={formData.config_facebook || ""}
                      onChange={(e) => setFormData({ ...formData, config_facebook: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={formData.config_instagram || ""}
                      onChange={(e) => setFormData({ ...formData, config_instagram: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.config_linkedin || ""}
                      onChange={(e) => setFormData({ ...formData, config_linkedin: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Twitter URL</label>
                    <input
                      type="url"
                      value={formData.config_twitter || ""}
                      onChange={(e) => setFormData({ ...formData, config_twitter: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">YouTube URL</label>
                    <input
                      type="url"
                      value={formData.config_you_tube || ""}
                      onChange={(e) => setFormData({ ...formData, config_you_tube: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Google Map Address Link</label>
                    <input
                      type="url"
                      value={formData.config_google_map_address_link || ""}
                      onChange={(e) => setFormData({ ...formData, config_google_map_address_link: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Other Settings */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-md font-bold text-[#1b2a5e] mb-4">Other Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Getting Complaint Details Emails</label>
                    <textarea
                      rows="2"
                      value={formData.config_getting_complaint_email || ""}
                      onChange={(e) => setFormData({ ...formData, config_getting_complaint_email: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                    ></textarea>
                    <p className="text-[11px] text-gray-500 mt-1">Separate multiple emails with comma ( , )</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Curtain (Banner) is Active</label>
                    <select
                      value={formData.is_banner_active || "1"}
                      onChange={(e) => setFormData({ ...formData, is_banner_active: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                    >
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== IMAGE TAB ===== */}
          {activeTab === "image" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {/* Company Logo */}
              <div className="bg-gray-50/50 p-4 rounded border border-gray-200">
                <label className="block text-sm font-semibold text-[#1b2a5e] mb-3">Company Logo</label>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center overflow-hidden shrink-0">
                    {formData.company_logo ? (
                      <img
                        src={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${formData.company_logo}`}
                        alt="Company Logo"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded text-sm font-medium text-center hover:bg-gray-50 transition-colors shadow-sm">
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Upload size={16} /> Choose File
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "company_logo")}
                      />
                    </label>
                    {formData.company_logo && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("company_logo")}
                        className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={16} /> Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">Recommended size: 200x50px, PNG or SVG</p>
              </div>

              {/* Company Fav Logo */}
              <div className="bg-gray-50/50 p-4 rounded border border-gray-200">
                <label className="block text-sm font-semibold text-[#1b2a5e] mb-3">Company Favicon</label>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center overflow-hidden shrink-0">
                    {formData.company_fav_logo ? (
                      <img
                        src={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${formData.company_fav_logo}`}
                        alt="Company Fav Logo"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded text-sm font-medium text-center hover:bg-gray-50 transition-colors shadow-sm">
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Upload size={16} /> Choose File
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "company_fav_logo")}
                      />
                    </label>
                    {formData.company_fav_logo && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("company_fav_logo")}
                        className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={16} /> Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">Recommended size: 32x32px, PNG or ICO</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center gap-2 bg-[#1b2a5e] text-white px-6 py-2 rounded hover:bg-blue-800 transition-all text-sm font-semibold shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;