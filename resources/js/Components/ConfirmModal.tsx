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
}

export default function ConfirmModal({
  show,
  onClose,
  onConfirm,
  title,
  confirmText = 'Archiver',
  cancelText = 'Annuler',
  children,
}: PropsWithChildren<Props>) {
  return (
    <Modal show={show} onClose={onClose} maxWidth="md">
      <div className="bg-surface p-8 rounded-xl border border-[rgb(var(--border))] shadow-2xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-app">{title}</h2>

        <p className="mt-6 text-sm text-muted leading-relaxed">{children}</p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
