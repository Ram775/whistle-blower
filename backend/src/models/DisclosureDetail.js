import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const DisclosureDetail = sequelize.define(
    'DisclosureDetail',
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: true },
        sort_order: { type: DataTypes.INTEGER, allowNull: true },
        status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
        email: { type: DataTypes.STRING, allowNull: true },
    },
    {
        tableName: 'tbl_disclosure_details',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

export default DisclosureDetail;