import { Country } from '../models/index.js';

export const index = async (req, res) => {
    try {
        const result = await Country.findAll({
            attributes: ['id', 'name', 'sort_order', 'status']
        });
        const data = result.map((row, key) => ({
            id: row.id,
            srno: key + 1,
            name: row.name,
            sort_order: row.sort_order,
            status: row.status
        }));
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error' });
    }
};

export const store = async (req, res) => {
    try {
        await Country.create(req.body);
        return res.status(201).json({ status: true, message: 'Data Successfully Submitted' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const update = async (req, res) => {
    try {
        const item = await Country.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.update(req.body);
        return res.status(200).json({ status: true, message: 'Data Successfully Updated' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const multipleDelete = async (req, res) => {
    try {
        const data_id = JSON.parse(req.body.data_id);
        await Country.destroy({ where: { id: data_id } });
        return res.status(200).json({ status: true, message: 'Record successfully deleted' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const changeStatus = async (req, res) => {
    try {
        const { status_id, status } = req.body;
        await Country.update({ status }, { where: { id: status_id } });
        return res.status(200).json({ status: true, message: 'Status successfully updated' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};