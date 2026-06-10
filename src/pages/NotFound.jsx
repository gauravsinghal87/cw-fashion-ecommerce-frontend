import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <h1 className="text-6xl sm:text-8xl font-bold text-gray-200">404</h1>
      <h2 className="text-lg sm:text-xl font-semibold mt-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="inline-block mt-6 px-6 py-2.5 text-sm bg-primary text-white hover:bg-primary-dark transition-colors min-h-[44px] leading-[44px]">Go Home</Link>
    </div>
  </div>
);

export default NotFound;
