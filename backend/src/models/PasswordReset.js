import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PasswordReset = sequelize.define(
    'PasswordReset',
    {
        // ✅ id field hata di
        email: { type: DataTypes.STRING, allowNull: true, primaryKey: true }, // Email primary key ban sakta hai (Laravel me aise hi hota hai)
        token: { type: DataTypes.STRING, allowNull: true },
        created_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
        tableName: 'tbl_password_resets',
        timestamps: false, // ✅ timestamps false karo kyunki created_at manually de rahe hain
        underscored: true,
    }
);

export default PasswordReset;