import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Address = sequelize.define(
    'Address',
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: true },
        address_line1: { type: DataTypes.STRING, allowNull: true },
        address_line2: { type: DataTypes.STRING, allowNull: true },
        address_line3: { type: DataTypes.STRING, allowNull: true },
        state_id: { type: DataTypes.INTEGER, allowNull: true },
        district_id: { type: DataTypes.INTEGER, allowNull: true },
        pincode: { type: DataTypes.STRING, allowNull: true },
        city_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        tableName: 'tbl_addresses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

export default Address;