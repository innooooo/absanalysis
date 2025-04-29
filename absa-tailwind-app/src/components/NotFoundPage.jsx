import React from 'react';
import { NavLink } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-center px-4">
      <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-300 mb-6">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>
      <NavLink
        to="/"
        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded transition duration-200"
      >
        Go back home
      </NavLink>
    </div>
  );
};

export default NotFoundPage;
