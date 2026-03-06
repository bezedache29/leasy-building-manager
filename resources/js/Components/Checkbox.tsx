import { InputHTMLAttributes } from 'react';

export default function Checkbox({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="checkbox"
      className={
        'rounded border-[rgb(var(--border))] bg-surface text-[rgb(var(--primary))] shadow-sm focus:ring-[rgb(var(--primary))] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer transition-colors ' +
        className
      }
    />
  );
}
