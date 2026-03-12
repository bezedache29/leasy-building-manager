import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, InertiaLinkProps } from '@inertiajs/react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'success'
  | 'warning'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

// 1. Les props communes aux deux versions (Bouton et Lien)
type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

// 2. Le typage strict si c'est un vrai <button> (pas de href)
type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

// 3. Le typage strict si c'est un <Link> (href obligatoire + props spécifiques à Inertia/Anchor)
type ButtonAsLink = BaseProps &
  Omit<InertiaLinkProps, keyof BaseProps> & {
    href: string;
  };

// 4. L'Union discriminée : TypeScript saura automatiquement lequel utiliser
export type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-500))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))] disabled:opacity-50 disabled:pointer-events-none rounded-md';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 text-white border border-transparent',
    secondary: 'bg-secondary-500 text-white border border-app',
    outline: 'border border-[rgb(var(--border))] bg-outline text-app',
    danger: 'bg-red-400 text-white hover:bg-red-600 border border-transparent',
    success: 'bg-success-500 text-white border border-transparent',
    warning: 'bg-warning-500 text-white border border-transparent',
    ghost: 'bg-transparent border-transparent hover:bg-surface-2 text-app',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (props.href !== undefined) {
    return (
      <Link {...props} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} type={props.type ?? 'button'} className={combinedClasses}>
      {children}
    </button>
  );
}
