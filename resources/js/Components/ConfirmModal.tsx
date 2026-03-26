import { PropsWithChildren } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'info';
}

export default function ConfirmModal({
  show,
  onClose,
  onConfirm,
  title,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  children,
}: PropsWithChildren<Props>) {
  const styleConfig = {
    danger: {
      iconBg: 'bg-red-500/10 text-red-500',
      btnVariant: 'danger' as const,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
    warning: {
      iconBg: 'bg-[rgb(var(--warning-500))]/10 text-[rgb(var(--warning-600))]',
      btnVariant: 'warning' as const,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    primary: {
      iconBg: 'bg-[rgb(var(--primary-500))]/10 text-[rgb(var(--primary-500))]',
      btnVariant: 'primary' as const,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    info: {
      iconBg: 'bg-blue-500/10 text-blue-500',
      btnVariant: 'primary' as const,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const currentStyle = styleConfig[variant] || styleConfig.danger;

  return (
    <Modal show={show} onClose={onClose} maxWidth="md">
      <div className="bg-surface p-8 rounded-xl border border-[rgb(var(--border))] shadow-2xl text-center">
        {/* Icône dynamique */}
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${currentStyle.iconBg}`}
        >
          {currentStyle.icon}
        </div>

        <h2 className="text-xl font-bold text-app">{title}</h2>

        <div className="mt-6 text-sm text-muted leading-relaxed text-left">{children}</div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={currentStyle.btnVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
