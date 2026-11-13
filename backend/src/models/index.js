import sequelize from '../config/db.js';
import User from './User.js';
import Complaint from './Complaint.js';
import Setting from './Setting.js';
import PasswordReset from './PasswordReset.js';
import DisclosureDetail from './DisclosureDetail.js';
import DeterminationofVigilanceAngle from './DeterminationofVigilanceAngle.js';
import ComplaintStatusHistory from './ComplaintStatusHistory.js';
import Address from './Address.js';
import Country from './Country.js';
import State from './State.js';
import District from './District.js';
import City from './City.js';
import Slider from './Slider.js'; // ✅ Naya Model import kiya

// --- Relationships ---

// User ↔ Complaint
User.hasMany(Complaint, { foreignKey: 'user_id', as: 'complaints' });
Complaint.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Complaint ↔ Status History
Complaint.hasMany(ComplaintStatusHistory, { foreignKey: 'complaint_id', as: 'complaint_status_history' });
ComplaintStatusHistory.belongsTo(Complaint, { foreignKey: 'complaint_id' });
// ✅ Yahan naya relationship add kar (Status History me user kaun tha):
ComplaintStatusHistory.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// Complaint ↔ DeterminationofVigilanceAngle
Complaint.belongsTo(DeterminationofVigilanceAngle, { foreignKey: 'determinationof_vigilance_angle_id', as: 'determinationofvigilanceangle' });
DeterminationofVigilanceAngle.hasMany(Complaint, { foreignKey: 'determinationof_vigilance_angle_id' });

// User ↔ Address
User.hasMany(Address, { foreignKey: 'user_id', as: 'address' });
Address.belongsTo(User, { foreignKey: 'user_id' });

// User/Complaint ↔ DisclosureDetail
User.belongsTo(DisclosureDetail, { foreignKey: 'disclosure_against', as: 'disclosureDetail' });
Complaint.belongsTo(DisclosureDetail, { foreignKey: 'disclosure_against', as: 'disclosureDetail' });
DisclosureDetail.hasMany(User, { foreignKey: 'disclosure_against' });

// Location Relationships (Country > State > District > City)
Country.hasMany(State, { foreignKey: 'country_id' });
State.belongsTo(Country, { foreignKey: 'country_id', as: 'Country' });

State.hasMany(District, { foreignKey: 'state_id' });
District.belongsTo(State, { foreignKey: 'state_id', as: 'state' });

District.hasMany(City, { foreignKey: 'district_id' });
City.belongsTo(District, { foreignKey: 'district_id', as: 'district' });

// --- Export All ---
export {
    sequelize,
    User,
    Complaint,
    Setting,
    PasswordReset,
    DisclosureDetail,
    DeterminationofVigilanceAngle,
    ComplaintStatusHistory,
    Address,
    Country,
    State,
    District,
    City,
    Slider, // ✅ Naya Model export kiya
};