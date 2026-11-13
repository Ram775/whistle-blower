import { Setting } from '../models/index.js';
import { Op } from 'sequelize';

export const index = async (req, res) => {
    try {
        const result = await Setting.findAll({ where: { master_key: 'config' } });
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.error('Setting index error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

export const setting_submit = async (req, res) => {
    try {
        let data = req.body;

        // Handle image paths (Laravel logic clone)
        // Agar frontend ne nayi file ka naam bheja hai toh use karo, warna purana edit_... use karo.
        data.company_logo = data.company_logo || data.edit_company_logo;
        data.company_fav_logo = data.company_fav_logo || data.edit_company_fav_logo;
        data.config_home_page_produce_the_bg_image = data.config_home_page_produce_the_bg_image || data.edit_config_home_page_produce_the_bg_image;

        const result = await Setting.findAll({ where: { master_key: 'config' } });

        if (result && result.length > 0) {
            for (const key of Object.keys(data)) {
                if (key === '_token' || key === 'edit_company_logo' || key === 'edit_company_fav_logo' || key === 'edit_config_home_page_produce_the_bg_image') continue;

                // Find matching config_key
                const match = result.find(item => item.config_key === key);
                if (match) {
                    await Setting.update({ config_value: data[key] }, { where: { id: match.id } });
                }
            }
        }

        return res.status(200).json({ status: true, message: 'Data Successfully Submitted' });
    } catch (error) {
        console.error('Setting submit error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};