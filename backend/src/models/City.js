import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const City = sequelize.define('City', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    district_id: { type: DataTypes.INTEGER, allowNull: true },
    city_name: { type: DataTypes.STRING, allowNull: true },
    pincode: { type: DataTypes.STRING, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
}, {
    tableName: 'tbl_cities',
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at', underscored: true,
});
export default City;