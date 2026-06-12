import { useRef } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import { useForm } from 'react-hook-form';
import { router } from '@inertiajs/react';
import { Lease } from '@/Types/lease';

interface Props {
  show: boolean;
  onClose: () => void;
  lease: Lease | null;
}

interface DocumentFormData {
  signed_lease: File[];
  signed_inventory: File[];
  signed_guarantee: File[];
}

export default function UploadSignedDocsModal({ show, onClose, lease }: Props) {
  const {
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormData>({
    defaultValues: {
      signed_lease: [],
      signed_inventory: [],
      signed_guarantee: [],
    },
  });

  const signedLeaseFiles = watch('signed_lease');
  const signedInventoryFiles = watch('signed_inventory');
  const signedGuaranteeFiles = watch('signed_guarantee');

  const leaseInputRef = useRef<HTMLInputElement>(null);
  const inventoryInputRef = useRef<HTMLInputElement>(null);
  const guaranteeInputRef = useRef<HTMLInputElement>(null);

  const existingDocs = lease?.documents || [];
  const hasSignedLease = existingDocs.some((d) => d.category === 'signed_lease');
  const hasSignedInventory = existingDocs.some((d) => d.category === 'signed_inventory');
  const hasSignedGuarantee = existingDocs.some((d) => d.category === 'signed_guarantee');

  // L'acte de caution ne concerne que les garants ordinaires (pas Visale)
  const hasGuarantors = lease?.guarantors?.some((g) => g.type !== 'visale') ?? false;

  const handleClose = () => {
    reset();
    clearErrors();
    onClose();
  };

  const onSubmit = (data: DocumentFormData) => {
    if (!lease) return;

    const payload: Record<string, File[]> = {
      signed_lease: data.signed_lease,
      signed_inventory: data.signed_inventory,
      signed_guarantee: data.signed_guarantee,
    };

    router.post(route('leases.documents.store', lease.id), payload, {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => handleClose(),
      onError: (serverErrors: Record<string, string>) => {
        if (serverErrors.signed_lease)
          setError('signed_lease', { type: 'server', message: serverErrors.signed_lease });
        if (serverErrors.signed_inventory)
          setError('signed_inventory', { type: 'server', message: serverErrors.signed_inventory });
        if (serverErrors.signed_guarantee)
          setError('signed_guarantee', { type: 'server', message: serverErrors.signed_guarantee });
      },
    });
  };

  const fileAreaClass =
    'mt-3 flex justify-center rounded border border-dashed border-[rgb(var(--border))] bg-surface px-6 py-6 hover:border-[rgb(var(--primary-400))] transition-colors cursor-pointer';

  const hideScrollbarClass = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

  return (
    <Modal show={show} onClose={handleClose} maxWidth="2xl">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--primary-500))]/10 text-[rgb(var(--primary-500))]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-app">Uploader les documents signés</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            className={`space-y-6 text-sm max-h-[60vh] overflow-y-auto px-1 ${hideScrollbarClass}`}
          >
            {/* 1. BAIL */}
            {!hasSignedLease && (
              <div className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-4">
                <p className="font-medium text-app mb-1">📄 Bail signé par les parties</p>
                <p className="text-xs text-muted mb-3">Formats acceptés : PDF, Images, ZIP, RAR</p>

                <div className={fileAreaClass} onClick={() => leaseInputRef.current?.click()}>
                  <div className="text-center w-full">
                    {signedLeaseFiles && signedLeaseFiles.length > 0 ? (
                      <div className="flex flex-col items-center text-emerald-500">
                        <svg
                          className="mx-auto h-8 w-8 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-bold mb-2">
                          {signedLeaseFiles.length} fichier(s) sélectionné(s)
                        </span>
                        <div
                          className={`max-h-32 overflow-y-auto w-full px-4 text-xs text-muted space-y-1 ${hideScrollbarClass}`}
                        >
                          {signedLeaseFiles.map((file, index) => (
                            <div
                              key={index}
                              className="truncate w-full text-center bg-surface rounded px-2 py-1 border border-[rgb(var(--border))]"
                            >
                              {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-8 w-8 text-muted mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="mt-2 block text-sm font-medium text-app">
                          Cliquez pour sélectionner un ou plusieurs fichiers
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    ref={leaseInputRef}
                    className="hidden"
                    accept=".pdf,image/*,.zip,.rar"
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      setValue('signed_lease', files, { shouldValidate: true });
                    }}
                  />
                </div>
                {errors.signed_lease && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.signed_lease.message as string}
                  </p>
                )}
              </div>
            )}

            {/* 2. ETAT DES LIEUX */}
            {!hasSignedInventory && (
              <div className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-4">
                <p className="font-medium text-app mb-1">🔑 État des lieux d'entrée signé</p>
                <p className="text-xs text-muted mb-3">Formats acceptés : PDF, Images, ZIP, RAR</p>

                <div className={fileAreaClass} onClick={() => inventoryInputRef.current?.click()}>
                  <div className="text-center w-full">
                    {signedInventoryFiles && signedInventoryFiles.length > 0 ? (
                      <div className="flex flex-col items-center text-emerald-500">
                        <svg
                          className="mx-auto h-8 w-8 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-bold mb-2">
                          {signedInventoryFiles.length} fichier(s) sélectionné(s)
                        </span>
                        <div
                          className={`max-h-32 overflow-y-auto w-full px-4 text-xs text-muted space-y-1 ${hideScrollbarClass}`}
                        >
                          {signedInventoryFiles.map((file, index) => (
                            <div
                              key={index}
                              className="truncate w-full text-center bg-surface rounded px-2 py-1 border border-[rgb(var(--border))]"
                            >
                              {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-8 w-8 text-muted mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="mt-2 block text-sm font-medium text-app">
                          Cliquez pour sélectionner un ou plusieurs fichiers
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    ref={inventoryInputRef}
                    className="hidden"
                    accept=".pdf,image/*,.zip,.rar"
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      setValue('signed_inventory', files, { shouldValidate: true });
                    }}
                  />
                </div>
                {errors.signed_inventory && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.signed_inventory.message as string}
                  </p>
                )}
              </div>
            )}

            {/* 3. ACTE DE CAUTION (Affiche uniquement si le bail a des garants) */}
            {hasGuarantors && !hasSignedGuarantee && (
              <div className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-4">
                <p className="font-medium text-app mb-1">🛡️ Acte de caution solidaire signé</p>
                <p className="text-xs text-muted mb-3">Formats acceptés : PDF, Images, ZIP, RAR</p>

                <div className={fileAreaClass} onClick={() => guaranteeInputRef.current?.click()}>
                  <div className="text-center w-full">
                    {signedGuaranteeFiles && signedGuaranteeFiles.length > 0 ? (
                      <div className="flex flex-col items-center text-emerald-500">
                        <svg
                          className="mx-auto h-8 w-8 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-bold mb-2">
                          {signedGuaranteeFiles.length} fichier(s) sélectionné(s)
                        </span>
                        <div
                          className={`max-h-32 overflow-y-auto w-full px-4 text-xs text-muted space-y-1 ${hideScrollbarClass}`}
                        >
                          {signedGuaranteeFiles.map((file, index) => (
                            <div
                              key={index}
                              className="truncate w-full text-center bg-surface rounded px-2 py-1 border border-[rgb(var(--border))]"
                            >
                              {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-8 w-8 text-muted mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="mt-2 block text-sm font-medium text-app">
                          Cliquez pour sélectionner un ou plusieurs fichiers
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    ref={guaranteeInputRef}
                    className="hidden"
                    accept=".pdf,image/*,.zip,.rar"
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      setValue('signed_guarantee', files, { shouldValidate: true });
                    }}
                  />
                </div>
                {errors.signed_guarantee && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.signed_guarantee.message as string}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border))]">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                isSubmitting ||
                (signedLeaseFiles.length === 0 &&
                  signedInventoryFiles.length === 0 &&
                  signedGuaranteeFiles.length === 0)
              }
            >
              Sauvegarder les documents
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
