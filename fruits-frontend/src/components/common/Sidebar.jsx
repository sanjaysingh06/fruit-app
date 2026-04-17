import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaExchangeAlt,
  FaBook,
  FaBoxOpen,
} from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", path: "/", icon: <FaTachometerAlt /> },
  { name: "Accounts", path: "/accounts", icon: <FaUsers /> },
  { name: "Transactions", path: "/transactions", icon: <FaExchangeAlt /> },
  { name: "Ledger", path: "/ledger", icon: <FaBook /> },
  { name: "Outstanding", path: "/outstanding", icon: <FaBook /> },
  { name: "Crates", path: "/crates", icon: <FaBoxOpen /> },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:w-64 w-64`}
      >
        <div className="p-4 border-b border-gray-700 font-bold text-lg">
          🍎 Fruit App
        </div>

        <ul className="mt-4 space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={toggleSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition
                  ${
                    isActive
                      ? "bg-gray-800 border-l-4 border-green-500"
                      : "hover:bg-gray-800"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}