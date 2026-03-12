import { forwardRef, MutableRefObject, SelectHTMLAttributes, useRef } from 'react';

export interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export default forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { className = '', error, children, ...props },
  ref
) {
  const localRef = useRef<HTMLSelectElement | null>(null);

  const handleRef = (node: HTMLSelectElement | null) => {
    (localRef as MutableRefObject<HTMLSelectElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as MutableRefObject<HTMLSelectElement | null>).current = node;
    }
  };

  return (
    <div className="w-full">
      <select
        {...props}
        className={[
          'w-full rounded-md border bg-surface text-app',
          'px-3 py-2 outline-none transition-all duration-150',
          'focus:outline-none focus:ring-0',
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-[rgb(var(--border))] focus:border-[rgb(var(--primary-900))]',
          className,
        ].join(' ')}
        ref={handleRef}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-red-400">{error}</p>}
    </div>
  );
});
