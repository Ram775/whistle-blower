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
} from "../middlewares/rateLimiter.js";

const router = express.Router();
// ✅ IP block check sabse pehle
router.use(checkBlockedIP);

// Public routes
router.post("/login", loginValidator, loginLimiter, loginSubmit);
router.post("/check_duplication", checkDuplication);
router.post("/check_email_duplication", checkEmailDuplication);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/send-otp", otpSendLimiter, sendResetOtp);
router.post("/forgot-password/verify-otp", otpVerifyLimiter, verifyResetOtp);
router.post("/reset-password/:remember_token", postPassword);

// Authenticated routes
router.use(auth);

// Dashboard
router.get("/dashboard", allowRoles(1, 2), dashboard);

// Profile
router.get("/profile", allowRoles(1, 2), getProfile);
router.put("/profile", allowRoles(1, 2), updateProfileValidator, updateProfile);
router.put(
  "/change-password",
  allowRoles(1, 2),
  updatePasswordValidator,
  updatePassword,
);

// User CRUD
router.get("/", allowRoles(1, 2), listUsers);
router.post("/", allowRoles(1, 2), storeUserValidator, storeUser);
router.get("/:id/edit", allowRoles(1, 2), editUser);
router.put("/:id", allowRoles(1, 2), updateUserValidator, updateUser);
router.post("/change_status", allowRoles(1, 2), changeStatus);

export default router;
