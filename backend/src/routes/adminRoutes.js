import express from "express";
import * as SettingController from "../controllers/SettingController.js";
import * as SliderController from "../controllers/SliderController.js";
import {
  settingValidator,
  sliderValidator,
} from "../validators/settingValidator.js";
import { auth, allowRoles } from "../middlewares/authMiddleware.js";
import { upload, verifyUploadedFiles } from "../middlewares/uploadMiddleware.js";
import { Slider, Setting } from "../models/index.js";
import {
  settingsReadLimiter,   // ✅ Add
  settingsWriteLimiter,  // ✅ Add
  masterReadLimiter      // ✅ Public routes ke liye
} from "../middlewares/rateLimiter.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================

router.get("/sliders-public", masterReadLimiter, async (req, res) => {
  try {
    const sliders = await Slider.findAll({
      where: { status: "1" },
      attributes: ["id", "image", "alt_tag", "sort_order"],
    });
    res.status(200).json({ status: true, data: sliders });
  } catch (error) {
    console.error("Public Sliders Error:", error);
    res.status(500).json({ status: false, message: "Error fetching sliders" });
  }
});

router.get("/settings-public", masterReadLimiter, async (req, res) => {
  try {
    const settings = await Setting.findAll({
      where: { master_key: "config" },
      attributes: ["config_key", "config_value"],
    });
    res.status(200).json({ status: true, data: settings });
  } catch (error) {
    console.error("Public Settings Error:", error);
    res.status(500).json({ status: false, message: "Error fetching settings" });
  }
});

// ================= PROTECTED ROUTES =================
router.use(auth);
router.use(allowRoles(1, 2));

// Settings
router.get("/settings", settingsReadLimiter, SettingController.index);
router.post("/settings", settingsWriteLimiter, settingValidator, SettingController.setting_submit);

// Sliders
router.get("/sliders", settingsReadLimiter, SliderController.index);
router.post("/sliders", settingsWriteLimiter, sliderValidator, verifyUploadedFiles, SliderController.store);
router.put("/sliders/:id", settingsWriteLimiter, sliderValidator, verifyUploadedFiles, SliderController.update);
router.post("/sliders/multiple_delete", settingsWriteLimiter, SliderController.multipleDelete);
router.post("/sliders/change_status", settingsWriteLimiter, SliderController.changeStatus);
router.post("/sliders/delete_image", settingsWriteLimiter, verifyUploadedFiles, SliderController.delete_image);

export default router;