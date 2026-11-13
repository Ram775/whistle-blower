const StatCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-500',
        yellow: 'bg-yellow-500',
        orange: 'bg-orange-500',
        green: 'bg-green-500',
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between border-l-4 border-transparent hover:border-blue-500 transition-all">
            <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
                <h2 className="text-3xl font-bold text-gray-800 mt-2">{value}</h2>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white bg-opacity-20 ${colorClasses[color]}`}>
                <Icon className="w-6 h-6 text-gray-700" />
            </div>
        </div>
    );
};

export default StatCard;