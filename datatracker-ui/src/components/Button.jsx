import React from 'react';

const Button = ({ children, onClick, className = '', disabled = false, type = 'button' }) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative bg-white border-2 border-picto-border px-4 py-1 
        active:translate-y-[2px] active:translate-x-[2px] 
        hover:bg-picto-bg transition-all duration-75
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-picto-accent focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-0
        group cursor-pointer ${className}
      `}
    >
      <span className="absolute inset-0 border-t-2 border-l-2 border-white pointer-events-none group-active:border-none"></span>
      <span className="font-ds text-lg text-picto-border block select-none">
        {children}
      </span>
    </button>
  );
};

export default Button;
