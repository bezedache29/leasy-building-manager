import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, router } from '@inertiajs/react';
import Button from '@/Components/Button';
import { Tenant } from '@/Types/tenant';
import { Guarantor } from '@/Types/guarantor';
import { Lease } from '@/Types/lease';
import GuarantorModal from './Partials/GuarantorModal';
import MissingItemsModal from '@/Pages/Tenants/Partials/MissingItemsModal';
import ConfirmModal from '@/Components/ConfirmModal';
import { AppDocument } from '@/Types';
import ExistingDocumentItem from '@/Pages/Tenants/Partials/ExistingDocumentItem';
import { parseLocalDate } from '@/Utils/formatters';
import UploadSignedDocsModal from '@/Pages/Tenants/Partials/UploadSignedDocsModal';

export default function Show({
  tenant,
  availableGuarantors,
}: {
  tenant: Tenant;
  availableGuarantors: Guarantor[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuarantor, setEditingGuarantor] = useState<Guarantor | null>(null);
  const [docToDelete, setDocToDelete] = useState<AppDocument | null>(null);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [guarantorToDetach, setGuarantorToDetach] = useState<Guarantor | null>(null);
  const [showArchiveTenantModal, setShowArchiveTenantModal] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [expandedDocGroups, setExpandedDocGroups] = useState<Set<string>>(new Set());

  const toggleDocGroup = (key: string) => {
    setExpandedDocGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

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

  const confirmArchiveTenant = () => {
    router.patch(route('tenants.archive', tenant.id));
    setShowArchiveTenantModal(false);
  };

  const handleUnarchive = () => {
    router.patch(route('tenants.unarchive', tenant.id));
  };

  const confirmDeleteDocument = () => {
    if (!docToDelete) return;

    router.delete(route('documents.destroy', docToDelete.id), {
      preserveScroll: true,
      onSuccess: () => setDocToDelete(null),
      onFinish: () => setDocToDelete(null),
    });
  };

  const confirmDetachGuarantor = () => {
    if (!guarantorToDetach) return;

    router.delete(route('tenants.guarantors.destroy', [tenant.id, guarantorToDetach.id]), {
      preserveScroll: true,
      onSuccess: () => setGuarantorToDetach(null),
      onFinish: () => setGuarantorToDetach(null),
    });
  };

  const sectionClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';
  const labelClass = 'text-sm font-medium text-muted';
  const valueClass = 'mt-1 text-base text-app font-medium';

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

  // --- CALCUL DE LA COMPLÉTUDE DU PROFIL (Locataire + Garants) ---
  const backendMissingDocs = tenant.missing_items?.tenant?.documents || [];

  // 1. On ignore les contrats pour le locataire (Bail, État des lieux)
  const missingTenantDocs = backendMissingDocs.filter((d) => {
    const key = String(d).toLowerCase();
    return (
      !key.includes('bail') &&
      !key.includes('lease') &&
      !key.includes('etat') &&
      !key.includes('état') &&
      !key.includes('inventory')
    );
  });

  const missingTenantFields = tenant.missing_items?.tenant?.fields || [];

  // 2. NOUVEAU : On filtre aussi les documents des garants pour ignorer l'acte de caution !
  const missingGuarantors = (tenant.missing_items?.guarantors || []).map((g) => {
    const filteredDocs = (g.documents || []).filter((d) => {
      const key = String(d).toLowerCase();
      // On exclut tous les mots-clés liés à l'acte solidaire
      return (
        !key.includes('acte') &&
        !key.includes('caution') &&
        !key.includes('solidaire') &&
        !key.includes('guarantee')
      );
    });
    return { ...g, documents: filteredDocs };
  });

  // 3. On recalcule si les garants ont des VRAIES pièces manquantes (ex: CNI, Fiches de paie)
  let missingGuarantorsCount = 0;
  missingGuarantors.forEach((g) => {
    missingGuarantorsCount += (g.fields?.length || 0) + (g.documents?.length || 0);
  });

  const isProfileComplete =
    missingTenantFields.length === 0 &&
    missingTenantDocs.length === 0 &&
    missingGuarantorsCount === 0;

  const computedMissingItems = {
    tenant: { fields: missingTenantFields, documents: missingTenantDocs },
    guarantors: missingGuarantors, // On passe les garants filtrés à la modale
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-app">
                Dossier de {tenant.first_name} {tenant.last_name}
              </h1>

              {!isProfileComplete && (
                <button
                  onClick={() => setShowMissingModal(true)}
                  className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500 transition-colors hover:bg-amber-500/20 focus:outline-none cursor-pointer"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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

              {tenant.is_archived && (
                <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-sm font-medium text-red-500">
                  Archivé
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {tenant.is_archived ? (
              <Button variant="secondary" onClick={handleUnarchive}>
                Désarchiver
              </Button>
            ) : (
              !tenant.leases?.some((l) => l.status === 'active') && (
                <Button variant="danger" onClick={() => setShowArchiveTenantModal(true)}>
                  Archiver
                </Button>
              )
            )}
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

            <section className="space-y-4">
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
                        {guarantor.type === 'visale' ? (
                          <span className="rounded-full px-3 py-1 text-xs font-semibold border border-[rgb(var(--primary-500))]/30 bg-[rgb(var(--primary-500))]/10 text-[rgb(var(--primary-500))]">
                            🛡️ Visale
                          </span>
                        ) : (
                          <span className="rounded-full bg-[rgb(var(--surface))] px-3 py-1 text-xs font-medium text-muted border border-[rgb(var(--border))]">
                            Lien : {getRelationshipLabel(guarantor.pivot?.relationship || null)}
                          </span>
                        )}
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
                          onClick={() => setGuarantorToDetach(guarantor)}
                        >
                          Retirer
                        </Button>
                      </div>
                    </div>

                    {guarantor.type === 'visale' ? (
                      <div className="rounded-lg border border-[rgb(var(--primary-500))]/20 bg-[rgb(var(--primary-500))]/5 px-4 py-3 text-sm text-muted space-y-1">
                        <div>
                          Garantie gérée par{' '}
                          <span className="font-semibold text-app">Action Logement</span>.
                          {!guarantor.documents?.some((d) => d.category === 'visale_guarantee') && (
                            <span className="ml-1">
                              Uploader le document Visale dans les documents ci-dessous.
                            </span>
                          )}
                        </div>
                        {guarantor.visale_contract_number && (
                          <div className="text-xs">
                            N° contrat :{' '}
                            <span className="font-mono font-semibold text-app">
                              {guarantor.visale_contract_number}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className={labelClass}>Contact</p>
                          <p className="text-sm text-app mt-1">
                            {guarantor.email || "Pas d'email"}
                          </p>
                          <p className="text-sm text-app">
                            {guarantor.phone || 'Pas de téléphone'}
                          </p>
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
                          <p className="text-sm text-app mt-1">
                            {guarantor.current_address || '—'}
                          </p>
                        </div>
                        <div>
                          <p className={labelClass}>Nationalité</p>
                          <p className={valueClass}>
                            {guarantor.nationality ? guarantor.nationality : '—'}
                          </p>
                        </div>
                      </div>
                    )}

                    {guarantor.documents && guarantor.documents.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-[rgb(var(--border))]">
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
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[rgb(var(--primary-500))]">
                  Baux & Occupation
                </h2>
              </div>

              {!tenant.leases || tenant.leases.length === 0 ? (
                <div className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-6 text-center">
                  <p className="text-sm text-muted italic mb-3">
                    Ce locataire n'a encore jamais été rattaché à un bail.
                  </p>
                  <Link
                    href={route('leases.create', { tenant_id: tenant.id })}
                    className="inline-block text-sm font-medium text-[rgb(var(--primary-500))] hover:underline"
                  >
                    Rattacher à un bien
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {tenant.leases.map((lease) => {
                    if (!lease.property) {
                      return (
                        <div
                          key={lease.id}
                          className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-4 text-center text-sm text-muted"
                        >
                          Données du bien indisponibles
                        </div>
                      );
                    }

                    const canUploadSignedDocs = lease.pdf_downloaded_at !== null;
                    const leaseDocs = lease.documents || [];
                    const hasSignedLease = leaseDocs.some((d) => d.category === 'signed_lease');
                    const hasSignedInventory = leaseDocs.some(
                      (d) => d.category === 'signed_inventory'
                    );
                    const hasSignedGuarantee = leaseDocs.some(
                      (d) => d.category === 'signed_guarantee'
                    );
                    const hasGuarantors =
                      lease.guarantors?.some((g) => g.type !== 'visale') ?? false;
                    const isFullyUploaded =
                      hasSignedLease &&
                      hasSignedInventory &&
                      (!hasGuarantors || hasSignedGuarantee);

                    return (
                      <div
                        key={lease.id}
                        className="rounded-xl border border-[rgb(var(--border))] bg-surface-2 p-5 shadow-sm"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-bold text-lg text-app">{lease.property.name}</h3>
                          {lease.status === 'active' ? (
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                              En cours
                            </span>
                          ) : (
                            <span className="rounded-full border border-[rgb(var(--border))] bg-surface-3 px-2.5 py-1 text-xs font-semibold text-muted">
                              Terminé
                            </span>
                          )}
                        </div>

                        <div className="mb-4 text-sm text-muted">
                          Du {parseLocalDate(lease.start_date).toLocaleDateString()} au{' '}
                          {lease.end_date
                            ? parseLocalDate(lease.end_date).toLocaleDateString()
                            : "aujourd'hui"}
                        </div>

                        <div className="flex items-center justify-between border-t border-[rgb(var(--border))] py-4 text-base">
                          <span className="text-muted">Loyer mensuel cc :</span>
                          <span className="font-extrabold text-app text-lg">
                            {(Number(lease.rent_amount) + Number(lease.charges_amount)).toFixed(2)}{' '}
                            €
                          </span>
                        </div>

                        <div className="border-t border-[rgb(var(--border))] pt-4 flex flex-col gap-3">
                          <Link
                            href={route('properties.show', lease.property.id)}
                            className="w-full"
                          >
                            <Button size="sm" variant="secondary" className="w-full justify-center">
                              Voir l'appartement
                            </Button>
                          </Link>

                          {isFullyUploaded ? (
                            <div className="p-2 border border-emerald-500/30 rounded text-xs text-center font-medium text-emerald-600 flex items-center justify-center bg-emerald-500/10">
                              <svg
                                className="mr-1.5 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Documents signés uploadés !
                            </div>
                          ) : lease.status === 'active' && canUploadSignedDocs ? (
                            <Button
                              size="sm"
                              className="w-full justify-center shadow-sm"
                              onClick={() => {
                                setSelectedLease(lease);
                                setIsUploadModalOpen(true);
                              }}
                            >
                              <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                              </svg>
                              Uploader documents signés
                            </Button>
                          ) : lease.status === 'active' ? (
                            <div className="p-2 border border-[rgb(var(--border))] border-dashed rounded text-xs text-center text-muted italic bg-surface-3">
                              Générez le bail et l'état des lieux pour débloquer l'upload
                            </div>
                          ) : null}
                        </div>

                        {(() => {
                          const signedGroups = [
                            { key: 'signed_lease', label: 'Bail signé', icon: '📄' },
                            { key: 'signed_inventory', label: 'État des lieux signé', icon: '📋' },
                            { key: 'signed_guarantee', label: 'Acte de caution signé', icon: '🛡️' },
                          ];
                          const signedDocs = leaseDocs.filter((d) =>
                            signedGroups.some((g) => g.key === d.category)
                          );
                          if (signedDocs.length === 0) return null;

                          return (
                            <div className="border-t border-[rgb(var(--border))] mt-4 pt-4 space-y-1">
                              <p className="text-xs font-semibold text-muted mb-2">
                                Documents signés
                              </p>
                              {signedGroups.map(({ key, label, icon }) => {
                                const files = leaseDocs.filter((d) => d.category === key);
                                if (files.length === 0) return null;
                                const isOpen = expandedDocGroups.has(`${lease.id}-${key}`);
                                return (
                                  <div
                                    key={key}
                                    className="rounded-lg border border-[rgb(var(--border))] overflow-hidden"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleDocGroup(`${lease.id}-${key}`)}
                                      className="w-full flex items-center justify-between px-3 py-2 bg-surface hover:bg-surface-2 transition-colors text-left"
                                    >
                                      <span className="flex items-center gap-2 text-sm font-medium text-app">
                                        <span>{icon}</span>
                                        <span>{label}</span>
                                        <span className="text-xs font-normal text-muted">
                                          {files.length} fichier{files.length > 1 ? 's' : ''}
                                        </span>
                                      </span>
                                      <svg
                                        className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 9l-7 7-7-7"
                                        />
                                      </svg>
                                    </button>

                                    {isOpen && (
                                      <div className="divide-y divide-[rgb(var(--border))]">
                                        {files.map((doc, idx) => (
                                          <div
                                            key={doc.id}
                                            className="flex items-center justify-between px-3 py-2 bg-surface-2 group"
                                          >
                                            <a
                                              href={route('documents.show', doc.id)}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="flex items-center gap-2 text-xs text-app flex-1 overflow-hidden hover:underline"
                                            >
                                              <span className="text-muted shrink-0">
                                                {files.length > 1 ? `${idx + 1}.` : '→'}
                                              </span>
                                              <span className="truncate">{doc.name}</span>
                                            </a>
                                            <button
                                              onClick={() => setDocToDelete(doc)}
                                              className="text-muted hover:text-red-500 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <svg
                                                className="h-3.5 w-3.5"
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
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className={sectionClass}>
              <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                Documents du locataire
              </h2>
              {!tenant.documents || tenant.documents.length === 0 ? (
                <p className="text-sm text-muted italic">Aucun document enregistré.</p>
              ) : (
                <ul className="space-y-3">
                  {tenant.documents.map((doc) => (
                    <ExistingDocumentItem key={doc.id} doc={doc} onDelete={setDocToDelete} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>

      <MissingItemsModal
        show={showMissingModal}
        onClose={() => setShowMissingModal(false)}
        tenant={tenant}
        computedMissingItems={computedMissingItems}
      />

      <GuarantorModal
        show={isModalOpen}
        onClose={handleModalClose}
        tenantId={tenant.id}
        guarantor={editingGuarantor}
        availableGuarantors={availableGuarantors}
      />

      <ConfirmModal
        show={docToDelete !== null}
        onClose={() => setDocToDelete(null)}
        onConfirm={confirmDeleteDocument}
        title="Supprimer le document"
        confirmText="Supprimer"
      >
        Es-tu sûr de vouloir retirer le document <br />
        <span className="font-semibold text-app">"{docToDelete?.name}"</span> ? <br /> <br />
        Cette action est réversible via l'archivage sécurisé (Soft delete).
      </ConfirmModal>

      <ConfirmModal
        show={guarantorToDetach !== null}
        onClose={() => setGuarantorToDetach(null)}
        onConfirm={confirmDetachGuarantor}
        title="Retirer le garant"
        confirmText="Retirer"
      >
        Es-tu sûr de vouloir détacher le garant <br />
        <span className="font-semibold text-app">
          "{guarantorToDetach?.first_name} {guarantorToDetach?.last_name}"
        </span>{' '}
        de ce dossier ? <br /> <br />
        Ses données resteront archivées dans le système.
      </ConfirmModal>

      <ConfirmModal
        show={showArchiveTenantModal}
        onClose={() => setShowArchiveTenantModal(false)}
        onConfirm={confirmArchiveTenant}
        title="Archiver le dossier"
        confirmText="Archiver"
      >
        Voulez-vous vraiment archiver le dossier de <br />
        <span className="font-semibold text-app">
          {tenant.first_name} {tenant.last_name}
        </span>{' '}
        ? <br /> <br />
        Il ne sera plus visible dans la liste principale des locataires actifs.
      </ConfirmModal>

      <UploadSignedDocsModal
        show={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        lease={selectedLease}
      />
    </AppLayout>
  );
}
