import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // ✅ Ye import zaroori hai
import MasterTable from '../../components/admin/MasterTable';

const MasterData = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // ✅ URL se initial tab uthao, agar nahi hai toh 'countries'
    const initialTab = searchParams.get('tab') || 'countries';
    const [activeTab, setActiveTab] = useState(initialTab);

    // ✅ Agar URL change ho (jaise sidebar se click kare), toh tab update karo
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    const tabs = [
        { key: 'countries', label: 'Country' },
        { key: 'states', label: 'State' },
        { key: 'districts', label: 'District' },
        { key: 'cities', label: 'City' },
        { key: 'vigilance-angles', label: 'Event' }, // ✅ Laravel me "Event" tha
        { key: 'disclosure-details', label: 'Disclosure Detail' },
    ];

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        // ✅ URL bhi update karo taaki sidebar ka link sync rahe
        setSearchParams({ tab: tabKey });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Master Data Management</h1>
            
            <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
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