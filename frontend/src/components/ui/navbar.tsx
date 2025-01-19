import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/home", label: "Home" },
    { path: "/create-profile", label: "Profile" },
    { path: "/matches", label: "Matches" },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center h-16">
          {" "}
          {/* Updated this line */}
          <div className="flex items-center space-x-8">
            {" "}
            {/* Added items-center here */}
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-lg font-bold ${
                  location.pathname === item.path
                    ? "border-indigo-500 text-gray-400 cursor-not-allowed"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
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
              className="hover:bg-red-600 text-white text-lg font-bold py-1 px-2 rounded"
              // Removed mb-8 as it was causing vertical spacing issues
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
