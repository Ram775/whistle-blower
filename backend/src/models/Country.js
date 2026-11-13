import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Country = sequelize.define('Country', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
}, {
    tableName: 'tbl_countries',
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at', underscored: true,
});
export default Country;