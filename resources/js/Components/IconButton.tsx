import { ButtonVariant } from '@/Components/Button';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon: ReactNode;
}

export default function IconButton({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled,
  icon,
  ...props
}: IconButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-500))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))] disabled:opacity-50 disabled:pointer-events-none rounded-md';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 text-white border border-transparent',
    secondary: 'bg-secondary-500 text-white border border-app',
    outline: 'border border-[rgb(var(--border))] bg-outline text-app',
    danger: 'bg-red-400 text-white hover:bg-red-600 border border-transparent',
    success: 'bg-success-500 text-white border border-transparent',
    warning: 'bg-warning-500 text-white border border-transparent',
  };

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <button
      type={type}
      {...props}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <span className="flex items-center justify-center">{icon}</span>
    </button>
  );
}
