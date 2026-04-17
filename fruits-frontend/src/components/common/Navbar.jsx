import { FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const { logout } = useAuth();

  return (
    <div className="h-14 bg-white shadow flex items-center justify-between px-4 md:px-6">
      
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button className="md:hidden" onClick={toggleSidebar}>
          <FaBars size={18} />
        </button>

        <h1 className="font-semibold text-lg">🍎 Fruit Dashboard</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 md:gap-6">
        <FaBell className="cursor-pointer text-gray-600" />

        <div className="hidden sm:flex items-center gap-2">
          <FaUserCircle size={22} />
          <span className="text-sm font-medium">Admin</span>
        </div>

        <button
          onClick={logout}
          className="text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}