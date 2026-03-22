import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { Equipment, Property, Room } from '@/Types/property';
import { Link, useForm } from '@inertiajs/react';
import { formatFloor, parseLocalDate } from '@/Utils/formatters';
import { useState } from 'react';
import EquipmentItem from '@/Pages/Properties/Partials/EquipmentItem';
import EquipmentModal from '@/Pages/Properties/Partials/EquipmentModal';
import RoomModal from '@/Pages/Properties/Partials/RoomModal';
import ConfirmModal from '@/Components/ConfirmModal';
import { Lease } from '@/Types/lease';
import TerminateLeaseModal from '@/Pages/Leases/Partials/TerminateLeaseModal';
import MissingPdfDataModal from '@/Pages/Properties/Partials/MissingPdfDataModal';

interface Props {
  property: Property;
}

export default function Show({ property }: Props) {
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

  const sectionClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';
  const labelClass = 'text-sm font-medium text-muted';
  const valueClass = 'mt-1 text-base text-app font-medium';

  const activeLease: Lease | undefined = property.leases?.find(
    (lease) => lease.status === 'active'
  );

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
                {/* TODO: Display actual rent from lease when implemented */}
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

                      {/* Liste des équipements de la pièce */}
                      {!room.equipments || room.equipments.length === 0 ? (
                        <p className="text-sm text-muted italic mt-3">
                          Aucun équipement enregistré.
                        </p>
                      ) : (
                        <ul className="mt-3">
                          {room.equipments.map((eq) => (
                            <EquipmentItem
                              key={eq.id}
                              equipment={eq}
                              onEdit={openEquipmentModalForEdit}
                              onDelete={setEquipmentToDelete}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
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
                <div className="border border-[rgb(var(--border))] rounded-lg p-4 bg-surface-2 mb-6">
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center justify-between">
                      {/* BADGE DYNAMIQUE INTERACTIF */}
                      {activeLease.missing_pdf_data && activeLease.missing_pdf_data.length > 0 ? (
                        <button
                          onClick={() => setShowPdfMissingModal(true)}
                          className="flex cursor-pointer items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 transition hover:bg-amber-500/20"
                          title="Voir les éléments manquants"
                        >
                          <span>⚠️ Incomplet</span>
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                          Prêt
                        </span>
                      )}

                      <p className="text-xl font-bold text-app">
                        {(
                          Number(activeLease.rent_amount) + Number(activeLease.charges_amount)
                        ).toFixed(2)}{' '}
                        €
                      </p>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className="text-sm font-medium text-muted">
                        Du {parseLocalDate(activeLease.start_date).toLocaleDateString()}
                        {activeLease.end_date
                          ? ` au ${parseLocalDate(activeLease.end_date).toLocaleDateString()}`
                          : " à aujourd'hui"}
                      </span>
                      <p className="text-xs text-muted text-right">
                        Dont {Number(activeLease.charges_amount).toFixed(2)} € charges
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[rgb(var(--border))]">
                    <p className="text-xs font-medium text-muted mb-2">Locataires :</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {activeLease.tenants &&
                        activeLease.tenants.map((tenant) => (
                          <Link
                            key={tenant.id}
                            href={route('tenants.show', tenant.id)}
                            className="inline-flex items-center gap-1 bg-surface px-2 py-1 rounded-md border border-[rgb(var(--border))] text-sm text-app transition-colors hover:border-[rgb(var(--primary-500))] hover:text-[rgb(var(--primary-500))] hover:bg-surface-2"
                          >
                            {tenant.pivot?.is_main_tenant ? <span>👑 </span> : null}
                            {tenant.first_name} {tenant.last_name}
                          </Link>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* BOUTON PDF DYNAMIQUE */}
                      {activeLease.missing_pdf_data && activeLease.missing_pdf_data.length > 0 ? (
                        <Button onClick={() => setShowPdfMissingModal(true)}>
                          📄 Infos manquantes pour Bail
                        </Button>
                      ) : (
                        <Button
                          href={route('leases.pdf', activeLease.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-center"
                        >
                          📄 Télécharger le Bail
                        </Button>
                      )}

                      {/* On verifie que le bail possede bien des garants avant d'afficher la section */}
                      {activeLease.guarantors && activeLease.guarantors.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-3">
                          {activeLease.guarantors.map((guarantor) => (
                            <Button
                              href={route('leases.guarantors.pdf', {
                                lease: activeLease.id,
                                guarantor: guarantor.id,
                              })}
                              className="text-center"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              📄 Télécharger l'acte de caution : {guarantor.first_name}{' '}
                              {guarantor.last_name}
                            </Button>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          href={route('leases.edit', activeLease.id)}
                          variant="warning"
                          size="sm"
                          className="w-full justify-center"
                        >
                          Modifier Bail
                        </Button>
                        <Button
                          onClick={() => setLeaseToTerminate(activeLease)}
                          variant="danger"
                          size="sm"
                          className="w-full justify-center"
                        >
                          Arrêter Bail
                        </Button>
                      </div>
                    </div>
                  </div>
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

      {activeLease && activeLease.missing_pdf_data && (
        <MissingPdfDataModal
          show={showPdfMissingModal}
          onClose={() => setShowPdfMissingModal(false)}
          missingData={activeLease.missing_pdf_data}
        />
      )}
    </AppLayout>
  );
}
