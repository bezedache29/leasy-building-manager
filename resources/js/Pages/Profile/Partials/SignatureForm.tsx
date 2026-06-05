import { ChangeEvent, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import Button from '@/Components/Button';

interface Props {
  hasSignature: boolean;
}

export default function SignatureForm({ hasSignature }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    router.post(
      route('profile.signature.store'),
      { signature: selectedFile },
      {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          setSelectedFile(null);
          setPreview(null);
        },
      }
    );
  };

  const handleDelete = () => {
    router.delete(route('profile.signature.destroy'), {
      preserveScroll: true,
      onSuccess: () => setShowConfirmDelete(false),
    });
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-app mb-1">Signature du bailleur</h2>
      <p className="text-sm text-muted mb-5">
        Uploadez une image de votre signature (PNG ou JPG, fond blanc ou transparent). Elle sera
        automatiquement intégrée dans les quittances de loyer générées.
      </p>

      {/* Aperçu de la signature existante ou du fichier sélectionné */}
      {(hasSignature || preview) && (
        <div className="mb-5 inline-flex flex-col items-start gap-3">
          <div className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-4">
            <img
              src={preview ?? route('profile.signature.show')}
              alt="Signature"
              className="h-16 object-contain"
              style={{ maxWidth: '220px' }}
            />
          </div>
          {!preview && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Signature configurée
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {preview ? (
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleUpload}>
            Enregistrer cette signature
          </Button>
          <Button variant="secondary" onClick={handleCancel}>
            Annuler
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            {hasSignature ? 'Modifier la signature' : 'Uploader une signature'}
          </Button>
          {hasSignature && !showConfirmDelete && (
            <Button variant="danger" onClick={() => setShowConfirmDelete(true)}>
              Supprimer
            </Button>
          )}
          {showConfirmDelete && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Confirmer la suppression ?</span>
              <Button variant="danger" onClick={handleDelete}>
                Oui, supprimer
              </Button>
              <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
                Non
              </Button>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
      />
    </div>
  );
}
