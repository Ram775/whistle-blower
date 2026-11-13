import express from 'express';
import * as SettingController from '../controllers/SettingController.js';
import * as SliderController from '../controllers/SliderController.js';
import { settingValidator, sliderValidator } from '../validators/settingValidator.js';
import { auth, allowRoles } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Saare admin routes protected hain
router.use(auth);
router.use(allowRoles(1, 2)); // 1=SuperAdmin, 2=Admin

// ================= SETTINGS =================
router.get('/settings', SettingController.index);
// Future me: upload.fields([{name: 'company_logo'}]) add karna hoga
router.post('/settings', settingValidator, SettingController.setting_submit);

// ================= SLIDERS =================
router.get('/sliders', SliderController.index);
// Future me: upload.single('image') add karna hoga
router.post('/sliders', sliderValidator, SliderController.store);
router.put('/sliders/:id', sliderValidator, SliderController.update);
router.post('/sliders/multiple_delete', SliderController.multipleDelete);
router.post('/sliders/change_status', SliderController.changeStatus);
router.post('/sliders/delete_image', SliderController.delete_image); // Notice: function name in controller is delete_image

export default router;