import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-app text-app flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-app bg-surface p-6">{children}</div>
    </div>
  );
}
