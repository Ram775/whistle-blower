import express from 'express';
import * as StateController from '../controllers/StateController.js';
import * as DistrictController from '../controllers/DistrictController.js';
import * as CityController from '../controllers/CityController.js';
import * as VigilanceController from '../controllers/DeterminationofVigilanceAngleController.js';
import * as CountryController from '../controllers/CountryController.js';
import * as ClosureDetailController from '../controllers/ClosureDetailController.js'; // <-- Ye check kar
import { 
    stateValidator, 
    districtValidator, 
    cityValidator, 
    vigilanceAngleValidator, 
    countryValidator,
    disclosureDetailValidator // <-- Ye check kar
} from '../validators/masterValidator.js';
import { auth, allowRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ============ STATE ============
router.get('/states', auth, allowRoles(1, 2), StateController.index);
router.get('/states/list', DistrictController.getStateList); 
router.get('/countries/list', StateController.getCountryList);
router.post('/states', auth, allowRoles(1, 2), stateValidator, StateController.store);
router.put('/states/:id', auth, allowRoles(1, 2), stateValidator, StateController.update);
router.post('/states/multiple_delete', auth, allowRoles(1, 2), StateController.multipleDelete);
router.post('/states/change_status', auth, allowRoles(1, 2), StateController.changeStatus);

// ============ DISTRICT ============
router.get('/districts', auth, allowRoles(1, 2), DistrictController.index);
router.post('/districts/get_list', DistrictController.get_district_list);
router.post('/districts', auth, allowRoles(1, 2), districtValidator, DistrictController.store);
router.put('/districts/:id', auth, allowRoles(1, 2), districtValidator, DistrictController.update);
router.post('/districts/multiple_delete', auth, allowRoles(1, 2), DistrictController.multipleDelete);
router.post('/districts/change_status', auth, allowRoles(1, 2), DistrictController.changeStatus);

// ============ CITY ============
router.get('/cities', auth, allowRoles(1, 2), CityController.index);
router.post('/cities/get_list', CityController.get_city_list);
router.post('/cities/check_duplication', CityController.check_city_name_duplication);
router.post('/cities', auth, allowRoles(1, 2), cityValidator, CityController.store);
router.put('/cities/:id', auth, allowRoles(1, 2), cityValidator, CityController.update);
router.post('/cities/multiple_delete', auth, allowRoles(1, 2), CityController.multipleDelete);
router.post('/cities/change_status', auth, allowRoles(1, 2), CityController.changeStatus);

// ============ VIGILANCE ANGLE ============
router.get('/vigilance-angles', auth, allowRoles(1, 2), VigilanceController.index);
router.post('/vigilance-angles', auth, allowRoles(1, 2), vigilanceAngleValidator, VigilanceController.store);
router.put('/vigilance-angles/:id', auth, allowRoles(1, 2), vigilanceAngleValidator, VigilanceController.update);
router.post('/vigilance-angles/multiple_delete', auth, allowRoles(1, 2), VigilanceController.multipleDelete);
router.post('/vigilance-angles/change_status', auth, allowRoles(1, 2), VigilanceController.changeStatus);

// ============ COUNTRY ============
router.get('/countries', auth, allowRoles(1, 2), CountryController.index);
router.post('/countries', auth, allowRoles(1, 2), countryValidator, CountryController.store);
router.put('/countries/:id', auth, allowRoles(1, 2), countryValidator, CountryController.update);
router.post('/countries/multiple_delete', auth, allowRoles(1, 2), CountryController.multipleDelete);
router.post('/countries/change_status', auth, allowRoles(1, 2), CountryController.changeStatus);

// ============ DISCLOSURE DETAILS ============
router.get('/disclosure-details', auth, allowRoles(1, 2), ClosureDetailController.index);
router.post('/disclosure-details', auth, allowRoles(1, 2), disclosureDetailValidator, ClosureDetailController.store);
router.put('/disclosure-details/:id', auth, allowRoles(1, 2), disclosureDetailValidator, ClosureDetailController.update);
router.post('/disclosure-details/multiple_delete', auth, allowRoles(1, 2), ClosureDetailController.multipleDelete);
router.post('/disclosure-details/change_status', auth, allowRoles(1, 2), ClosureDetailController.changeStatus);

export default router;