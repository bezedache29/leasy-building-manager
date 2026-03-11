import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { Property } from '@/Types/property';
import { formatFloor } from '@/Utils/formatters';

interface Props {
  properties: Property[];
}

export default function Index({ properties }: Props) {
  // Fonction utilitaire pour traduire le type en français
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

  // Fonction pour associer un petit emoji/icône sympa selon le type
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      studio: '🛋️',
      apartment: '🏠',
      commercial: '🏬',
      garage: '🚗',
      other: '📦',
    };
    return icons[type] || '🏢';
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl pb-12">
        {/* En-tête de la page */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-app">Mon Immeuble</h1>
            <p className="mt-1 text-sm text-muted">
              Gestion de vos {properties.length} biens et locaux.
            </p>
          </div>
          <div>
            <Button href={route('properties.create')} variant="primary">
              + Ajouter un bien
            </Button>
          </div>
        </header>

        {/* Grille des biens */}
        {properties.length === 0 ? (
          <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
              🏢
            </div>
            <h3 className="text-lg font-medium text-app">Aucun bien enregistré</h3>
            <p className="mt-2 text-sm text-muted">
              Commencez par ajouter les lots de votre immeuble.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex flex-col rounded-xl border border-[rgb(var(--border))] bg-surface shadow-sm transition-shadow hover:shadow-md"
              >
                {/* En-tête de la carte */}
                <div className="border-b border-[rgb(var(--border))] p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" title={getTypeLabel(property.type)}>
                        {getTypeIcon(property.type)}
                      </span>
                      <div>
                        <h2
                          className="text-lg font-bold text-app line-clamp-1"
                          title={property.name}
                        >
                          {property.name}
                        </h2>
                        <span className="inline-block mt-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted border border-[rgb(var(--border))]">
                          {getTypeLabel(property.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corps de la carte (Informations clés) */}
                <div className="flex-1 p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Étage
                      </p>
                      <p className="mt-1 text-sm text-app">{formatFloor(property.floor)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Étage
                      </p>
                      <p className="mt-1 text-sm text-app">
                        {property.floor !== null ? property.floor : '—'}
                      </p>
                    </div>

                    {/* Affichage des deux types de tantièmes */}
                    <div className="col-span-2 grid grid-cols-2 rounded bg-surface-2 p-2 border border-[rgb(var(--border))]">
                      <div>
                        <p className="text-xs font-medium text-muted uppercase tracking-wider">
                          💧 Eau
                        </p>
                        <p className="mt-1 text-sm text-app">
                          {property.tantiemes_eau !== null
                            ? `${property.tantiemes_eau} / 10000`
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted uppercase tracking-wider">
                          ⚡ Communs
                        </p>
                        <p className="mt-1 text-sm text-app">
                          {property.tantiemes_communs !== null
                            ? `${property.tantiemes_communs} / 1000`
                            : '—'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Loyer
                      </p>
                      <p className="mt-1 text-sm text-app">600 €</p>
                    </div>
                  </div>

                  {property.description && (
                    <div className="mt-4 pt-4 border-t border-[rgb(var(--border))]">
                      <p className="text-sm text-muted line-clamp-2">{property.description}</p>
                    </div>
                  )}
                </div>

                {/* Pied de la carte (Actions) */}
                <div className="flex items-center gap-2 border-t border-[rgb(var(--border))] bg-surface-2 p-4 rounded-b-xl">
                  <Button
                    href={route('properties.show', property.id)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Voir le dossier
                  </Button>
                  <Button href={route('properties.edit', property.id)} variant="warning">
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
