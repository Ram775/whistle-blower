import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const DeterminationofVigilanceAngle = sequelize.define(
    'DeterminationofVigilanceAngle',
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: true },
        sort_order: { type: DataTypes.INTEGER, allowNull: true },
        status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
        deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
        tableName: 'tbl_determinationof_vigilance_angles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true, // SoftDeletes
        deletedAt: 'deleted_at',
        underscored: true,
    }
);

export default DeterminationofVigilanceAngle;