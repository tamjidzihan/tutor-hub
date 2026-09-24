import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]';

  const variantStyles = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow focus:ring-brand-400',
    secondary: 'bg-navy-900 hover:bg-navy-800 text-white shadow-sm hover:shadow focus:ring-slate-700',
    outline: 'border border-brand-500 text-brand-700 bg-white hover:bg-brand-50 focus:ring-brand-400',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500'
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
