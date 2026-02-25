import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
  className = '',
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest',
        'bg-primary text-white cursor-pointer transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}
