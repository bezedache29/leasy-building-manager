import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import { Tenant } from '@/Types/tenant';
import { Guarantor } from '@/Types/guarantor';
import GuarantorModal from './Partials/GuarantorModal';
import { DOCUMENT_CATEGORIES } from '@/Constants/documentCategories';
import MissingItemsModal from '@/Pages/Tenants/Partials/MissingItemsModal';

export default function Show({
  tenant,
  availableGuarantors,
}: {
  tenant: Tenant;
  availableGuarantors: Guarantor[];
}) {
  const { delete: destroyTenant } = useForm();

  // --- Gestion de l'état des Modales ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuarantor, setEditingGuarantor] = useState<Guarantor | null>(null);

  // 👈 Nouvel état pour la modale des pièces manquantes
  const [showMissingModal, setShowMissingModal] = useState(false);

  const openModalForAdd = () => {
    setEditingGuarantor(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (guarantor: Guarantor) => {
    setEditingGuarantor(guarantor);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingGuarantor(null), 300);
  };

  // --- Actions ---
  const archiveTenant = () => {
    if (confirm('Voulez-vous vraiment archiver ce dossier locataire ?')) {
      destroyTenant(route('tenants.destroy', tenant.id));
    }
  };

  // --- Styles et Utilitaires d'affichage ---
  const sectionClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';
  const labelClass = 'text-sm font-medium text-muted';
  const valueClass = 'mt-1 text-base text-app font-medium';

  const getCategoryLabel = (cat: string) => {
    return DOCUMENT_CATEGORIES[cat] || cat;
  };

  const getMaritalStatusLabel = (status: string | null) => {
    if (!status) return '—';
    const statuses: Record<string, string> = {
      single: 'Célibataire',
      married: 'Marié(e)',
      pacs: 'Pacsé(e)',
      divorced: 'Divorcé(e)',
      widowed: 'Veuf / Veuve',
      colocation: 'En colocation',
    };
    return statuses[status] || status;
  };

  const getRelationshipLabel = (rel: string | null) => {
    if (!rel) return 'Non renseigné';
    const relationships: Record<string, string> = {
      parent: 'Parent',
      grandparent: 'Grand-parent',
      sibling: 'Frère / Sœur',
      friend: 'Ami(e)',
      colleague: 'Collègue',
      other: 'Autre',
    };
    return relationships[rel] || rel;
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-app">
                Dossier de {tenant.first_name} {tenant.last_name}
              </h1>

              {!tenant.is_complete && tenant.missing_items && (
                <button
                  onClick={() => setShowMissingModal(true)}
                  className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500 transition-colors hover:bg-amber-500/20 focus:outline-none cursor-pointer"
                  title="Voir les éléments manquants"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Dossier incomplet
                </button>
              )}

              {/* ✅ BADGE DOSSIER COMPLET (Non cliquable) */}
              {tenant.is_complete && (
                <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-500 cursor-default">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Dossier complet
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="danger" onClick={archiveTenant}>
              Archiver
            </Button>
            <Link href={route('tenants.edit', tenant.id)}>
              <Button variant="primary">Modifier</Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className={sectionClass}>
              <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                Informations du locataire
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className={labelClass}>Statut marital</p>
                  <p className={valueClass}>{getMaritalStatusLabel(tenant.marital_status)}</p>
                </div>
                <div>
                  <p className={labelClass}>Profession</p>
                  <p className={valueClass}>{tenant.profession || '—'}</p>
                </div>
                <div>
                  <p className={labelClass}>Email</p>
                  <p className={valueClass}>{tenant.email || '—'}</p>
                </div>
                <div>
                  <p className={labelClass}>Téléphone</p>
                  <p className={valueClass}>{tenant.phone || '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className={labelClass}>Adresse actuelle</p>
                  <p className={valueClass}>{tenant.current_address || '—'}</p>
                </div>
                <div>
                  <p className={labelClass}>Né(e) le</p>
                  <p className={valueClass}>
                    {tenant.birth_date ? new Date(tenant.birth_date).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className={labelClass}>À</p>
                  <p className={valueClass}>{tenant.birth_place || '—'}</p>
                </div>
                <div>
                  <p className={labelClass}>Nationalité</p>
                  <p className={valueClass}>{tenant.nationality ? tenant.nationality : '—'}</p>
                </div>
                {tenant.notes && (
                  <div className="sm:col-span-2 pt-4 border-t border-[rgb(var(--border))]">
                    <p className={labelClass}>Notes internes</p>
                    <p className="mt-2 text-sm text-app whitespace-pre-line">{tenant.notes}</p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4 mt-8">
              <div className="flex items-center justify-between pl-1">
                <h2 className="text-lg font-semibold text-app">
                  Garants ({tenant.guarantors?.length || 0})
                </h2>
                <Button variant="outline" size="sm" onClick={openModalForAdd}>
                  + Ajouter un garant
                </Button>
              </div>

              {!tenant.guarantors || tenant.guarantors.length === 0 ? (
                <div className={`${sectionClass} bg-surface-2 flex justify-center py-8`}>
                  <p className="text-sm text-muted italic">
                    Aucun garant n'est rattaché à ce dossier.
                  </p>
                </div>
              ) : (
                tenant.guarantors.map((guarantor) => (
                  <div key={guarantor.id} className={`${sectionClass} bg-surface-2`}>
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-md font-semibold text-[rgb(var(--primary-400))]">
                          {guarantor.first_name} {guarantor.last_name}
                        </h3>
                        <span className="rounded-full bg-[rgb(var(--surface))] px-3 py-1 text-xs font-medium text-muted border border-[rgb(var(--border))]">
                          Lien : {getRelationshipLabel(guarantor.pivot?.relationship || null)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModalForEdit(guarantor)}
                        >
                          Modifier
                        </Button>
                        <Button variant="danger" size="sm">
                          Retirer
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className={labelClass}>Contact</p>
                        <p className="text-sm text-app mt-1">{guarantor.email || "Pas d'email"}</p>
                        <p className="text-sm text-app">{guarantor.phone || 'Pas de téléphone'}</p>
                      </div>
                      <div>
                        <p className={labelClass}>Situation & Profession</p>
                        <p className="text-sm text-app mt-1">{guarantor.profession || '—'}</p>
                        <p className="text-sm text-app">
                          {getMaritalStatusLabel(guarantor.marital_status)}
                        </p>
                      </div>
                      <div>
                        <p className={labelClass}>Né(e) le</p>
                        <p className={valueClass}>
                          {guarantor.birth_date
                            ? new Date(guarantor.birth_date).toLocaleDateString()
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className={labelClass}>À</p>
                        <p className={valueClass}>{guarantor.birth_place || '—'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className={labelClass}>Adresse</p>
                        <p className="text-sm text-app mt-1">{guarantor.current_address || '—'}</p>
                      </div>
                      <div>
                        <p className={labelClass}>Nationalité</p>
                        <p className={valueClass}>
                          {guarantor.nationality ? guarantor.nationality : '—'}
                        </p>
                      </div>
                    </div>
                    {guarantor.documents && guarantor.documents.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[rgb(var(--border))]">
                        <p className="text-sm font-medium text-muted mb-3">Documents joints :</p>
                        <ul className="space-y-2">
                          {guarantor.documents.map((doc) => (
                            <li key={doc.id}>
                              <a
                                href={`/storage/${doc.file_path}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-2"
                              >
                                📄 {getCategoryLabel(doc.category || '')} - {doc.name || 'Document'}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className={sectionClass}>
              <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                Documents du dossier
              </h2>
              {!tenant.documents || tenant.documents.length === 0 ? (
                <p className="text-sm text-muted italic">Aucun document enregistré.</p>
              ) : (
                <ul className="space-y-3">
                  {tenant.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="p-3 rounded-lg border border-[rgb(var(--border))] bg-surface-2 hover:border-[rgb(var(--primary-500))] transition-colors"
                    >
                      <a
                        href={`/storage/${doc.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col gap-1"
                      >
                        <span className="text-sm font-semibold text-primary">
                          {getCategoryLabel(doc.category || '')}
                        </span>
                        <span className="text-xs text-muted">{doc.name || 'Fichier'}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* --- MODALES --- */}

      {/* 1. Modale des éléments manquants */}
      {tenant.missing_items && (
        <MissingItemsModal
          show={showMissingModal}
          onClose={() => setShowMissingModal(false)}
          tenant={tenant}
        />
      )}

      {/* 2. Modale des garants */}
      <GuarantorModal
        show={isModalOpen}
        onClose={handleModalClose}
        tenantId={tenant.id}
        guarantor={editingGuarantor}
        availableGuarantors={availableGuarantors}
      />
    </AppLayout>
  );
}
