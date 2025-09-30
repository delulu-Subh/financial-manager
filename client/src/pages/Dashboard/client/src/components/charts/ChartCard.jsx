import React from 'react';

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-sm text-gray-500 font-medium mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
};

export default ChartCard;

