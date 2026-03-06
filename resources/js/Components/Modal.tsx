import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { PropsWithChildren } from 'react';

export default function Modal({
  children,
  show = false,
  maxWidth = 'md',
  closeable = true,
  onClose = () => {},
  id,
}: PropsWithChildren<{
  show: boolean;
  maxWidth?: 'sm' | 'md' | 'lg';
  closeable?: boolean;
  onClose: CallableFunction;
  id?: string;
}>) {
  const close = () => {
    if (closeable) {
      onClose();
    }
  };

  // Les 3 tailles demandées
  const maxWidthClass = {
    sm: 'sm:max-w-sm', // ~384px
    md: 'sm:max-w-xl', // ~576px (idéal pour un formulaire classique)
    lg: 'sm:max-w-4xl', // ~896px (idéal pour un grand tableau ou prévisualisation PDF)
  }[maxWidth];

  return (
    <Transition show={show} leave="duration-200">
      <Dialog
        as="div"
        id={id}
        className="fixed inset-0 z-50 flex transform items-center overflow-y-auto px-4 py-6 transition-all sm:px-0"
        onClose={close}
      >
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Fond d'assombrissement avec léger flou */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <DialogPanel
            className={`mx-auto mb-6 w-full transform overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-surface shadow-xl transition-all ${maxWidthClass}`}
          >
            {children}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
