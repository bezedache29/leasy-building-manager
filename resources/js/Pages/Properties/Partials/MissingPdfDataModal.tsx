import Modal from '@/Components/Modal';
import Button from '@/Components/Button';

interface Props {
  show: boolean;
  onClose: () => void;
  missingData: string[];
}

export default function MissingPdfDataModal({ show, onClose, missingData }: Props) {
  return (
    <Modal show={show} onClose={onClose} maxWidth="xl">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl shadow-lg">
        {/* En-tête de la modale */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-app">
            <span className="text-2xl">⚠️</span> Dossier incomplet
          </h2>
          <button
            onClick={onClose}
            className="text-muted transition-colors hover:text-red-500 cursor-pointer text-2xl leading-none"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>

        {/* Explications */}
        <p className="mb-4 text-sm text-muted">
          Le contrat de location PDF ne peut pas être généré car les informations suivantes sont
          manquantes :
        </p>

        {/* Liste des erreurs avec style */}
        <ul className="mb-8 space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-600">
          {missingData.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Bouton de fermeture */}
        <div className="flex justify-end pt-4 border-t border-[rgb(var(--border))]">
          <Button onClick={onClose} variant="secondary">
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
