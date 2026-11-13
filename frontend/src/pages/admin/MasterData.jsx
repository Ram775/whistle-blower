import { useState } from 'react';
import MasterTable from '../../components/admin/MasterTable'; // Naya component banayenge

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('Country');

    const tabs = ['Country', 'State', 'District', 'City', 'Vigilance Angle', 'Disclosure Detail'];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Master Data Management</h1>
            
            {/* Tabs */}
            <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Table Content based on Tab */}
            <div className="mt-4">
                {activeTab === 'Country' && <MasterTable type="countries" title="Countries" />}
                {activeTab === 'State' && <MasterTable type="states" title="States" />}
                {activeTab === 'District' && <MasterTable type="districts" title="Districts" />}
                {activeTab === 'City' && <MasterTable type="cities" title="Cities" />}
                {activeTab === 'Vigilance Angle' && <MasterTable type="vigilance-angles" title="Vigilance Angles" />}
                {activeTab === 'Disclosure Detail' && <MasterTable type="disclosure-details" title="Disclosure Details" />}
            </div>
        </div>
    );
};

export default MasterData;