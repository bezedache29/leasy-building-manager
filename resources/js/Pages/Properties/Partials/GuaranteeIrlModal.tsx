import { useEffect, useState } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import { Guarantor } from '@/Types/guarantor';

interface Props {
  show: boolean;
  onClose: () => void;
  leaseId: number | null;
  guarantor: Guarantor | null;
}

export default function GuaranteeIrlModal({ show, onClose, leaseId, guarantor }: Props) {
  const [irlQuarter, setIrlQuarter] = useState('');
  const [irlValue, setIrlValue] = useState('');

  // Réinitialisation à chaque ouverture
  useEffect(() => {
    if (show) {
      setIrlQuarter('');
      setIrlValue('');
    }
  }, [show]);

  const canGenerate = irlQuarter.trim() !== '' && irlValue.trim() !== '';

  const handleGenerate = () => {
    if (!canGenerate || !leaseId || !guarantor) return;

    const params = new URLSearchParams();
    params.append('irl_quarter', irlQuarter.trim());
    params.append('irl_value', irlValue.trim());

    const url =
      route('leases.guarantors.pdf', { lease: leaseId, guarantor: guarantor.id }) +
      '?' +
      params.toString();
    window.open(url, '_blank');
    onClose();
  };

  const inputClass =
    'block w-full rounded-md border border-[rgb(var(--border))] bg-surface text-app px-3 py-2 text-sm focus:border-[rgb(var(--primary-500))] focus:ring-1 focus:ring-[rgb(var(--primary-500))] focus:outline-none';
  const labelClass = 'block text-sm font-medium text-app mb-1';

  return (
    <Modal show={show} onClose={onClose} maxWidth="sm">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl">
        <h2 className="text-xl font-semibold text-app mb-1">Générer l'acte de cautionnement</h2>
        <p className="text-sm text-muted mb-6">
          {guarantor && (
            <>
              Pour {guarantor.first_name} {guarantor.last_name}
              <br />
            </>
          )}
          Indice de référence des loyers (IRL) à mentionner dans l'acte.
        </p>

        <div className="mb-6">
          <label className={labelClass}>
            Trimestre et valeur IRL{' '}
            <a
              href="https://www.insee.fr/fr/statistiques/serie/001515333"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgb(var(--primary-400))] hover:text-[rgb(var(--primary-300))] font-normal"
            >
              (voir la valeur actuelle sur l'INSEE →)
            </a>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ex: 2e trimestre 2026"
              value={irlQuarter}
              onChange={(e) => setIrlQuarter(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Valeur, ex: 148,37"
              value={irlValue}
              onChange={(e) => setIrlValue(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border))]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" variant="primary" onClick={handleGenerate} disabled={!canGenerate}>
            Générer le PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
