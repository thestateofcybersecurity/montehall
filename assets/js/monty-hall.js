// assets/js/monty-hall.js
const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

// Create styled components using Tailwind classes
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, disabled, variant, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md transition-colors ${
      variant === "outline"
        ? "border border-gray-300 hover:bg-gray-50"
        : "bg-blue-500 text-white hover:bg-blue-600"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
  >
    {children}
  </button>
);
