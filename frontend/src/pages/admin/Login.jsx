import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { 
  ShieldAlert, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  ArrowRight, 
  UserCheck 
} from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100 overflow-hidden">
        
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600" />

        <div className="p-8 sm:p-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white mb-4 shadow-md shadow-slate-900/15">
              <UserCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Admin Console
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Sign in with your administrative credentials
            </p>
          </div>

          {/* ⚠️ Warning: Attempts Left */}
          {attemptsLeft !== null && attemptsLeft > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-3.5 rounded-r-lg mb-6 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-semibold">Security Warning:</span> Only{" "}
                <span className="font-bold underline">{attemptsLeft}</span>{" "}
                attempt{attemptsLeft !== 1 ? "s" : ""} remaining before a 15-minute IP lockout.
              </p>
            </div>
          )}

          {/* 🚨 Error: IP Blocked */}
          {isBlocked && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-3.5 rounded-r-lg mb-6 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-semibold">Access Temporarily Blocked:</span> Too many failed attempts. Please try again after 15 minutes.
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gicre.in"
                  required
                  disabled={isBlocked}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <Link
                  to="/admin/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isBlocked}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isBlocked}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isBlocked}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/20 transition-all duration-200 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : isBlocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>IP Temporarily Blocked</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Not an administrator?{" "}
            <Link
              to="/login"
              className="text-slate-700 font-semibold hover:text-blue-600 underline underline-offset-2 transition-colors"
            >
              Whistleblower Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;