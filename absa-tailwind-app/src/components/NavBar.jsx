import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const NavBar = () => {
  const linkClass =
    'px-4 py-2 rounded transition duration-200';

  const activeClass = 'bg-gray-900 font-semibold';
  const inactiveClass = 'hover:bg-gray-700';

  return (
    <div>
      <nav className="bg-gray-800 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold tracking-wide">ABSA</span>

          <div className="flex space-x-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Upload Reviews
            </NavLink>
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  );
};

export default NavBar;
