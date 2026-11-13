import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PasswordReset = sequelize.define(
    'PasswordReset',
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        email: { type: DataTypes.STRING, allowNull: true },
        token: { type: DataTypes.STRING, allowNull: true },
        created_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
        tableName: 'tbl_password_resets',
        timestamps: true, 
        createdAt: 'created_at',
        updatedAt: false, // Laravel password_resets has no updated_at
        underscored: true,
    }
);

export default PasswordReset;