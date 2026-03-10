import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, router, useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import { Tenant } from '@/Types/tenant';
import { Guarantor } from '@/Types/guarantor';
import GuarantorModal from './Partials/GuarantorModal';
import { DOCUMENT_CATEGORIES } from '@/Constants/documentCategories';
import MissingItemsModal from '@/Pages/Tenants/Partials/MissingItemsModal';
import IconButton from '@/Components/IconButton';
import Modal from '@/Components/Modal';
import { AppDocument } from '@/Types';
import ExistingDocumentItem from '@/Pages/Tenants/Partials/ExistingDocumentItem';

export default function Show({
  tenant,
  availableGuarantors,
}: {
  tenant: Tenant;
  availableGuarantors: Guarantor[];
}) {
  const { delete: destroyTenant } = useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuarantor, setEditingGuarantor] = useState<Guarantor | null>(null);
  const [docToDelete, setDocToDelete] = useState<AppDocument | null>(null);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [guarantorToDelete, setGuarantorToDelete] = useState<Guarantor | null>(null);

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

  const archiveTenant = () => {
    if (confirm('Voulez-vous vraiment archiver ce dossier locataire ?')) {
      destroyTenant(route('tenants.destroy', tenant.id));
    }
  };

  const confirmDeleteDocument = () => {
    if (!docToDelete) return;

    router.delete(route('documents.destroy', docToDelete.id), {
      preserveScroll: true,
      onSuccess: () => setDocToDelete(null),
      onFinish: () => setDocToDelete(null),
    });
  };

  // Fonction pour détacher le garant via Inertia
  const confirmDeleteGuarantor = () => {
    if (!guarantorToDelete) return;

    router.delete(route('tenants.guarantors.destroy', [tenant.id, guarantorToDelete.id]), {
      preserveScroll: true,
      onSuccess: () => setGuarantorToDelete(null),
      onFinish: () => setGuarantorToDelete(null),
    });
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
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setGuarantorToDelete(guarantor)}
                        >
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
                            <ExistingDocumentItem
                              key={doc.id}
                              doc={doc}
                              onDelete={setDocToDelete}
                            />
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
                      className="flex items-center justify-between p-3 rounded-lg border border-[rgb(var(--border))] bg-surface-2 transition-colors"
                    >
                      <a
                        href={`/storage/${doc.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col gap-1 min-w-0 flex-1 pr-4"
                      >
                        <span className="text-sm font-semibold text-primary truncate">
                          {getCategoryLabel(doc.category || '')}
                        </span>
                        <span className="text-xs text-muted truncate">{doc.name || 'Fichier'}</span>
                      </a>

                      <IconButton
                        variant="danger"
                        size="sm"
                        title="Supprimer le document"
                        onClick={() => setDocToDelete(doc)}
                        className="bg-red-500/30"
                        icon={
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        }
                      />
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

      {/* 3. Modale demande suppression document */}
      <Modal show={docToDelete !== null} onClose={() => setDocToDelete(null)} maxWidth="md">
        <div className="bg-surface p-8 rounded-xl border border-[rgb(var(--border))] shadow-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-app">Supprimer le document</h2>

          <p className="mt-6 text-sm text-muted leading-relaxed">
            Es-tu sûr de vouloir retirer le document <br />
            <span className="font-semibold text-app">"{docToDelete?.name}"</span> ? <br /> <br />
            Cette action est réversible via l'archivage sécurisé.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="secondary" onClick={() => setDocToDelete(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmDeleteDocument}>
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. Modale demande suppression garant */}
      <Modal
        show={guarantorToDelete !== null}
        onClose={() => setGuarantorToDelete(null)}
        maxWidth="md"
      >
        <div className="bg-surface p-8 rounded-xl border border-[rgb(var(--border))] shadow-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-app">Retirer le garant</h2>

          <p className="mt-6 text-sm text-muted leading-relaxed">
            Es-tu sûr de vouloir détacher le garant <br />
            <span className="font-semibold text-app">
              "{guarantorToDelete?.first_name} {guarantorToDelete?.last_name}"
            </span>{' '}
            de ce dossier ? <br /> <br />
            Ses données resteront archivées dans le système.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="secondary" onClick={() => setGuarantorToDelete(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmDeleteGuarantor}>
              Retirer
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
