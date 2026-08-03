import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { Equipment, Property, Room } from '@/Types/property';
import { Link, router, useForm } from '@inertiajs/react';
import { formatFloor, parseLocalDate } from '@/Utils/formatters';
import { ChangeEvent, useEffect, useState } from 'react';
import EquipmentItem from '@/Pages/Properties/Partials/EquipmentItem';
import EquipmentModal from '@/Pages/Properties/Partials/EquipmentModal';
import RoomModal from '@/Pages/Properties/Partials/RoomModal';
import ConfirmModal from '@/Components/ConfirmModal';
import { Lease } from '@/Types/lease';
import TerminateLeaseModal from '@/Pages/Leases/Partials/TerminateLeaseModal';
import MissingPdfDataModal from '@/Pages/Properties/Partials/MissingPdfDataModal';
import CandidatureModal from '@/Pages/Properties/Partials/CandidatureModal';
import GuaranteeIrlModal from '@/Pages/Properties/Partials/GuaranteeIrlModal';
import UploadSignedDocsModal from '@/Pages/Tenants/Partials/UploadSignedDocsModal';
import PhotoGallery from '@/Components/PhotoGallery';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import { Disclosure } from '@headlessui/react';
import SelectInput from '@/Components/SelectInput';
import { Tenant } from '@/Types/tenant';
import { Guarantor } from '@/Types/guarantor';

// Typage précis pour les détails de calcul recus du controleur
interface WaterChargeDetails {
  settlement_id: number;
  year: number;
  consumption: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  distrib_ttc: number;
  wastewater_ttc: number;
  organismes_ttc: number;
  override_ttc: number | null;
}

interface Props {
  property: Property;
  waterChargeDetails: WaterChargeDetails | null;
  tenants: Tenant[];
}

