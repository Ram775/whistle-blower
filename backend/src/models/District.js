import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const District = sequelize.define('District', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    state_id: { type: DataTypes.INTEGER, allowNull: true },
    district_name: { type: DataTypes.STRING, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
}, {
    tableName: 'tbl_districts',
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at', underscored: true,
});
export default District;