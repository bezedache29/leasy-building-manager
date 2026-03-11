import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { Property } from '@/Types/property';
import { useForm } from '@inertiajs/react';
import { formatFloor } from '@/Utils/formatters';
import Modal from '@/Components/Modal'; // Retour au bon composant
import { useState } from 'react';

interface Props {
  property: Property;
}

export default function Show({ property }: Props) {
  const { delete: destroy } = useForm();

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const handleArchiveClick = () => {
    setIsArchiveModalOpen(true);
  };

  const executeArchive = () => {
    destroy(route('properties.destroy', property.id));
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      studio: 'Studio',
      apartment: 'Appartement',
      commercial: 'Local Commercial',
      garage: 'Garage / Parking',
      other: 'Autre',
    };
    return types[type] || type;
  };

  const sectionClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';
  const labelClass = 'text-sm font-medium text-muted';
  const valueClass = 'mt-1 text-base text-app font-medium';

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-app">{property.name}</h1>
              <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-medium text-muted border border-[rgb(var(--border))]">
                {getTypeLabel(property.type)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="danger" onClick={handleArchiveClick}>
              Archiver
            </Button>
            <Button href={route('properties.edit', property.id)} variant="primary">
              Modifier
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className={sectionClass}>
              <div className="flex justify-between">
                <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                  Informations du lot
                </h2>
                <p className="text-muted text-sm">Loyer : 600 €</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className={labelClass}>Étage</p>
                  <p className={valueClass}>{formatFloor(property.floor)}</p>
                </div>
                <div>
                  <p className={labelClass}>Surface habitable</p>
                  <p className={valueClass}>
                    {property.surface_area ? `${property.surface_area} m²` : '—'}
                  </p>
                </div>
                <div>
                  <p className={labelClass}>Tantièmes Eau (Général)</p>
                  <p className={valueClass}>
                    {property.tantiemes_eau !== null ? `${property.tantiemes_eau} / 10000` : '—'}
                  </p>
                </div>
                <div>
                  <p className={labelClass}>Tantièmes Communs (Bâtiment)</p>
                  <p className={valueClass}>
                    {property.tantiemes_communs !== null
                      ? `${property.tantiemes_communs} / 1000`
                      : '—'}
                  </p>
                </div>

                {property.description && (
                  <div className="sm:col-span-2 pt-4 border-t border-[rgb(var(--border))]">
                    <p className={labelClass}>Description / Équipements</p>
                    <p className="mt-2 text-sm text-app whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}

                {property.notes && (
                  <div className="sm:col-span-2 pt-4 border-t border-[rgb(var(--border))]">
                    <p className={labelClass}>Notes internes</p>
                    <p className="mt-2 text-sm text-app whitespace-pre-line">{property.notes}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className={sectionClass}>
              <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                Occupation & Baux
              </h2>
              <div className="rounded-lg bg-surface-2 p-4 text-center border border-[rgb(var(--border))]">
                <p className="text-sm text-muted italic">
                  La gestion des baux sera implémentée à la prochaine étape.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Modal show={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} maxWidth="md">
        <div className="bg-surface p-8 rounded-xl border border-[rgb(var(--border))] shadow-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-app">Archiver le bien</h2>
          <p className="mt-6 text-sm text-muted leading-relaxed">
            Es-tu sûr de vouloir archiver le lot <br />
            <span className="font-semibold text-app">"{property.name}"</span> ? <br /> <br />
            Cette action masquera le bien des vues principales.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="secondary" onClick={() => setIsArchiveModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={executeArchive}>
              Archiver
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