function SignedDocAccordion({
  icon,
  label,
  files,
  isOpen,
  onToggle,
}: {
  icon: string;
  label: string;
  files: import('@/Types/document').AppDocument[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-md border border-emerald-500/30 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="divide-y divide-[rgb(var(--border))]">
          {files.map((doc, idx) => (
            <a
              key={doc.id}
              href={route('documents.show', doc.id)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface-2 transition-colors text-xs text-app"
            >
              <span className="text-muted shrink-0">{files.length > 1 ? `${idx + 1}.` : '→'}</span>
              <span className="truncate hover:underline">{doc.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Show({ property, waterChargeDetails, tenants }: Props) {
  const { delete: destroy } = useForm();

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [leaseToTerminate, setLeaseToTerminate] = useState<Lease | null>(null);
  const [showPdfMissingModal, setShowPdfMissingModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
  // États pour l'upload d'une photo avec légende
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [pendingCaption, setPendingCaption] = useState('');
  const [pendingRoomId, setPendingRoomId] = useState('');
  const [pendingEquipmentId, setPendingEquipmentId] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showInventoryConfirmModal, setShowInventoryConfirmModal] = useState(false);
  const [showCandidatureModal, setShowCandidatureModal] = useState(false);
  const [guaranteeToDownload, setGuaranteeToDownload] = useState<{
    leaseId: number;
    guarantor: Guarantor;
  } | null>(null);
  const [showUploadSignedModal, setShowUploadSignedModal] = useState(false);
  const [expandedDocGroups, setExpandedDocGroups] = useState<Set<string>>(new Set());
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showErpReminderModal, setShowErpReminderModal] = useState(false);
  const [receiptMonth, setReceiptMonth] = useState(new Date().getMonth() + 1);
  const [receiptYear, setReceiptYear] = useState(new Date().getFullYear());
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const toggleDocGroup = (key: string) => {
    setExpandedDocGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  useEffect(() => {
    // S'il n'y a pas de photo, on vide l'URL
    if (!pendingPhoto) {
      setPreviewUrl(null);
      return;
    }

    // On crée l'URL une seule fois
    const objectUrl = URL.createObjectURL(pendingPhoto);
    setPreviewUrl(objectUrl);

    // Fonction de nettoyage (cleanup) : exécutée quand pendingPhoto change ou au démontage
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [pendingPhoto]);

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

  const openRoomModalForAdd = () => {
    setEditingRoom(null);
    setIsRoomModalOpen(true);
  };

  const openRoomModalForEdit = (room: Room) => {
    setEditingRoom(room);
    setIsRoomModalOpen(true);
  };

  const confirmDeleteRoom = () => {
    if (!roomToDelete) return;
    destroy(route('rooms.destroy', roomToDelete.id), {
      preserveScroll: true,
      onSuccess: () => setRoomToDelete(null),
      onFinish: () => setRoomToDelete(null),
    });
  };

  const openEquipmentModalForAdd = (roomId: number) => {
    setEditingEquipment(null);
    setActiveRoomId(roomId);
    setIsEquipmentModalOpen(true);
  };

  const openEquipmentModalForEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setIsEquipmentModalOpen(true);
  };

  const confirmDeleteEquipment = () => {
    if (!equipmentToDelete) return;
    destroy(route('equipments.destroy', equipmentToDelete.id), {
      preserveScroll: true,
      onSuccess: () => setEquipmentToDelete(null),
      onFinish: () => setEquipmentToDelete(null),
    });
  };

  const confirmDeletePhoto = () => {
    if (!photoToDelete) return;

    router.delete(route('documents.destroy', photoToDelete), {
      preserveScroll: true,
      onSuccess: () => setPhotoToDelete(null),
      onFinish: () => setPhotoToDelete(null),
    });
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPendingPhoto(e.target.files[0]);
      setPendingCaption('');
      setPendingRoomId('');
      setPendingEquipmentId('');
      e.target.value = '';
    }
  };

  const confirmUploadPhoto = () => {
    if (!pendingPhoto) return;

    router.post(
      route('properties.photos.store', property.id),
      {
        photo: pendingPhoto,
        name: pendingCaption,
        room_id: pendingRoomId || null,
        equipment_id: pendingEquipmentId || null,
      },
      {
        preserveScroll: true,
        forceFormData: true,
        onSuccess: () => {
          setPendingPhoto(null);
          setPendingCaption('');
          setPendingRoomId('');
          setPendingEquipmentId('');
        },
      }
    );
  };

  const sectionClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';
  const labelClass = 'text-sm font-medium text-muted';
  const valueClass = 'mt-1 text-base text-app font-medium';

  const activeLease: Lease | undefined = property.leases?.find(
    (lease) => lease.status === 'active'
  );

  // On trouve la piece selectionnee pour afficher ses equipements
  const selectedRoomForPhoto = property.rooms?.find((r) => r.id.toString() === pendingRoomId);

  const isValidReceiptYear =
    Number.isInteger(receiptYear) && receiptYear >= 2000 && receiptYear <= 2100;

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <header className="mb-10 flex items-center justify-between gap-6 border-b border-[rgb(var(--border))] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link href={route('properties.index')} className="text-muted hover:text-app text-xl">
                ⬅️
              </Link>
              <h1 className="text-3xl font-bold text-app">{property.name}</h1>
              {activeLease?.has_signed_lease && activeLease?.has_signed_inventory ? (
                <span className="px-3 py-1 text-sm font-medium rounded-full border bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                  Loué
                </span>
              ) : activeLease ? (
                <span className="px-3 py-1 text-sm font-medium rounded-full border bg-amber-500/10 text-amber-700 border-amber-500/20">
                  En attente de signature
                </span>
              ) : (
                <span className="px-3 py-1 text-sm font-medium rounded-full border bg-rose-500/10 text-rose-700 border-rose-500/20">
                  Disponible
                </span>
              )}
            </div>
            <p className="text-muted mt-2 flex items-center gap-2">
              {/* On utilise bien ta fonction ici ! */}
              Type : {getTypeLabel(property.type)} | Surface :{' '}
              {property.surface_area ? `${property.surface_area} m²` : 'N/C'} | Étage :{' '}
              {property.floor}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeLease?.has_signed_lease && activeLease?.has_signed_inventory && (
              <Button variant="outline" onClick={() => setShowReceiptModal(true)}>
                🧾 Quittance
              </Button>
            )}
            {activeLease && (
              <Button
                href={route('properties.annual-charges.create', property.id)}
                variant="success"
              >
                Calculer Charges
              </Button>
            )}
            <Button variant="danger" onClick={handleArchiveClick}>
              Archiver
            </Button>
            <Button href={route('properties.edit', property.id)} variant="primary">
              Modifier
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <section className={sectionClass}>
              <div className="flex items-start justify-between">
                <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                  Informations du lot
                </h2>
                <p className="text-muted text-sm font-medium">
                  Loyer (CC) :{' '}
                  {activeLease
                    ? `${(Number(activeLease.rent_amount) + Number(activeLease.charges_amount)).toFixed(2)} €`
                    : '—'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className={labelClass}>Étage</p>
                  <p className={valueClass}>{formatFloor(property.floor)}</p>
                </div>
                <div>
                  <p className={labelClass}>Surface habitable</p>
                  <p className={valueClass}>
                    {property.surface_area !== null ? `${property.surface_area} m²` : '—'}
                  </p>
                </div>
                <div>
                  <p className={labelClass}>Tantièmes Eau (Général)</p>
                  <p className={valueClass}>
                    {property.tantiemes_water !== null
                      ? `${property.tantiemes_water} / 10000`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className={labelClass}>Tantièmes Communs (Bâtiment)</p>
                  <p className={valueClass}>
                    {property.tantiemes_commons !== null
                      ? `${property.tantiemes_commons} / 1000`
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

            {/* Nouvelle section pour les pièces et équipements [cite: 2026-03-10] */}
            <section className={sectionClass}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[rgb(var(--primary-500))]">
                  Pièces & Équipements
                </h2>
                <Button variant="outline" size="sm" onClick={openRoomModalForAdd}>
                  + Ajouter une pièce
                </Button>
              </div>

              {!property.rooms || property.rooms.length === 0 ? (
                <div className="rounded-lg bg-surface-2 p-8 text-center border border-[rgb(var(--border))]">
                  <p className="text-sm text-muted italic">
                    Aucune pièce n'a encore été configurée pour ce lot.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {property.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="rounded-lg border border-[rgb(var(--border))] bg-surface p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[rgb(var(--border))] pb-3 mb-3 gap-3">
                        <div>
                          <h3 className="font-semibold text-app">{room.name}</h3>
                          {room.surface_area && (
                            <p className="text-xs text-muted mt-1">{room.surface_area} m²</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => openRoomModalForEdit(room)}
                          >
                            Modifier
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setRoomToDelete(room)}>
                            Archiver
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openEquipmentModalForAdd(room.id)}
                          >
                            + Équipement
                          </Button>
                        </div>
                      </div>

                      {/* Photos globales de la pièce */}
                      {property.documents &&
                        property.documents.some(
                          (doc) =>
                            doc.category === 'inventory_photo' &&
                            doc.room_id === room.id &&
                            !doc.equipment_id
                        ) && (
                          <Disclosure
                            as="div"
                            className="mb-4 rounded-lg bg-surface-2 border border-[rgb(var(--border))] p-3"
                          >
                            {({ open }) => {
                              const roomPhotos = property.documents!.filter(
                                (doc) =>
                                  doc.category === 'inventory_photo' &&
                                  doc.room_id === room.id &&
                                  !doc.equipment_id
                              );

                              return (
                                <>
                                  <Disclosure.Button className="cursor-pointer flex w-full items-center justify-between text-sm font-medium text-app hover:text-[rgb(var(--primary-500))] focus:outline-none">
                                    <span className="flex items-center gap-2">
                                      📸 Voir les photos générales de la pièce ({roomPhotos.length})
                                    </span>
                                    <svg
                                      className={`h-5 w-5 transform transition-transform ${open ? 'rotate-180' : ''}`}
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
                                  </Disclosure.Button>
                                  <Disclosure.Panel className="pt-4 mt-2 border-t border-[rgb(var(--border))]">
                                    <PhotoGallery
                                      photos={roomPhotos}
                                      rooms={property.rooms}
                                      title="Photos de la pièce"
                                    />
                                  </Disclosure.Panel>
                                </>
                              );
                            }}
                          </Disclosure>
                        )}

                      {/* Liste des équipements de la pièce */}
                      {!room.equipments || room.equipments.length === 0 ? (
                        <p className="text-sm text-muted italic mt-3">
                          Aucun équipement enregistré.
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {room.equipments.map((eq) => {
                            // On filtre les photos spécifiques à cet équipement
                            const equipmentPhotos =
                              property.documents?.filter(
                                (doc) =>
                                  doc.category === 'inventory_photo' && doc.equipment_id === eq.id
                              ) || [];

                            return (
                              <EquipmentItem
                                key={eq.id}
                                equipment={eq}
                                onEdit={openEquipmentModalForEdit}
                                onDelete={setEquipmentToDelete}
                                photos={equipmentPhotos}
                                rooms={property.rooms}
                              />
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* COLONNE 2 : Les Charges (au milieu) - NOUVEAU PLACEMENT */}
          <div className="space-y-8">
            {waterChargeDetails && (
              <section className={sectionClass}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-[rgb(var(--primary-500))]">
                    Charges & Régularisations ({waterChargeDetails.year})
                  </h2>
                </div>

                <div className="flex flex-col rounded-xl border border-[rgb(var(--border))] bg-surface p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--primary-500))]/10 text-xl border border-[rgb(var(--primary-500))]/20">
                        💧
                      </div>
                      <div>
                        <h3 className="font-semibold text-app">Eau Froide</h3>
                        {/* CORRECTION : Utilisation de Number() pour eviter l'erreur toFixed */}
                        <p className="text-sm text-muted">
                          Consommation : {Number(waterChargeDetails.consumption).toFixed(2)} m³
                        </p>
                      </div>
                    </div>
                    {waterChargeDetails.override_ttc !== null ? (
                      <span className="rounded-md border border-[rgb(var(--warning-500))]/20 bg-[rgb(var(--warning-500))]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--warning-700))]">
                        Ajusté
                      </span>
                    ) : (
                      <span className="rounded-md border border-[rgb(var(--success-500))]/20 bg-[rgb(var(--success-500))]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--success-700))]">
                        Auto
                      </span>
                    )}
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Distribution</span>
                      <span className="font-medium text-app">
                        {waterChargeDetails.distrib_ttc.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Eaux Usées</span>
                      <span className="font-medium text-app">
                        {waterChargeDetails.wastewater_ttc.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Organismes</span>
                      <span className="font-medium text-app">
                        {waterChargeDetails.organismes_ttc.toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 flex items-end justify-between border-t border-[rgb(var(--border))] pt-3">
                    <span className="text-sm font-medium text-muted">Total TTC</span>
                    <span className="text-2xl font-bold text-[rgb(var(--primary-600))]">
                      {(waterChargeDetails.override_ttc ?? waterChargeDetails.total_ttc).toFixed(2)}{' '}
                      €
                    </span>
                  </div>

                  <Button
                    href={route('properties.annual-charges.review', {
                      property: property.id,
                      settlement: waterChargeDetails.settlement_id,
                    })}
                    variant="secondary"
                    className="w-full justify-center"
                  >
                    🔍 Réviser le détail
                  </Button>
                </div>
              </section>
            )}
            {/* Placeholder si pas de charges, pour garder l'alignement */}
            {!waterChargeDetails && (
              <section className={sectionClass}>
                <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                  Charges & Régularisations
                </h2>
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border))] bg-surface-2 p-10 text-sm font-medium text-muted text-center h-48">
                  <span className="mb-3 text-4xl opacity-50">⚖️</span>
                  Pas de régularisation pour l'année en cours.
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            <section className={sectionClass}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[rgb(var(--primary-500))]">
                  Occupation & Baux
                </h2>
              </div>

              {/* ZONE DU BAIL ACTIF OU ZONE VIDE */}
              {!activeLease ? (
                <div className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-8 text-center">
                  <p className="mb-4 text-sm italic text-muted">
                    {property.leases && property.leases.length > 0
                      ? 'Ce bien est actuellement inoccupé.'
                      : "Aucun bail n'est rattaché à ce bien pour le moment."}
                  </p>
                  <Button
                    href={route('leases.create', { property_id: property.id })}
                    variant="primary"
                    size="sm"
                  >
                    {property.leases && property.leases.length > 0
                      ? '+ Créer un nouveau bail'
                      : '+ Créer le premier bail'}
                  </Button>
                </div>
              ) : (
                <div className="border border-[rgb(var(--border))] rounded-lg bg-surface-2 mb-6 overflow-hidden">
                  {/* === INFOS BAIL === */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      {activeLease.missing_pdf_data && activeLease.missing_pdf_data.length > 0 ? (
                        <button
                          onClick={() => setShowPdfMissingModal(true)}
                          className="flex cursor-pointer items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 transition hover:bg-amber-500/20"
                          title="Voir les éléments manquants"
                        >
                          ⚠️ Dossier incomplet
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                          ✓ Prêt
                        </span>
                      )}
                      <p className="text-xl font-bold text-app">
                        {(
                          Number(activeLease.rent_amount) + Number(activeLease.charges_amount)
                        ).toFixed(2)}{' '}
                        €
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">
                        Depuis le {parseLocalDate(activeLease.start_date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted">
                        {Number(activeLease.rent_amount).toFixed(0)} € HC +{' '}
                        {Number(activeLease.charges_amount).toFixed(0)} € charges
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted mb-1.5">Locataires</p>
                      <div className="flex flex-wrap gap-2">
                        {activeLease.tenants?.map((tenant) => (
                          <Link
                            key={tenant.id}
                            href={route('tenants.show', tenant.id)}
                            className="inline-flex items-center gap-1 bg-surface px-2 py-1 rounded-md border border-[rgb(var(--border))] text-sm text-app transition-colors hover:border-[rgb(var(--primary-500))] hover:text-[rgb(var(--primary-500))]"
                          >
                            {tenant.pivot?.is_main_tenant ? <span>👑</span> : null}
                            {tenant.first_name} {tenant.last_name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {(!activeLease.has_signed_lease || !activeLease.has_signed_inventory) && (
                        <Button
                          href={route('leases.edit', activeLease.id)}
                          variant="warning"
                          size="sm"
                          className="flex-1 justify-center"
                        >
                          Modifier
                        </Button>
                      )}
                      <Button
                        onClick={() => setLeaseToTerminate(activeLease)}
                        variant="danger"
                        size="sm"
                        className="flex-1 justify-center"
                      >
                        Arrêter le bail
                      </Button>
                    </div>
                  </div>

                  {/* === DOCUMENTS === */}
                  <div className="border-t border-[rgb(var(--border))] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                      Documents
                    </p>
                    <div className="space-y-2">
                      {/* Actes de caution — toujours accessibles */}
                      {activeLease.guarantors?.map((guarantor) =>
                        guarantor.type === 'visale' ? (
                          <div
                            key={guarantor.id}
                            className="flex items-center gap-2 rounded-md bg-[rgb(var(--primary-500))]/5 px-3 py-2 border border-[rgb(var(--primary-500))]/20"
                          >
                            <span className="text-sm text-[rgb(var(--primary-400))]">
                              🛡️ Garantie Visale
                            </span>
                            <span className="text-xs text-muted">— Action Logement</span>
                          </div>
                        ) : (
                          <div
                            key={guarantor.id}
                            className="flex items-center justify-between rounded-md bg-surface px-3 py-2 border border-[rgb(var(--border))]"
                          >
                            <span className="text-sm text-app">
                              🛡️ Acte de caution — {guarantor.first_name} {guarantor.last_name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setGuaranteeToDownload({ leaseId: activeLease.id, guarantor })
                              }
                              className="text-xs font-medium text-[rgb(var(--primary-400))] hover:text-[rgb(var(--primary-300))]"
                            >
                              Télécharger →
                            </button>
                          </div>
                        )
                      )}

                      {/* Bail — générer si pas signé, afficher signé sinon */}
                      {activeLease.has_signed_lease ? (
                        <SignedDocAccordion
                          icon="📄"
                          label="Bail signé"
                          files={
                            activeLease.documents?.filter((d) => d.category === 'signed_lease') ??
                            []
                          }
                          isOpen={expandedDocGroups.has('signed_lease')}
                          onToggle={() => toggleDocGroup('signed_lease')}
                        />
                      ) : (
                        <div className="flex items-center justify-between rounded-md bg-surface px-3 py-2 border border-[rgb(var(--border))]">
                          <span className="text-sm text-app">📄 Bail locatif</span>
                          {activeLease.missing_pdf_data &&
                          activeLease.missing_pdf_data.length > 0 ? (
                            <button
                              onClick={() => setShowPdfMissingModal(true)}
                              className="text-xs font-medium text-amber-500 hover:text-amber-400"
                            >
                              Infos manquantes →
                            </button>
                          ) : activeLease.lease_type === 'commercial' ||
                            activeLease.lease_type === 'professional' ? (
                            <button
                              onClick={() => setShowErpReminderModal(true)}
                              className="text-xs font-medium text-[rgb(var(--primary-400))] hover:text-[rgb(var(--primary-300))]"
                            >
                              Télécharger →
                            </button>
                          ) : (
                            <a
                              href={route('leases.pdf', activeLease.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-[rgb(var(--primary-400))] hover:text-[rgb(var(--primary-300))]"
                            >
                              Télécharger →
                            </a>
                          )}
                        </div>
                      )}

                      {/* État des lieux — générer si pas signé, afficher signé sinon */}
                      {activeLease.has_signed_inventory ? (
                        <SignedDocAccordion
                          icon="📋"
                          label="État des lieux signé"
                          files={
                            activeLease.documents?.filter(
                              (d) => d.category === 'signed_inventory'
                            ) ?? []
                          }
                          isOpen={expandedDocGroups.has('signed_inventory')}
                          onToggle={() => toggleDocGroup('signed_inventory')}
                        />
                      ) : (
                        <div className="flex items-center justify-between rounded-md bg-surface px-3 py-2 border border-[rgb(var(--border))]">
                          <span className="text-sm text-app">📋 État des lieux (entrée)</span>
                          <button
                            onClick={() => setShowInventoryConfirmModal(true)}
                            className="text-xs font-medium text-[rgb(var(--primary-400))] hover:text-[rgb(var(--primary-300))]"
                          >
                            Télécharger →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* === CTA : UPLOAD DOCUMENTS SIGNÉS === */}
                  {(!activeLease.has_signed_lease || !activeLease.has_signed_inventory) && (
                    <div className="border-t border-[rgb(var(--border))] p-4">
                      <Button
                        onClick={() => setShowUploadSignedModal(true)}
                        variant="success"
                        className="w-full justify-center"
                      >
                        📤 Uploader les documents signés
                      </Button>
                      <p className="text-xs text-muted text-center mt-2">
                        Bail signé + état des lieux signé requis pour passer en statut « Loué »
                      </p>
                    </div>
                  )}

                  {/* === PHOTOS EDL === */}
                  <div className="border-t border-[rgb(var(--border))] px-4 pt-3 pb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                      Photos état des lieux
                    </p>
                    <label className="w-full justify-center inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-surface px-4 py-2 text-sm font-medium text-app transition-colors hover:bg-surface-2">
                      <svg
                        className="h-4 w-4 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Ajouter une photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <PhotoGallery
                      photos={
                        property.documents?.filter((doc) => doc.category === 'inventory_photo') ||
                        []
                      }
                      title="Photos état des lieux"
                      rooms={property.rooms}
                    />
                  </div>
                </div>
              )}

              {/* SECTION CANDIDATURES (uniquement si le bien est vacant) */}
              {!activeLease && (
                <div className="mt-8 pt-6 border-t border-[rgb(var(--border))]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                      Candidatures
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCandidatureModal(true)}
                    >
                      + Acte de cautionnement
                    </Button>
                  </div>
                  <p className="text-sm text-muted italic">
                    Générez un acte de cautionnement pour un candidat locataire, sans créer de bail.
                  </p>
                </div>
              )}

              {/* HISTORIQUE DES ANCIENS BAUX */}
              {property.leases &&
                property.leases.filter((l) => l.status === 'terminated').length > 0 && (
                  <div className="mt-8 pt-6 border-t border-[rgb(var(--border))]">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                      Historique d'occupation
                    </h3>
                    <div className="space-y-3">
                      {property.leases
                        .filter((l) => l.status === 'terminated')
                        .map((pastLease) => (
                          <div
                            key={pastLease.id}
                            className="flex flex-col gap-2 rounded-lg border border-[rgb(var(--border))] bg-surface p-4"
                          >
                            {/* Ligne 1 : Noms des locataires séparés */}
                            <div className="flex flex-wrap gap-3">
                              {pastLease.tenants?.map((tenant) => (
                                <span
                                  key={tenant.id}
                                  className="inline-flex items-center gap-1 text-sm font-semibold text-app"
                                >
                                  {tenant.pivot?.is_main_tenant && (
                                    <span title="Locataire principal">👑</span>
                                  )}
                                  {tenant.first_name} {tenant.last_name}
                                </span>
                              ))}
                            </div>

                            {/* Ligne 2 : Dates d'occupation */}
                            <div className="text-xs text-muted">
                              Du {parseLocalDate(pastLease.start_date).toLocaleDateString()} au{' '}
                              {pastLease.end_date
                                ? parseLocalDate(pastLease.end_date).toLocaleDateString()
                                : 'Non défini'}
                            </div>

                            {/* Ligne 3 : Loyer (gauche) et Badge (droite) */}
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-sm font-bold text-app">
                                {(
                                  Number(pastLease.rent_amount) + Number(pastLease.charges_amount)
                                ).toFixed(2)}{' '}
                                €
                              </span>
                              <span className="rounded-full border border-[rgb(var(--border))] bg-surface-3 px-2 py-1 text-xs font-semibold text-muted">
                                Terminé
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </section>
          </div>
        </div>
      </div>

      <RoomModal
        show={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        propertyId={property.id}
        room={editingRoom}
      />

      <ConfirmModal
        show={roomToDelete !== null}
        onClose={() => setRoomToDelete(null)}
        onConfirm={confirmDeleteRoom}
        title="Archiver la pièce"
      >
        Es-tu sûr de vouloir archiver la pièce <br />
        <span className="font-semibold text-app">"{roomToDelete?.name}"</span> ? <br /> <br />
        Tous les équipements associés seront également masqués.
      </ConfirmModal>

      <EquipmentModal
        show={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        roomId={activeRoomId}
        equipment={editingEquipment}
      />

      <ConfirmModal
        show={equipmentToDelete !== null}
        onClose={() => setEquipmentToDelete(null)}
        onConfirm={confirmDeleteEquipment}
        title="Archiver l'équipement"
        confirmText="Archiver"
      >
        Es-tu sûr de vouloir retirer cet équipement <br />
        <span className="font-semibold text-app">"{equipmentToDelete?.name}"</span> ? <br /> <br />
        Il sera conservé dans l'historique mais n'apparaîtra plus dans cette pièce.
      </ConfirmModal>

      <ConfirmModal
        show={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={executeArchive}
        title="Archiver le bien"
        confirmText="Archiver"
      >
        Es-tu sûr de vouloir archiver le lot <br />
        <span className="font-semibold text-app">"{property.name}"</span> ? <br /> <br />
        Cette action masquera le bien des vues principales.
      </ConfirmModal>

      <TerminateLeaseModal
        show={leaseToTerminate !== null}
        onClose={() => setLeaseToTerminate(null)}
        lease={leaseToTerminate}
      />

      <ConfirmModal
        show={photoToDelete !== null}
        onClose={() => setPhotoToDelete(null)}
        onConfirm={confirmDeletePhoto}
        title="Retirer la photo"
        confirmText="Retirer"
      >
        Es-tu sûr de vouloir retirer cette photo de l'état des lieux ? <br /> <br />
        Elle sera conservée dans les archives (soft delete) mais n'apparaîtra plus sur le dossier de
        ce bail.
      </ConfirmModal>

      {/* Modale d'ajout de légende avant upload */}
      <Modal show={pendingPhoto !== null} onClose={() => setPendingPhoto(null)} maxWidth="sm">
        <div className="bg-surface p-8 rounded-xl border border-[rgb(var(--border))] shadow-2xl">
          <h2 className="text-xl font-bold text-app mb-6">Légender la photo</h2>

          {previewUrl && (
            <div className="mb-6 overflow-hidden rounded-lg border border-[rgb(var(--border))]">
              {/* Prévisualisation de l'image locale */}
              <img src={previewUrl} alt="Aperçu" className="w-full h-48 object-cover" />
            </div>
          )}

          {/* Champ Légende : Utilisation de ton InputLabel */}
          <div className="mb-6">
            <InputLabel value="Description / Légende" className="mb-2" />
            <input
              type="text"
              value={pendingCaption}
              onChange={(e) => setPendingCaption(e.target.value)}
              className="w-full rounded-md border border-[rgb(var(--border))] bg-surface-2 px-3 py-2 text-app focus:border-[rgb(var(--primary-500))] focus:ring-1 focus:ring-[rgb(var(--primary-500))] focus:outline-none"
              placeholder="Ex: Rayure profonde sur le parquet..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && confirmUploadPhoto()}
            />
          </div>

          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <InputLabel value="Pièce (Optionnel)" className="mb-2" />
              <SelectInput
                value={pendingRoomId}
                onChange={(e) => {
                  setPendingRoomId(e.target.value);
                  setPendingEquipmentId(''); // On vide l'equipement si on change de piece
                }}
              >
                <option value="">-- Aucune --</option>
                {property.rooms?.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="w-full sm:w-1/2">
              <InputLabel value="Équipement (Optionnel)" className="mb-2" />
              <SelectInput
                value={pendingEquipmentId}
                onChange={(e) => setPendingEquipmentId(e.target.value)}
                disabled={!pendingRoomId || !selectedRoomForPhoto?.equipments?.length}
              >
                <option value="">-- Aucun --</option>
                {selectedRoomForPhoto?.equipments?.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <Button variant="secondary" onClick={() => setPendingPhoto(null)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={confirmUploadPhoto}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        show={showInventoryConfirmModal}
        onClose={() => setShowInventoryConfirmModal(false)}
        onConfirm={() => {
          setShowInventoryConfirmModal(false);
          if (activeLease) {
            window.open(
              route('leases.inventory.pdf', { lease: activeLease.id, type: 'in' }),
              '_blank'
            );
          }
        }}
        title="Générer l'état des lieux entrant"
        confirmText="Générer le PDF"
        variant="primary"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-[rgb(var(--warning-500))]/10 p-4 border border-[rgb(var(--warning-500))]/20">
            <p className="text-sm font-semibold text-[rgb(var(--warning-700))] flex items-center gap-2">
              <span>⚠️</span> Rappel important
            </p>
            <p className="mt-2 text-sm text-app">
              As-tu bien vérifié et mis à jour les photos des pièces et équipements ?
            </p>
          </div>
          <p className="text-sm text-muted">
            Si des réparations ont été effectuées depuis le départ du précédent locataire (ex: trou
            rebouché, peinture refaite), pense à supprimer les anciennes photos et à ajouter les
            nouvelles avant de générer ce document.
          </p>
        </div>
      </ConfirmModal>

      {activeLease && activeLease.missing_pdf_data && (
        <MissingPdfDataModal
          show={showPdfMissingModal}
          onClose={() => setShowPdfMissingModal(false)}
          missingData={activeLease.missing_pdf_data}
        />
      )}

      <UploadSignedDocsModal
        show={showUploadSignedModal}
        onClose={() => setShowUploadSignedModal(false)}
        lease={activeLease ?? null}
      />

      <CandidatureModal
        show={showCandidatureModal}
        onClose={() => setShowCandidatureModal(false)}
        propertyId={property.id}
        tenants={tenants}
      />

      <GuaranteeIrlModal
        show={guaranteeToDownload !== null}
        onClose={() => setGuaranteeToDownload(null)}
        leaseId={guaranteeToDownload?.leaseId ?? null}
        guarantor={guaranteeToDownload?.guarantor ?? null}
      />

      {/* Modal génération quittance */}
      <Modal
        show={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setReceiptError(null);
        }}
        maxWidth="sm"
      >
        <div className="bg-surface p-8 rounded-xl border border-[rgb(var(--border))] shadow-2xl">
          <h2 className="text-xl font-bold text-app mb-2">Générer une quittance</h2>
          <p className="text-sm text-muted mb-6">
            Sélectionne le mois et l'année pour lesquels tu veux générer la quittance.
          </p>

          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <InputLabel value="Mois" className="mb-2" />
              <SelectInput
                value={receiptMonth}
                onChange={(e) => {
                  setReceiptMonth(Number(e.target.value));
                  setReceiptError(null);
                }}
              >
                <option value={1}>Janvier</option>
                <option value={2}>Février</option>
                <option value={3}>Mars</option>
                <option value={4}>Avril</option>
                <option value={5}>Mai</option>
                <option value={6}>Juin</option>
                <option value={7}>Juillet</option>
                <option value={8}>Août</option>
                <option value={9}>Septembre</option>
                <option value={10}>Octobre</option>
                <option value={11}>Novembre</option>
                <option value={12}>Décembre</option>
              </SelectInput>
            </div>
            <div className="flex-1">
              <InputLabel value="Année" className="mb-2" />
              <input
                type="number"
                value={receiptYear}
                onChange={(e) => {
                  setReceiptYear(Number(e.target.value));
                  setReceiptError(null);
                }}
                min={2000}
                max={2100}
                className="w-full rounded-md border border-[rgb(var(--border))] bg-surface-2 px-3 py-2 text-app focus:border-[rgb(var(--primary-500))] focus:ring-1 focus:ring-[rgb(var(--primary-500))] focus:outline-none"
              />
            </div>
          </div>

          {receiptError && (
            <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {receiptError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowReceiptModal(false);
                setReceiptError(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              disabled={!isValidReceiptYear}
              onClick={() => {
                if (!activeLease || !isValidReceiptYear) return;

                const selected = `${receiptYear}-${String(receiptMonth).padStart(2, '0')}`;
                const leaseStart = activeLease.start_date.substring(0, 7);
                const leaseEnd = activeLease.end_date ? activeLease.end_date.substring(0, 7) : null;

                if (selected < leaseStart) {
                  setReceiptError('La période sélectionnée est antérieure au début du bail.');
                  return;
                }
                if (leaseEnd && selected > leaseEnd) {
                  setReceiptError('La période sélectionnée dépasse la fin du bail.');
                  return;
                }

                window.open(
                  route('leases.receipt', {
                    lease: activeLease.id,
                    month: receiptMonth,
                    year: receiptYear,
                  }),
                  '_blank'
                );
                setReceiptError(null);
                setShowReceiptModal(false);
              }}
            >
              Générer le PDF
            </Button>
          </div>
        </div>
      </Modal>
      {/* Rappel ERP avant téléchargement du bail commercial */}
      <ConfirmModal
        show={showErpReminderModal}
        onClose={() => setShowErpReminderModal(false)}
        onConfirm={() => {
          setShowErpReminderModal(false);
          if (activeLease) {
            window.open(route('leases.pdf', activeLease.id), '_blank');
          }
        }}
        title="Avant de télécharger le bail"
        confirmText="J'ai mon ERP, télécharger"
        cancelText="Fermer"
        variant="info"
      >
        <p>
          Le bail commercial doit être accompagné d'un{' '}
          <span className="font-medium text-app">État des Risques et Pollutions (ERP)</span> datant
          de moins de 6 mois.
        </p>
        <p className="mt-3">
          Générez-le gratuitement sur{' '}
          <a
            href="https://www.georisques.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono font-medium text-[rgb(var(--primary-400))] hover:underline"
          >
            georisques.gouv.fr
          </a>{' '}
          → <em>"Mon bien face aux risques"</em> → saisissez l'adresse du bien → téléchargez le PDF.
        </p>
      </ConfirmModal>
    </AppLayout>
  );
}
