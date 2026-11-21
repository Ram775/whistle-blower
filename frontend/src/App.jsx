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
import LandingPage from "./pages/customer/LandingPage";
import ChangePassword from "./pages/auth/ChangePassword";
import UserLayout from "./layouts/UserLayout";
import Unauthorized from "./pages/Unauthorized";
import EditComplaint from "./pages/customer/EditComplaint";

import CountryPage from "./pages/admin/master/CountryPage";
import StatePage from "./pages/admin/master/StatePage";
import DistrictPage from "./pages/admin/master/DistrictPage";
import CityPage from "./pages/admin/master/CityPage";
import EventPage from "./pages/admin/master/EventPage";
import DisclosureDetailPage from "./pages/admin/master/DisclosureDetailPage";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/admin/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<Registration />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ================= ADMIN PROTECTED ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={[1, 2]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/complaints" element={<ComplaintList />} />
            <Route path="/admin/complaints/:id" element={<ComplaintView />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/sliders" element={<SliderList />} />
            {/* <Route path="/admin/master" element={<MasterData />} /> */}
            <Route path="/admin/master/country" element={<CountryPage />} />
            <Route path="/admin/master/state" element={<StatePage />} />
            <Route path="/admin/master/district" element={<DistrictPage />} />
            <Route path="/admin/master/city" element={<CityPage />} />
            <Route path="/admin/master/event" element={<EventPage />} />
            <Route
              path="/admin/master/disclosure-detail"
              element={<DisclosureDetailPage />}
            />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/profile" element={<Profile />} />
            <Route path="/admin/change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* ================= CUSTOMER PROTECTED ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={[3]} />}>
          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/new-complaint" element={<NewComplaint />} />
            <Route path="/complaint/:id" element={<CustomerComplaintView />} />
            <Route path="/complaint/:id/edit" element={<EditComplaint />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
