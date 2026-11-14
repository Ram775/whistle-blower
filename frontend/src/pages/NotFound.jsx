import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
            <AlertTriangle className="w-20 h-20 text-yellow-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-6 text-center">The page you are looking for does not exist.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFound;