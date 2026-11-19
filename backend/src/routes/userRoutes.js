import express from "express";
import {
  loginSubmit,
  dashboard,
  checkDuplication,
  checkEmailDuplication,
  changeStatus,
  getProfile,
  updateProfile,
  updatePassword,
  listUsers,
  storeUser,
  updateUser,
  editUser,
  forgotPassword,
  postPassword,
  verifyResetOtp,
  sendResetOtp,
} from "../controllers/UserController.js";
import {
  storeUserValidator,
  updateUserValidator,
  updateProfileValidator,
  updatePasswordValidator,
  loginValidator,
} from "../validators/userValidator.js";
import { auth, allowRoles } from "../middlewares/authMiddleware.js";
import {
  checkBlockedIP,
  loginLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  userReadLimiter,   // ✅ Add kiya
  userWriteLimiter,  // ✅ Add kiya
} from "../middlewares/rateLimiter.js";

const router = express.Router();

// ✅ IP block check sabse pehle
router.use(checkBlockedIP);

// ================= PUBLIC ROUTES =================
router.post("/login", loginValidator, loginLimiter, loginSubmit);
router.post("/check_duplication", checkDuplication);
router.post("/check_email_duplication", checkEmailDuplication);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/send-otp", otpSendLimiter, sendResetOtp);
router.post("/forgot-password/verify-otp", otpVerifyLimiter, verifyResetOtp);
router.post("/reset-password/:remember_token", postPassword);

// ================= AUTHENTICATED ROUTES =================
router.use(auth);

// Dashboard
router.get("/dashboard", allowRoles(1, 2), userReadLimiter, dashboard);

// Profile
router.get("/profile", allowRoles(1, 2), userReadLimiter, getProfile);
router.put("/profile", allowRoles(1, 2), userWriteLimiter, updateProfileValidator, updateProfile);
router.put("/change-password", allowRoles(1, 2), userWriteLimiter, updatePasswordValidator, updatePassword);

// User CRUD
router.get("/", allowRoles(1, 2), userReadLimiter, listUsers);
router.post("/", allowRoles(1, 2), userWriteLimiter, storeUserValidator, storeUser);
router.get("/:id/edit", allowRoles(1, 2), userReadLimiter, editUser);
router.put("/:id", allowRoles(1, 2), userWriteLimiter, updateUserValidator, updateUser);
router.post("/change_status", allowRoles(1, 2), userWriteLimiter, changeStatus);

export default router;