import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-xl font-bold text-gray-900">📊 Financial Dashboard</h1>
      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder="Search..."
          className="pl-3 pr-4 py-2 bg-white border border-gray-300 rounded text-sm w-64"
        />
        <button className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
          Filter
        </button>
      </div>
    </header>
  );
};

export default Header;
