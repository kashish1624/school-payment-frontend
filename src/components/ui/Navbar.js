import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const Navbar = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 flex justify-between items-center shadow">
      {/* Left Side */}
      <div className="flex items-center gap-6">
        <h1 className="font-bold text-lg">School Payment Dashboard</h1>
        <Link to="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
        <Link to="/school" className="hover:text-indigo-400">By School</Link>
        <Link to="/status" className="hover:text-indigo-400">Check Status</Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>
        <button
          onClick={onLogout}
          className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
