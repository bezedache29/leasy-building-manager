import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { Equipment, Property, Room } from '@/Types/property';
import { useForm } from '@inertiajs/react';
import { formatFloor } from '@/Utils/formatters';
import { useState } from 'react';
import EquipmentItem from '@/Pages/Properties/Partials/EquipmentItem';
import EquipmentModal from '@/Pages/Properties/Partials/EquipmentModal';
import RoomModal from '@/Pages/Properties/Partials/RoomModal';
import ConfirmModal from '@/Components/ConfirmModal';

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
        message={
          <>
            Es-tu sûr de vouloir archiver la pièce <br />
            <span className="font-semibold text-app">"{roomToDelete?.name}"</span> ? <br /> <br />
            Tous les équipements associés seront également masqués.
          </>
        }
      />

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
        message={
          <>
            Es-tu sûr de vouloir retirer cet équipement <br />
            <span className="font-semibold text-app">"{equipmentToDelete?.name}"</span> ? <br />{' '}
            <br />
            Il sera conservé dans l'historique mais n'apparaîtra plus dans cette pièce.
          </>
        }
      />

      <ConfirmModal
        show={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={executeArchive}
        title="Archiver le bien"
        confirmText="Archiver"
        message={
          <>
            Es-tu sûr de vouloir archiver le lot <br />
            <span className="font-semibold text-app">"{property.name}"</span> ? <br /> <br />
            Cette action masquera le bien des vues principales.
          </>
        }
      />
    </AppLayout>
  );
}
