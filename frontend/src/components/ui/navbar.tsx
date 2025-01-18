import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/create-profile', label: 'Profile' },
    { path: '/matches', label: 'Matches' },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === item.path
                    ? 'border-indigo-500 text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={(e) => {
                  if (location.pathname === item.path) {
                    e.preventDefault();
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                sessionStorage.removeItem("token");
                window.location.reload();
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-8"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}