import { DataTypes } from 'sequelize';
import crypto from 'crypto';
import sequelize from '../config/db.js';

// Laravel APP_KEY (base64 encoded) to Buffer
const getAppKey = () => {
    const key = process.env.LARAVEL_APP_KEY || 'base64:default_key_here';
    return Buffer.from(key.replace('base64:', ''), 'base64');
};

const User = sequelize.define(
    'User',
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        role_id: { 
            type: DataTypes.INTEGER, 
            comment: '1 for admin, 2 for vigilance login, 3 for front login user' 
        },
        first_name: { type: DataTypes.STRING, allowNull: true },
        middle_name: { type: DataTypes.STRING, allowNull: true },
        last_name: { type: DataTypes.STRING, allowNull: true },
        email_id: { type: DataTypes.STRING, unique: true, allowNull: true },
        mobile_no: { type: DataTypes.STRING, allowNull: true },
        landline_no: { type: DataTypes.STRING, allowNull: true },
        email_verified_at: { type: DataTypes.DATE, allowNull: true },
        password: { type: DataTypes.STRING, allowNull: true }, // Bcrypt hashed
        gender: { type: DataTypes.STRING(10), allowNull: true },
        dob: { type: DataTypes.DATEONLY, allowNull: true },
        id_type: { type: DataTypes.STRING(100), allowNull: true },
        id_number: {
            type: DataTypes.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('id_number');
                if (!rawValue) return null;
                try {
                    // Laravel encrypted cast format: base64(json({iv, value, mac, tag}))
                    const payload = JSON.parse(Buffer.from(rawValue, 'base64').toString('utf8'));
                    const iv = Buffer.from(payload.iv, 'base64');
                    const decipher = crypto.createDecipheriv('aes-256-cbc', getAppKey(), iv);
                    let decrypted = decipher.update(Buffer.from(payload.value, 'base64'), 'base64', 'utf8');
                    decrypted += decipher.final('utf8');
                    return decrypted;
                } catch (e) {
                    console.error('Decryption failed:', e.message);
                    return null;
                }
            },
            set(value) {
                if (!value) return this.setDataValue('id_number', null);
                const iv = crypto.randomBytes(16);
                const cipher = crypto.createCipheriv('aes-256-cbc', getAppKey(), iv);
                let encrypted = cipher.update(value, 'utf8', 'base64');
                encrypted += cipher.final('base64');
                const payload = { iv: iv.toString('base64'), value: encrypted, mac: '', tag: '' };
                this.setDataValue('id_number', Buffer.from(JSON.stringify(payload)).toString('base64'));
            },
        },
        id_number_hash: { type: DataTypes.STRING, allowNull: true }, // Blind Index
        id_photo: { type: DataTypes.STRING, allowNull: true },
        eligibility_of_whistle_blower: { type: DataTypes.STRING, allowNull: true },
        event: { type: DataTypes.TEXT, allowNull: true },
        sr_number: { type: DataTypes.STRING, allowNull: true },
        disclosure_against: { type: DataTypes.STRING, allowNull: true },
        organization: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.STRING, defaultValue: '1', allowNull: true },
        otp: { type: DataTypes.STRING, allowNull: true },
        remember_token: { type: DataTypes.STRING, allowNull: true },
    },
    {
        tableName: 'tbl_users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        hooks: {
            beforeSave: (user) => {
                // Sync Blind Index automatically
                if (user.changed('id_number')) {
                    const plainId = user.getDataValue('id_number');
                    if (plainId) {
                        user.id_number_hash = User.hashIdNumber(plainId);
                    }
                }
            },
        },
    }
);

// Laravel Blind Index logic
User.hashIdNumber = function (value) {
    if (!value || value.trim() === '') return null;
    const appKey = process.env.LARAVEL_APP_KEY || '';
    return crypto.createHmac('sha256', appKey).update(value.trim()).digest('hex');
};

export default User;