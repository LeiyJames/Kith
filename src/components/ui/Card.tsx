import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm transition-all duration-300 ${
        hoverEffect ? 'hover:shadow-md hover:border-slate-200/60 dark:hover:border-slate-700/80 hover-scale' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
