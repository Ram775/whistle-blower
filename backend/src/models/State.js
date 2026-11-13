import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const State = sequelize.define('State', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    country_id: { type: DataTypes.INTEGER, allowNull: true },
    state_name: { type: DataTypes.STRING, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
}, {
    tableName: 'tbl_states',
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at', underscored: true,
});
export default State;