import { Slider } from '../models/index.js';
import { Op } from 'sequelize';

export const index = async (req, res) => {
    try {
        const result = await Slider.findAll({
            attributes: ['id', 'image', 'sort_order', 'status']
        });

        const data = result.map((row, key) => ({
            id: row.id,
            srno: key + 1,
            image: row.image,
            sort_order: row.sort_order,
            status: row.status
        }));

        return res.status(200).json({ data });
    } catch (error) {
        console.error('Slider index error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

export const store = async (req, res) => {
    try {
        await Slider.create(req.body);
        return res.status(201).json({ status: true, message: 'Data Successfully Submitted' });
    } catch (error) {
        console.error('Slider store error:', error);
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const update = async (req, res) => {
    try {
        const slider = await Slider.findByPk(req.params.id);
        if (!slider) return res.status(404).json({ status: false, message: 'Slider not found' });

        // Fallback logic for image
        const imageToSave = req.body.image || req.body.edit_image;
        
        await slider.update({
            image: imageToSave,
            alt_tag: req.body.alt_tag,
            sort_order: req.body.sort_order,
            status: req.body.status
        });

        return res.status(200).json({ status: true, message: 'Data Successfully Updated' });
    } catch (error) {
        console.error('Slider update error:', error);
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const delete_image = async (req, res) => {
    try {
        const { id, column_name } = req.body;
        
        // Validate column_name to prevent SQL injection/mass assignment
        const allowedColumns = ['image', 'alt_tag']; // Add others if needed
        if (!allowedColumns.includes(column_name)) {
            return res.status(400).json({ status: false, message: 'Invalid column' });
        }

        await Slider.update({ [column_name]: '' }, { where: { id } });
        return res.status(200).json({ status: true, message: 'Image successfully deleted' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const multipleDelete = async (req, res) => {
    try {
        const data_id = JSON.parse(req.body.data_id);
        await Slider.destroy({ where: { id: data_id } });
        return res.status(200).json({ status: true, message: 'Record successfully deleted' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const changeStatus = async (req, res) => {
    try {
        const { status_id, status } = req.body;
        await Slider.update({ status }, { where: { id: status_id } });
        return res.status(200).json({ status: true, message: 'Status successfully updated' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};