import { forwardRef, InputHTMLAttributes, MutableRefObject, useEffect, useRef } from 'react';

export default forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean; error?: string }
>(function TextInput({ type = 'text', className = '', isFocused = false, error, ...props }, ref) {
  const localRef = useRef<HTMLInputElement | null>(null);

  const handleRef = (node: HTMLInputElement | null) => {
    (localRef as MutableRefObject<HTMLInputElement | null>).current = node;

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <>
      <input
        {...props}
        type={type}
        className={[
          'w-full rounded-md border bg-surface text-app',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
            : 'border-[rgb(var(--border))] focus:border-[rgb(var(--primary-hover))]',
          'px-3 py-2 outline-none transition-all duration-150',
          'focus:outline-none focus:ring-0',
          '[&::-webkit-calendar-picker-indicator]:opacity-50',
          '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
          '[color-scheme:dark]',
          className,
        ].join(' ')}
        ref={handleRef}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-400">{error}</p>}
    </>
  );
});
