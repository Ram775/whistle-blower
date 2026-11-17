import express from 'express';
import * as StateController from '../controllers/StateController.js';
import * as DistrictController from '../controllers/DistrictController.js';
import * as CityController from '../controllers/CityController.js';
import * as VigilanceController from '../controllers/DeterminationofVigilanceAngleController.js';
import * as CountryController from '../controllers/CountryController.js';
import * as ClosureDetailController from '../controllers/ClosureDetailController.js';
import { 
    stateValidator, 
    districtValidator, 
    cityValidator, 
    vigilanceAngleValidator, 
    countryValidator,
    disclosureDetailValidator
} from '../validators/masterValidator.js';
import { auth, allowRoles } from '../middlewares/authMiddleware.js';
import { masterReadLimiter, masterWriteLimiter } from '../middlewares/rateLimiter.js'; // ✅ Rate limiters
import { Setting } from '../models/index.js'; // ✅ Setting model import

const router = express.Router();

// ============ PUBLIC ROUTES (No Auth) ============

// Settings for Landing Page
router.get('/settings-public', masterReadLimiter, async (req, res) => {
    try {
        const settings = await Setting.findAll({
            where: { master_key: 'config' },
            attributes: ['config_key', 'config_value']
        });
        res.status(200).json({ status: true, data: settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Error fetching settings' });
    }
});

// Public Dropdowns (Registration ke liye)
router.get('/disclosure-details-public', masterReadLimiter, ClosureDetailController.index);
router.get('/vigilance-angles-public', masterReadLimiter, VigilanceController.index);
router.get('/states/list', masterReadLimiter, DistrictController.getStateList);
router.get('/countries/list', masterReadLimiter, StateController.getCountryList);
router.post('/districts/get_list', masterReadLimiter, DistrictController.get_district_list);
router.post('/cities/get_list', masterReadLimiter, CityController.get_city_list);
router.post('/cities/check_duplication', masterReadLimiter, CityController.check_city_name_duplication);

// ============ PROTECTED ROUTES ============
router.use(auth);

// ============ STATE ============
router.get('/states', allowRoles(1, 2), masterReadLimiter, StateController.index);
router.post('/states', allowRoles(1, 2), masterWriteLimiter, stateValidator, StateController.store);
router.put('/states/:id', allowRoles(1, 2), masterWriteLimiter, stateValidator, StateController.update);
router.post('/states/multiple_delete', allowRoles(1, 2), masterWriteLimiter, StateController.multipleDelete);
router.post('/states/change_status', allowRoles(1, 2), masterWriteLimiter, StateController.changeStatus);

// ============ DISTRICT ============
router.get('/districts', allowRoles(1, 2), masterReadLimiter, DistrictController.index);
router.post('/districts', allowRoles(1, 2), masterWriteLimiter, districtValidator, DistrictController.store);
router.put('/districts/:id', allowRoles(1, 2), masterWriteLimiter, districtValidator, DistrictController.update);
router.post('/districts/multiple_delete', allowRoles(1, 2), masterWriteLimiter, DistrictController.multipleDelete);
router.post('/districts/change_status', allowRoles(1, 2), masterWriteLimiter, DistrictController.changeStatus);

// ============ CITY ============
router.get('/cities', allowRoles(1, 2), masterReadLimiter, CityController.index);
router.post('/cities', allowRoles(1, 2), masterWriteLimiter, cityValidator, CityController.store);
router.put('/cities/:id', allowRoles(1, 2), masterWriteLimiter, cityValidator, CityController.update);
router.post('/cities/multiple_delete', allowRoles(1, 2), masterWriteLimiter, CityController.multipleDelete);
router.post('/cities/change_status', allowRoles(1, 2), masterWriteLimiter, CityController.changeStatus);

// ============ VIGILANCE ANGLE ============
router.get('/vigilance-angles', allowRoles(1, 2), masterReadLimiter, VigilanceController.index);
router.post('/vigilance-angles', allowRoles(1, 2), masterWriteLimiter, vigilanceAngleValidator, VigilanceController.store);
router.put('/vigilance-angles/:id', allowRoles(1, 2), masterWriteLimiter, vigilanceAngleValidator, VigilanceController.update);
router.post('/vigilance-angles/multiple_delete', allowRoles(1, 2), masterWriteLimiter, VigilanceController.multipleDelete);
router.post('/vigilance-angles/change_status', allowRoles(1, 2), masterWriteLimiter, VigilanceController.changeStatus);

// ============ COUNTRY ============
router.get('/countries', allowRoles(1, 2), masterReadLimiter, CountryController.index);
router.post('/countries', allowRoles(1, 2), masterWriteLimiter, countryValidator, CountryController.store);
router.put('/countries/:id', allowRoles(1, 2), masterWriteLimiter, countryValidator, CountryController.update);
router.post('/countries/multiple_delete', allowRoles(1, 2), masterWriteLimiter, CountryController.multipleDelete);
router.post('/countries/change_status', allowRoles(1, 2), masterWriteLimiter, CountryController.changeStatus);

// ============ DISCLOSURE DETAILS ============
router.get('/disclosure-details', allowRoles(1, 2), masterReadLimiter, ClosureDetailController.index);
router.post('/disclosure-details', allowRoles(1, 2), masterWriteLimiter, disclosureDetailValidator, ClosureDetailController.store);
router.put('/disclosure-details/:id', allowRoles(1, 2), masterWriteLimiter, disclosureDetailValidator, ClosureDetailController.update);
router.post('/disclosure-details/multiple_delete', allowRoles(1, 2), masterWriteLimiter, ClosureDetailController.multipleDelete);
router.post('/disclosure-details/change_status', allowRoles(1, 2), masterWriteLimiter, ClosureDetailController.changeStatus);

export default router;