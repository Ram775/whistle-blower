import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowRight, Image as ImageIcon } from "lucide-react";
import api from "../../api/axios";

const LandingPage = () => {
  const [sliders, setSliders] = useState([]);
  const [settings, setSettings] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sliderRes = await api.get("/admin/sliders-public");
        if (sliderRes.data.data) {
          console.log("Slider Data from API:", sliderRes.data.data); // Debug
          setSliders(sliderRes.data.data);
        }

        const settingsRes = await api.get("/admin/settings-public");
        if (settingsRes.data.data) {
          const obj = {};
          settingsRes.data.data.forEach(
            (item) => (obj[item.config_key] = item.config_value)
          );
          setSettings(obj);
        }
      } catch (error) {
        console.error("Landing Page Fetch Error:", error);
      }
    };
    fetchData();
  }, []);

  // Auto slider
  useEffect(() => {
    if (sliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sliders]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {settings.company_logo ? (
              <img
                src={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${settings.company_logo}`}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <Shield className="w-8 h-8 text-blue-600" />
            )}
            <span className="text-lg font-bold text-gray-800">
              {settings.config_company_name || "Whistleblower Portal"}
            </span>
          </div>
          <div className="space-x-4">
            <Link
              to="/customer/login"
              className="text-gray-600 font-medium hover:text-blue-600 transition"
            >
              Login
            </Link>
            <Link
              to="/customer/register"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO SLIDER ===== */}
      <div className="relative w-full h-[450px] overflow-hidden bg-gray-800">
        {sliders.length > 0 ? (
          sliders.map((slider, index) => {
            // ✅ Image path clean karo (kabhi kabhi "slider/" double aata hai)
            const cleanPath = slider.image?.replace(/^slider\//, '').trim();
            const imageUrl = `http://localhost:5000/uploads/slider/${cleanPath}`;

            return (
              <div
                key={slider.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
               
   
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <ImageIcon className="w-12 h-12 mr-2" />
            No sliders added yet.
          </div>
        )}
      </div>

      {/* ===== HERO CONTENT ===== */}
      <div className="max-w-4xl mx-auto text-center py-16 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Why Choose Our Whistleblower Portal?
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Your identity will be kept 100% confidential. Register your complaint
          securely and track its status in real-time with end-to-end encryption.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/customer/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-semibold shadow-md"
          >
            Register Complaint <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <Link
            to="/customer/login"
            className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition font-semibold shadow-sm"
          >
            Track Complaint
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="mb-2 font-bold text-lg">
            {settings.config_company_name || "Whistleblower Portal"}
          </p>
          <p className="text-sm text-gray-400">
            {settings.config_company_address || "Address not set"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Email: {settings.config_company_email || "N/A"} | Phone:{" "}
            {settings.config_company_mobile_number || "N/A"}
          </p>
          <p className="text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} {settings.config_company_name || "Whistleblower Portal"}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;