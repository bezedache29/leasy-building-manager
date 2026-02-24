import { forwardRef, InputHTMLAttributes, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
  {
    type = 'text',
    className = '',
    isFocused = false,
    ...props
  }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
  ref
) {
  const localRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <input
      {...props}
      type={type}
      className={[
        'w-full rounded-md border bg-surface text-app',
        'border-[rgb(var(--border))]',
        'px-3 py-2 outline-none transition-all duration-150',
        'focus:outline-none focus:ring-0 focus:border-[rgb(var(--primary-hover))]',
        className,
      ].join(' ')}
      ref={localRef}
    />
  );
});
