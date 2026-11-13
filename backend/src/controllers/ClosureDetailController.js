import { DisclosureDetail } from '../models/index.js';

export const index = async (req, res) => {
    try {
        const result = await DisclosureDetail.findAll({
            attributes: ['id', 'name', 'email', 'sort_order', 'status']
        });

        const data = result.map((row, key) => ({
            id: row.id,
            srno: key + 1,
            name: row.name,
            email: row.email,
            sort_order: row.sort_order,
            status: row.status
        }));

        return res.status(200).json({ data });
    } catch (error) {
        console.error('ClosureDetail index error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

export const store = async (req, res) => {
    try {
        await DisclosureDetail.create(req.body);
        return res.status(201).json({ status: true, message: 'Data Successfully Submitted' });
    } catch (error) {
        console.error('ClosureDetail store error:', error);
        return res.status(500).json({ status: false, message: 'Oops something went wrong!' });
    }
};

export const update = async (req, res) => {
    try {
        const item = await DisclosureDetail.findByPk(req.params.id);
        if (!item) return res.status(404).json({ status: false, message: 'Not found' });

        await item.update(req.body);
        return res.status(200).json({ status: true, message: 'Data Successfully Updated' });
    } catch (error) {
        console.error('ClosureDetail update error:', error);
        return res.status(500).json({ status: false, message: 'Oops something went wrong!' });
    }
};

export const multipleDelete = async (req, res) => {
    try {
        const data_id = JSON.parse(req.body.data_id);
        await DisclosureDetail.destroy({ where: { id: data_id } });
        return res.status(200).json({ status: true, message: 'Record successfully deleted' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Oops Something went wrong' });
    }
};

export const changeStatus = async (req, res) => {
    try {
        const { status_id, status } = req.body;
        await DisclosureDetail.update({ status }, { where: { id: status_id } });
        return res.status(200).json({ status: true, message: 'Status successfully updated' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Oops Something went wrong' });
    }
};