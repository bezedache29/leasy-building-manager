import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))] disabled:opacity-50 disabled:pointer-events-none rounded-md';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 text-white border border-transparent',
    secondary: 'bg-secondary-500 text-white border border-app',
    outline: 'border border-[rgb(var(--border))] bg-outline text-app',
    danger: 'bg-red-400 text-white hover:bg-red-600 border border-transparent',
    success: 'bg-success-500 text-white border border-transparent',
    warning: 'bg-warning-500 text-white border border-transparent',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
