import { District, State } from '../models/index.js';

export const get_district_list = async (req, res) => {
    try {
        const list = await District.findAll({
            where: { status: 1, state_id: req.body.state_id },
            attributes: ['id', 'district_name']
        });
        return res.status(200).json({ status: true, data: list });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error' });
    }
};

export const index = async (req, res) => {
    try {
        const result = await District.findAll({
            attributes: ['id', 'state_id', 'district_name', 'sort_order', 'status'],
            include: [{ model: State, as: 'state', attributes: ['state_name'] }]
        });
        const data = result.map((row, key) => ({
            id: row.id,
            srno: key + 1,
            state_name: row.state ? row.state.state_name : '',
            district_name: row.district_name,
            sort_order: row.sort_order,
            status: row.status
        }));
        return res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Error' });
    }
};

export const store = async (req, res) => {
    try {
        await District.create(req.body);
        return res.status(201).json({ status: true, message: 'Data Successfully Submitted' });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};

export const update = async (req, res) => {
    try {
        const item = await District.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.update(req.body);
        return res.status(200).json({ status: true, message: 'Data Successfully Updated' });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};

export const multipleDelete = async (req, res) => {
    try {
        const data_id = JSON.parse(req.body.data_id);
        await District.destroy({ where: { id: data_id } });
        return res.status(200).json({ status: true, message: 'Record successfully deleted' });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};

export const changeStatus = async (req, res) => {
    try {
        const { status_id, status } = req.body;
        await District.update({ status }, { where: { id: status_id } });
        return res.status(200).json({ status: true, message: 'Status successfully updated' });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};

export const getStateList = async (req, res) => {
    try {
        const list = await State.findAll({ where: { status: 1 }, attributes: ['id', 'state_name'] });
        return res.status(200).json({ status: true, data: list });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};