import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'purple' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = ''
}) => {
  const variantStyles = {
    primary: 'bg-brand-50 text-brand-800 border-brand-200/80',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    info: 'bg-sky-50 text-sky-800 border-sky-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200/80',
    danger: 'bg-red-50 text-red-800 border-red-200/80'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
