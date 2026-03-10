import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '@inertiajs/react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Ajout de la prop 'href' optionnelle
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled,
  href, // Extraction de href
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
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Centralisation des classes pour pouvoir les utiliser dans les deux balises
  const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  // Si on a un lien, on retourne un composant de navigation valide HTML5
  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  // Sinon, on retourne le bouton classique
  return (
    <button type={type} {...props} disabled={disabled} className={combinedClasses}>
      {children}
    </button>
  );
}
