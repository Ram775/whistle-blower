import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import DataTable from './DataTable';

const MasterTable = ({ type, title }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [type]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/master/${type}`);
            if (response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === '1' ? '0' : '1';
        try {
            await api.post(`/master/${type}/change_status`, { status_id: id, status: newStatus });
            fetchData(); // Refresh
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await api.post(`/master/${type}/multiple_delete`, { data_id: JSON.stringify([id]) });
            fetchData(); // Refresh
        } catch (error) {
            console.error(error);
        }
    };

    // Dynamic Columns based on Type
    const getColumns = () => {
        const baseCols = [
            { header: 'Sr No', accessor: 'srno' },
            { header: 'Name', accessor: 'name' },
        ];

        if (type === 'states') baseCols.push({ header: 'Country', accessor: 'country_name' });
        if (type === 'districts') baseCols.push({ header: 'State', accessor: 'state_name' });
        if (type === 'cities') baseCols.push({ header: 'District', accessor: 'district_name' });
        if (type === 'disclosure-details') baseCols.push({ header: 'Email', accessor: 'email' });

        baseCols.push(
            { header: 'Sort Order', accessor: 'sort_order' },
            { 
                header: 'Status', 
                accessor: 'status',
                render: (row) => (
                    <button 
                        onClick={() => handleStatusToggle(row.id, row.status)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${row.status === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {row.status === '1' ? 'Active' : 'Inactive'}
                    </button>
                )
            },
            {
                header: 'Action',
                accessor: 'id',
                render: (row) => (
                    <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </div>
                )
            }
        );

        return baseCols;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 text-sm">
                    <Plus className="w-4 h-4 mr-1" /> Add New
                </button>
            </div>
            <DataTable 
                columns={getColumns()} 
                data={data} 
                loading={loading} 
                emptyMessage={`No ${title} found.`}
            />
        </div>
    );
};

export default MasterTable;