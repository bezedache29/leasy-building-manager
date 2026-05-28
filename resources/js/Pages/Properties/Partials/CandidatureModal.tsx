import { useEffect, useState } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import { Tenant } from '@/Types/tenant';
import { Guarantor } from '@/Types/guarantor';

interface Props {
  show: boolean;
  onClose: () => void;
  propertyId: number;
  tenants: Tenant[];
}

export default function CandidatureModal({ show, onClose, propertyId, tenants }: Props) {
  const [search, setSearch] = useState('');
  const [selectedTenantIds, setSelectedTenantIds] = useState<number[]>([]);
  const [selectedGuarantorId, setSelectedGuarantorId] = useState<number | null>(null);
  const [rentAmount, setRentAmount] = useState('');
  const [chargesAmount, setChargesAmount] = useState('');

  // Réinitialisation à chaque ouverture
  useEffect(() => {
    if (show) {
      setSearch('');
      setSelectedTenantIds([]);
      setSelectedGuarantorId(null);
      setRentAmount('');
      setChargesAmount('');
    }
  }, [show]);

  // Garants disponibles : union des garants des locataires sélectionnés
  const availableGuarantors: Guarantor[] = [];
  const seenIds = new Set<number>();
  for (const tenant of tenants) {
    if (selectedTenantIds.includes(tenant.id) && tenant.guarantors) {
      for (const g of tenant.guarantors) {
        if (!seenIds.has(g.id)) {
          seenIds.add(g.id);
          availableGuarantors.push(g);
        }
      }
    }
  }

  // Si le garant sélectionné n'est plus dans la liste disponible, on le réinitialise
  // seenIds est intentionnellement exclu : c'est un Set recréé à chaque render,
  // l'ajouter provoquerait une boucle infinie. selectedTenantIds suffit car seenIds en dérive.
  useEffect(() => {
    if (selectedGuarantorId !== null && !seenIds.has(selectedGuarantorId)) {
      setSelectedGuarantorId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantIds, selectedGuarantorId]);

  const toggleTenant = (id: number) => {
    setSelectedTenantIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const filteredTenants = tenants.filter((t) => {
    const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const canGenerate =
    selectedTenantIds.length > 0 &&
    selectedGuarantorId !== null &&
    rentAmount.trim() !== '' &&
    parseFloat(rentAmount) >= 0;

  const handleGenerate = () => {
    if (!canGenerate) return;

    const params = new URLSearchParams();
    selectedTenantIds.forEach((id) => params.append('tenant_ids[]', String(id)));
    params.append('guarantor_id', String(selectedGuarantorId));
    params.append('rent_amount', rentAmount);
    if (chargesAmount.trim() !== '') {
      params.append('charges_amount', chargesAmount);
    }

    const url = route('properties.candidature.acte', propertyId) + '?' + params.toString();
    window.open(url, '_blank');
    onClose();
  };

  const inputClass =
    'block w-full rounded-md border border-[rgb(var(--border))] bg-surface text-app px-3 py-2 text-sm focus:border-[rgb(var(--primary-500))] focus:ring-1 focus:ring-[rgb(var(--primary-500))] focus:outline-none';
  const labelClass = 'block text-sm font-medium text-app mb-1';

  return (
    <Modal show={show} onClose={onClose} maxWidth="lg">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl">
        <h2 className="text-xl font-semibold text-app mb-1">Générer un acte de cautionnement</h2>
        <p className="text-sm text-muted mb-6">
          Sans bail — pour la phase de candidature. La date d'effet sera à renseigner manuellement.
        </p>

        {/* Étape 1 : Sélection des locataires */}
        <div className="mb-6">
          <label className={labelClass}>
            Locataire(s) candidat(s){' '}
            <span className="text-muted font-normal">(cochez tous les co-locataires)</span>
          </label>

          <input
            type="text"
            placeholder="Rechercher un locataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass + ' mb-2'}
          />

          <div className="max-h-48 overflow-y-auto rounded-md border border-[rgb(var(--border))] divide-y divide-[rgb(var(--border))]">
            {filteredTenants.length === 0 ? (
              <p className="p-3 text-sm text-muted text-center">Aucun locataire trouvé</p>
            ) : (
              filteredTenants.map((tenant) => (
                <label
                  key={tenant.id}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-surface-2 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTenantIds.includes(tenant.id)}
                    onChange={() => toggleTenant(tenant.id)}
                    className="h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary-500))] focus:ring-[rgb(var(--primary-500))]"
                  />
                  <div>
                    <span className="text-sm font-medium text-app">
                      {tenant.first_name} {tenant.last_name}
                    </span>
                    {tenant.guarantors && tenant.guarantors.length > 0 && (
                      <span className="ml-2 text-xs text-muted">
                        ({tenant.guarantors.length} garant
                        {tenant.guarantors.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Étape 2 : Sélection du garant */}
        <div className="mb-6">
          <label className={labelClass}>
            Garant <span className="text-muted font-normal">(un acte par garant)</span>
          </label>

          {selectedTenantIds.length === 0 ? (
            <p className="text-sm text-muted italic">
              Sélectionnez d'abord un ou plusieurs locataires.
            </p>
          ) : availableGuarantors.length === 0 ? (
            <p className="text-sm text-[rgb(var(--warning-700))] italic">
              Aucun garant trouvé pour les locataires sélectionnés.
            </p>
          ) : (
            <div className="rounded-md border border-[rgb(var(--border))] divide-y divide-[rgb(var(--border))]">
              {availableGuarantors.map((guarantor) => (
                <label
                  key={guarantor.id}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-surface-2 transition-colors"
                >
                  <input
                    type="radio"
                    name="guarantor"
                    checked={selectedGuarantorId === guarantor.id}
                    onChange={() => setSelectedGuarantorId(guarantor.id)}
                    className="h-4 w-4 border-[rgb(var(--border))] text-[rgb(var(--primary-500))] focus:ring-[rgb(var(--primary-500))]"
                  />
                  <span className="text-sm font-medium text-app">
                    {guarantor.first_name} {guarantor.last_name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Étape 3 : Montants */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="rent_amount" className={labelClass}>
              Loyer hors charges (€)
            </label>
            <input
              type="number"
              id="rent_amount"
              min="0"
              step="0.01"
              placeholder="ex: 550"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="charges_amount" className={labelClass}>
              Charges (€) <span className="text-muted font-normal">– Optionnel</span>
            </label>
            <input
              type="number"
              id="charges_amount"
              min="0"
              step="0.01"
              placeholder="ex: 50"
              value={chargesAmount}
              onChange={(e) => setChargesAmount(e.target.value)}
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
