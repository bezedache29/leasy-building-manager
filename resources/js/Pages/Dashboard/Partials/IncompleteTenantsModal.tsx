import { Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';

// On définit exactement ce dont la modale a besoin pour fonctionner
interface Tenant {
  id: number;
  full_name: string;
  email: string | null;
}

interface Props {
  show: boolean;
  onClose: () => void;
  tenants: Tenant[];
}

export default function IncompleteTenantsModal({ show, onClose, tenants }: Props) {
  return (
    <Modal show={show} onClose={onClose} maxWidth="2xl">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-app">Dossiers à compléter</h2>
          <span className="bg-amber-500/10 text-amber-500 py-1 px-3 rounded-full text-sm font-medium">
            {tenants.length} dossier(s)
          </span>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="flex items-center justify-between p-4 rounded-lg border border-[rgb(var(--border))] bg-surface-2 hover:border-[rgb(var(--primary-500))] transition-colors"
            >
              <div>
                <p className="font-medium text-app">{tenant.full_name}</p>
                <p className="text-sm text-muted">{tenant.email || "Pas d'email renseigné"}</p>
              </div>
              <Link
                href={route('tenants.show', tenant.id)}
                className="px-4 py-2 bg-[rgb(var(--primary-500))] text-white text-sm font-medium rounded-md hover:bg-[rgb(var(--primary-600))] transition-colors"
              >
                Ouvrir le dossier
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[rgb(var(--border))] flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
