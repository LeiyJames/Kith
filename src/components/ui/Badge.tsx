import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'emergency';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  
  const variants = {
    neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    info: 'bg-brand-blue-50 text-brand-blue-600 dark:bg-brand-blue-900/20 dark:text-brand-blue-400',
    success: 'bg-brand-green-50 text-brand-green-600 dark:bg-brand-green-900/20 dark:text-brand-green-400',
    warning: 'bg-brand-amber-50 text-brand-amber-600 dark:bg-brand-amber-900/20 dark:text-brand-amber-400',
    danger: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    emergency: 'bg-red-500 text-white animate-pulse'
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
