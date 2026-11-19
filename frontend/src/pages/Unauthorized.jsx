import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Decorative Blur */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-2xl p-8 sm:p-10 text-center relative z-10">
        {/* Icon Badge */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100 text-red-600 mb-6 shadow-sm">
          <ShieldAlert className="w-8 h-8" strokeWidth={1.75} />
        </div>

        {/* 403 Tag */}
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-red-600 uppercase bg-red-50 rounded-full mb-3">
          Error 403 • Forbidden
        </span>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8">
          You don’t have permission to view this page. Please sign in with an authorized account or contact your administrator if you believe this is a mistake.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Optional Login Prompt */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Switch account or Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;