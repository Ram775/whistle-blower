import { useState } from 'react';
import MasterTable from '../../components/admin/MasterTable';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('countries');

    const tabs = [
        { key: 'countries', label: 'Country' },
        { key: 'states', label: 'State' },
        { key: 'districts', label: 'District' },
        { key: 'cities', label: 'City' },
        { key: 'vigilance-angles', label: 'Vigilance Angle' },
        { key: 'disclosure-details', label: 'Disclosure Detail' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Master Data Management</h1>
            
            <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab.key 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                <MasterTable type={activeTab} title={tabs.find(t => t.key === activeTab)?.label} />
            </div>
        </div>
    );
};

export default MasterData;