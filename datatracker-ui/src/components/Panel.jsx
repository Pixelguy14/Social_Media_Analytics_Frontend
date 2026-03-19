import React from 'react';

const Panel = ({ children, title, subtitle, className = '', headerAction }) => {
  return (
    <div className={`border-4 border-picto-border bg-picto-panel relative overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0 bg-dither opacity-20 pointer-events-none" 
        style={{ backgroundSize: '4px 4px', imageRendering: 'pixelated' }}
      ></div>
      <div className="relative p-4 font-ds h-full flex flex-col">
        {(title || subtitle || headerAction) && (
            <div className="mb-4 shrink-0">
                <div className="flex justify-between items-start border-b-2 border-picto-border mb-1">
                    {title && (
                        <h2 className="text-black uppercase">{title}</h2>
                    )}
                    {headerAction && (
                        <div className="pb-1">{headerAction}</div>
                    )}
                </div>
                {subtitle && (
                    <p className="text-sm font-bold text-black">{subtitle}</p>
                )}
            </div>
        )}
        <div className="flex-grow min-h-0 relative flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Panel;
