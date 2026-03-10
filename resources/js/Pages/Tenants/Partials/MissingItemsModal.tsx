import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import { Tenant } from '@/Types/tenant';
import { DOCUMENT_CATEGORIES } from '@/Constants/documentCategories';

interface Props {
  show: boolean;
  onClose: () => void;
  tenant: Tenant;
}

const FIELD_LABELS: Record<string, string> = {
  first_name: 'Prénom',
  last_name: 'Nom',
  marital_status: 'Situation familiale',
  email: 'Email',
  phone: 'Téléphone',
  current_address: 'Adresse',
  birth_date: 'Date de naissance',
  birth_place: 'Lieu de naissance',
  profession: 'Profession',
};

export default function MissingItemsModal({ show, onClose, tenant }: Props) {
  // Sécurité au cas où on l'appelle sur un dossier déjà complet
  if (!tenant.missing_items) return null;

  return (
    <Modal show={show} onClose={onClose} maxWidth="3xl">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-app">Éléments manquants</h2>
        </div>

        <div className="space-y-6 text-sm max-h-[60vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Ce qu'il manque au locataire */}
          {(tenant.missing_items.tenant.fields.length > 0 ||
            tenant.missing_items.tenant.documents.length > 0) && (
            <div className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-4">
              <p className="font-medium text-app mb-3">
                👤 Locataire ({tenant.first_name} {tenant.last_name}) :
              </p>
              <div className="flex flex-wrap gap-2">
                {tenant.missing_items.tenant.fields.map((f) => (
                  <span
                    key={`t-f-${f}`}
                    className="rounded bg-surface border border-[rgb(var(--border))] px-2 py-1 text-muted"
                  >
                    ✍️ {FIELD_LABELS[f] || f}
                  </span>
                ))}
                {tenant.missing_items.tenant.documents.map((d) => (
                  <span
                    key={`t-d-${d}`}
                    className="rounded bg-surface border border-[rgb(var(--border))] px-2 py-1 text-muted"
                  >
                    📄 {DOCUMENT_CATEGORIES[d] || d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ce qu'il manque aux garants */}
          {tenant.missing_items.guarantors &&
            tenant.missing_items.guarantors.map((g) => (
              <div
                key={g.id}
                className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-4"
              >
                <p className="font-medium text-app mb-3">🛡️ Garant ({g.name}) :</p>
                <div className="flex flex-wrap gap-2">
                  {g.fields.map((f) => (
                    <span
                      key={`g-f-${f}`}
                      className="rounded bg-surface border border-[rgb(var(--border))] px-2 py-1 text-muted"
                    >
                      ✍️ {FIELD_LABELS[f] || f}
                    </span>
                  ))}
                  {g.documents.map((d) => (
                    <span
                      key={`g-d-${d}`}
                      className="rounded bg-surface border border-[rgb(var(--border))] px-2 py-1 text-muted"
                    >
                      📄 {DOCUMENT_CATEGORIES[d] || d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="mt-6 flex justify-end pt-4 border-t border-[rgb(var(--border))]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
