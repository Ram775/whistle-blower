import { City, District } from '../models/index.js';

export const check_city_name_duplication = async (req, res) => {
    try {
        const city_exist = await City.findOne({ where: { city_name: req.body.city_name } });
        return res.send(city_exist ? 'false' : 'true');
    } catch (error) { return res.send('true'); }
};

export const get_city_list = async (req, res) => {
    try {
        const city_list = await City.findAll({
            where: { status: 1, district_id: req.body.district_id },
            attributes: ['id', 'city_name']
        });
        return res.status(200).json({ status: true, data: city_list });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};

export const index = async (req, res) => {
    try {
        const result = await City.findAll({
            attributes: ['id', 'district_id', 'city_name', 'pincode', 'sort_order', 'status'],
            include: [{ model: District, as: 'district', attributes: ['district_name'] }]
        });
        const data = result.map((row, key) => ({
            id: row.id,
            srno: key + 1,
            district_name: row.district ? row.district.district_name : '',
            name: row.city_name,
            pincode: row.pincode,
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
        await City.create(req.body);
        return res.status(201).json({ status: true, message: 'Data Successfully Submitted' });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};

export const update = async (req, res) => {
    try {
        const item = await City.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.update(req.body);
        return res.status(200).json({ status: true, message: 'Data Successfully Updated' });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};

export const multipleDelete = async (req, res) => {
    try {
        const data_id = JSON.parse(req.body.data_id);
        await City.destroy({ where: { id: data_id } });
        return res.status(200).json({ status: true, message: 'Record successfully deleted' });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};

export const changeStatus = async (req, res) => {
    try {
        const { status_id, status } = req.body;
        await City.update({ status }, { where: { id: status_id } });
        return res.status(200).json({ status: true, message: 'Status successfully updated' });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};

export const getDistrictList = async (req, res) => {
    try {
        const list = await District.findAll({ where: { status: 1 }, attributes: ['id', 'district_name'] });
        return res.status(200).json({ status: true, data: list });
    } catch (error) { return res.status(500).json({ status: false, message: 'Error' }); }
};