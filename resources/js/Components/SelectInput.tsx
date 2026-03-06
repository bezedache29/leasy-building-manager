import { forwardRef, MutableRefObject, SelectHTMLAttributes, useRef } from 'react';

export default forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectInput({ className = '', children, ...props }, ref) {
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
      <select
        {...props}
        className={[
          'w-full rounded-md border bg-surface text-app',
          'border-[rgb(var(--border))]',
          'px-3 py-2 outline-none transition-all duration-150',
          'focus:outline-none focus:ring-0 focus:border-[rgb(var(--primary-900))]',
          className,
        ].join(' ')}
        ref={handleRef}
      >
        {children}
      </select>
    );
  }
);
