import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 md:ml-64 bg-gray-100 min-h-screen">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}