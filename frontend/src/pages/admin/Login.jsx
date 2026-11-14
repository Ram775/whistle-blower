import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Double click rokne ke liye
    if (loading || isBlocked) return;

    setLoading(true);
    setAttemptsLeft(null);

    try {
      const response = await authService.adminLogin({ email, password });

      if (response.status) {
        login(response.user, response.token);
        toast.success("Login Successful! Welcome back.");
        navigate("/admin/dashboard");
      } else {
        toast.error(response.message || "Login failed.");
      }
    } catch (err) {
      const data = err.response?.data;

      // IP Blocked
      if (data?.blocked) {
        setIsBlocked(true);
        toast.error(data.message || "Your IP has been blocked. Try again after 15 minutes.");
      } 
      // Attempts Remaining
      else if (data?.attempts_remaining !== undefined) {
        setAttemptsLeft(data.attempts_remaining);
        toast.error(data.message || "Invalid Credentials.");
        
        // Agar 0 attempts bache hain toh block state set kar
        if (data.attempts_remaining === 0) {
          setIsBlocked(true);
        }
      } 
      // Other errors
      else {
        toast.error(data?.message || "Invalid Credentials. Please check.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Admin Login
        </h2>

        {/* Warning: Attempts Left */}
        {attemptsLeft !== null && attemptsLeft > 0 && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded-lg mb-4 text-sm">
            ⚠️ <strong>Warning:</strong> Only <strong>{attemptsLeft}</strong>{" "}
            attempt{attemptsLeft !== 1 ? "s" : ""} remaining. Your IP will be blocked after that.
          </div>
        )}

        {/* Error: IP Blocked */}
        {isBlocked && (
          <div className="bg-red-100 border border-red-400 text-red-800 p-3 rounded-lg mb-4 text-sm">
            🚨 Your IP has been blocked due to too many failed attempts. Please try again after 15 minutes.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="admin@gicre.in"
              required
              disabled={isBlocked}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="********"
              required
              disabled={isBlocked}
            />
          </div>
          <button
            type="submit"
            disabled={loading || isBlocked}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : isBlocked ? "IP Blocked" : "Login"}
          </button>

          <Link
            to="/admin/forgot-password"
            className="text-sm text-blue-600 hover:underline block text-center mt-4"
          >
            Forgot Password?
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;