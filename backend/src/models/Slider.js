import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Slider = sequelize.define('Slider', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    image: { type: DataTypes.STRING, allowNull: true },
    alt_tag: { type: DataTypes.STRING, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
}, {
    tableName: 'tbl_sliders',
    timestamps: true, 
    createdAt: 'created_at', 
    updatedAt: 'updated_at', 
    underscored: true,
});

export default Slider;