import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Setting = sequelize.define(
    'Setting',
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        master_key: { type: DataTypes.STRING, allowNull: true },
        config_key: { type: DataTypes.STRING, allowNull: true },
        config_value: { type: DataTypes.TEXT, allowNull: true },
    },
    {
        tableName: 'tbl_settings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

export default Setting;