import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

// Admin Pages
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ComplaintList from "./pages/admin/ComplaintList";
import ComplaintView from "./pages/admin/ComplaintView";
import MasterData from "./pages/admin/MasterData";
import Settings from "./pages/admin/Settings";
import UserList from "./pages/admin/UserList";
import SliderList from "./pages/admin/SliderList";

// Customer Pages
import UserLogin from "./pages/customer/UserLogin";
import Registration from "./pages/customer/Registration";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import NewComplaint from "./pages/customer/NewComplaint";
import CustomerComplaintView from "./pages/customer/CustomerComplaintView";
import NotFound from "./pages/NotFound";
import Profile from "./pages/admin/Profile";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";

const App = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "8px",
          },
          success: { theme: { primary: "#10B981" } },
          error: { theme: { primary: "#EF4444" } },
        }}
      />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Navigate to="/customer/login" replace />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/admin/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/customer/login" element={<UserLogin />} />
        <Route path="/customer/register" element={<Registration />} />

        <Route
          path="/unauthorized"
          element={
            <div className="p-8 text-center text-red-600 text-2xl font-bold mt-20">
              Unauthorized Access!
            </div>
          }
        />

        {/* ================= ADMIN PROTECTED ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={[1, 2]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/complaints" element={<ComplaintList />} />
            <Route path="/admin/complaints/:id" element={<ComplaintView />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/sliders" element={<SliderList />} />
            <Route path="/admin/master" element={<MasterData />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* ================= CUSTOMER PROTECTED ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={[3]} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/new-complaint" element={<NewComplaint />} />
          <Route
            path="/customer/complaint/:id"
            element={<CustomerComplaintView />}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
