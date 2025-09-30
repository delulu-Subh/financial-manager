import React from "react";

const Button = ({ children, onClick, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
    >
      {children}
    </button>
  );
};

export default Button;
