import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ComplaintStatusHistory = sequelize.define(
    'ComplaintStatusHistory',
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        complaint_id: { type: DataTypes.INTEGER, allowNull: true },
        user_id: { type: DataTypes.INTEGER, allowNull: true },
        complaint_status: { type: DataTypes.INTEGER, allowNull: true },
        comment: { type: DataTypes.TEXT, allowNull: true },
    },
    {
        tableName: 'tbl_complaint_status_histories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

export default ComplaintStatusHistory;