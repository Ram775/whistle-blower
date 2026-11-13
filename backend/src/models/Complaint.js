import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Complaint = sequelize.define(
    'Complaint',
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        complaint_no: { type: DataTypes.STRING, allowNull: true },
        user_id: { type: DataTypes.INTEGER, allowNull: true },
        determinationof_vigilance_angle_id: { type: DataTypes.INTEGER, allowNull: true },
        complaint_description: { type: DataTypes.TEXT('long'), allowNull: true },
        remarks: { type: DataTypes.TEXT('long'), allowNull: true },
        complaint_document: { type: DataTypes.TEXT, allowNull: true },
        complaint_status: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: true,
            comment: '1 for Pending, 2 for Under Processing, 3 for Disposed',
        },
        last_updated_by: { type: DataTypes.INTEGER, allowNull: true },
        disclosure_against: { type: DataTypes.STRING, allowNull: true },
        deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
        tableName: 'tbl_complaints',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true, // SoftDeletes enable karega (deleted_at)
        underscored: true,
        deletedAt: 'deleted_at',
    }
);

export default Complaint;