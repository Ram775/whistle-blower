import { State, Country } from '../models/index.js';

export const index = async (req, res) => {
    try {
        const result = await State.findAll({
            attributes: ['id', 'country_id', 'state_name', 'sort_order', 'status'],
            include: [{ model: Country, as: 'Country', attributes: ['name'] }]
        });
        const data = result.map((row, key) => ({
            id: row.id,
            srno: key + 1,
            country_name: row.Country ? row.Country.name : '',
            name: row.state_name,
            sort_order: row.sort_order,
            status: row.status
        }));
        return res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

export const store = async (req, res) => {
    try {
        await State.create(req.body);
        return res.status(201).json({ status: true, message: 'Data Successfully Submitted' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const update = async (req, res) => {
    try {
        const state = await State.findByPk(req.params.id);
        if (!state) return res.status(404).json({ message: 'Not found' });
        await state.update(req.body);
        return res.status(200).json({ status: true, message: 'Data Successfully Updated' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const multipleDelete = async (req, res) => {
    try {
        const data_id = JSON.parse(req.body.data_id);
        await State.destroy({ where: { id: data_id } });
        return res.status(200).json({ status: true, message: 'Record successfully deleted' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const changeStatus = async (req, res) => {
    try {
        const { status_id, status } = req.body;
        await State.update({ status }, { where: { id: status_id } });
        return res.status(200).json({ status: true, message: 'Status successfully updated' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

export const getCountryList = async (req, res) => {
    try {
        const countries = await Country.findAll({ where: { status: 1 }, order: [['name', 'ASC']] });
        return res.status(200).json({ status: true, data: countries });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error' });
    }
};