import { forwardRef, SelectHTMLAttributes, useImperativeHandle, useRef } from 'react';

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export default forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { className = '', error, children, ...props },
  ref
) {
  const localRef = useRef<HTMLSelectElement | null>(null);

  useImperativeHandle(ref, () => localRef.current as HTMLSelectElement);

  const errorId = props.id && error ? `${props.id}-error` : undefined;

  return (
    <div className="flex w-full flex-col">
      <select
        {...props}
        ref={localRef}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId ?? props['aria-describedby']}
        className={
          'border-[rgb(var(--border))] bg-surface text-app focus:border-[rgb(var(--primary-500))] focus:ring-[rgb(var(--primary-500))] rounded-md shadow-sm ' +
          (error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ' : '') +
          className
        }
      >
        {children}
      </select>

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
