import { useState, useEffect, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import IconButton from '@/Components/IconButton';
import ConfirmModal from '@/Components/ConfirmModal';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import Button from '@/Components/Button';
import { AppDocument } from '@/Types';
import { Room } from '@/Types/property';

interface Props {
  photos: AppDocument[];
  title?: string;
  rooms?: Room[];
}

export default function PhotoGallery({ photos, title = 'Photos', rooms = [] }: Props) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

  const [editingDetails, setEditingDetails] = useState(false);
  const [captionValue, setCaptionValue] = useState('');
  const [roomValue, setRoomValue] = useState<string>('');
  const [equipmentValue, setEquipmentValue] = useState<string>('');

  // 1. Mémorisation de la synchronisation des états
  const syncEditStates = useCallback(
    (index: number) => {
      setCaptionValue(photos[index].name || '');
      setRoomValue(photos[index].room_id ? photos[index].room_id.toString() : '');
      setEquipmentValue(photos[index].equipment_id ? photos[index].equipment_id.toString() : '');
    },
    [photos]
  );

  // 2. Mémorisation des fonctions de navigation et d'action
  const openGallery = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      syncEditStates(index);
    },
    [syncEditStates]
  );

  const closeGallery = useCallback(() => {
    setCurrentIndex(null);
    setEditingDetails(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex !== null && currentIndex < photos.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      syncEditStates(nextIndex);
    }
  }, [currentIndex, photos.length, syncEditStates]);

  const handlePrev = useCallback(() => {
    if (currentIndex !== null && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      syncEditStates(prevIndex);
    }
  }, [currentIndex, syncEditStates]);

  const confirmDelete = useCallback(() => {
    if (!photoToDelete || currentIndex === null) return;

    router.delete(route('documents.destroy', photoToDelete), {
      preserveScroll: true,
      onSuccess: () => {
        setPhotoToDelete(null);

        // On calcule la nouvelle longueur attendue du tableau
        const expectedNewLength = photos.length - 1;

        if (expectedNewLength <= 0) {
          // S'il n'y a plus de photos, on ferme tout
          closeGallery();
        } else {
          // Sinon, on recadre l'index (si on a supprimé la dernière photo, on recule d'un cran)
          const newIndex = Math.min(currentIndex, expectedNewLength - 1);
          setCurrentIndex(newIndex);
          // On n'oublie pas de resynchroniser les formulaires d'édition avec la nouvelle image affichée
          syncEditStates(newIndex);
        }
      },
    });
  }, [photoToDelete, currentIndex, photos.length, closeGallery, syncEditStates]);

  const saveDetails = useCallback(() => {
    if (currentIndex === null) return;

    router.put(
      route('documents.update', photos[currentIndex].id),
      {
        name: captionValue,
        room_id: roomValue || null,
        equipment_id: equipmentValue || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => setEditingDetails(false),
      }
    );
  }, [currentIndex, photos, captionValue, roomValue, equipmentValue]);

  // 3. Gestion optimisée du clavier avec les fonctions mémorisées
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null || editingDetails) return;

      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') closeGallery();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, editingDetails, handleNext, handlePrev, closeGallery]);

  // 4. Mémorisation des calculs lourds (find sur des tableaux)
  const selectedRoomForEdit = useMemo(
    () => rooms.find((r) => r.id.toString() === roomValue),
    [rooms, roomValue]
  );

  const currentRoom = useMemo(
    () => (currentIndex !== null ? rooms.find((r) => r.id === photos[currentIndex].room_id) : null),
    [currentIndex, rooms, photos]
  );

  const currentEquipment = useMemo(
    () =>
      currentRoom && currentIndex !== null
        ? currentRoom.equipments?.find((e) => e.id === photos[currentIndex].equipment_id)
        : null,
    [currentRoom, currentIndex, photos]
  );

  if (!photos || photos.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[rgb(var(--border))]">
      <p className="text-xs font-medium text-muted mb-3">
        {title} ({photos.length}) :
      </p>

      {/* Grille des miniatures */}
      <div className="grid grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group overflow-hidden rounded-md border border-[rgb(var(--border))] cursor-pointer aspect-square"
          >
            <img
              src={`/storage/${photo.file_path.replace('public/', '')}`}
              alt={photo.name || `Photo ${index + 1}`}
              loading="lazy" // <-- Optimisation du chargement natif
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              onClick={() => openGallery(index)}
            />
          </div>
        ))}
      </div>

      {/* Lightbox Plein Ecran */}
      {currentIndex !== null && (
        <div className="fixed inset-0 z-50 flex bg-black/95 backdrop-blur-sm overflow-hidden text-app">
          {/* ZONE PRINCIPALE (Image + Légende) */}
          <div className="relative flex-1 flex flex-col min-w-0">
            {/* Header de la Lightbox */}
            <div className="absolute top-0 left-0 w-full flex justify-between items-center p-6 bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none">
              <span className="text-white font-semibold text-sm bg-black/50 px-4 py-1.5 rounded-full border border-white/10 pointer-events-auto">
                {currentIndex + 1} / {photos.length}
              </span>
              <div className="flex gap-3 pointer-events-auto">
                {/* Icône Stylo (Édition) */}
                <IconButton
                  variant="warning"
                  className="rounded-full"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  }
                  aria-label="Modifier"
                  onClick={() => setEditingDetails((prev) => !prev)}
                />
                <IconButton
                  variant="danger"
                  className="rounded-full"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  }
                  aria-label="Supprimer"
                  onClick={() => setPhotoToDelete(photos[currentIndex].id)}
                />
                <IconButton
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-full ml-2"
                  icon={
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  }
                  aria-label="Fermer"
                  onClick={closeGallery}
                />
              </div>
            </div>

            {/* Flèches de navigation */}
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {currentIndex < photos.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* ZONE D'IMAGE */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center p-8 pt-24 pb-4">
              <img
                src={`/storage/${photos[currentIndex].file_path.replace('public/', '')}`}
                alt={photos[currentIndex].name}
                className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
              />
            </div>

            {/* LÉGENDE */}
            {!editingDetails && (
              <div className="shrink-0 w-full p-4 pb-8 flex flex-col items-center justify-center min-h-[100px]">
                <p className="text-white text-lg font-medium text-center">
                  {photos[currentIndex].name || 'Photo sans légende'}
                </p>

                {(currentRoom || currentEquipment) && (
                  <div className="flex flex-wrap justify-center gap-3 mt-3">
                    {currentRoom && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-md text-sm font-medium text-white/90">
                        <svg
                          className="h-4 w-4 text-white/70"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        {currentRoom.name}
                      </span>
                    )}
                    {currentEquipment && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-md text-sm font-medium text-white/90">
                        <svg
                          className="h-4 w-4 text-white/70"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        {currentEquipment.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PANNEAU LATÉRAL (Sidebar d'édition) */}
          <div
            className={`h-full bg-surface border-l border-[rgb(var(--border))] shadow-2xl flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${editingDetails ? 'w-full sm:w-[400px] opacity-100' : 'w-0 opacity-0'}`}
          >
            <div className="flex items-center justify-between p-5 border-b border-[rgb(var(--border))] shrink-0">
              <h3 className="text-lg font-bold text-app">Détails de la photo</h3>
              <IconButton
                variant="ghost"
                size="sm"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                }
                onClick={() => setEditingDetails(false)}
                aria-label="Fermer"
              />
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
              <div>
                <InputLabel value="Légende" className="mb-2" />
                <input
                  type="text"
                  value={captionValue}
                  onChange={(e) => setCaptionValue(e.target.value)}
                  className="w-full rounded-md border border-[rgb(var(--border))] bg-surface-2 px-3 py-2 text-app focus:border-[rgb(var(--primary-500))] focus:ring-1 focus:ring-[rgb(var(--primary-500))] focus:outline-none"
                  placeholder="Ex: Rayure profonde..."
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveDetails()}
                />
              </div>

              <div>
                <InputLabel value="Pièce" className="mb-2" />
                <SelectInput
                  value={roomValue}
                  onChange={(e) => {
                    setRoomValue(e.target.value);
                    setEquipmentValue('');
                  }}
                >
                  <option value="">-- Aucune pièce --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </SelectInput>
              </div>

              <div>
                <InputLabel value="Équipement" className="mb-2" />
                <SelectInput
                  value={equipmentValue}
                  onChange={(e) => setEquipmentValue(e.target.value)}
                  disabled={!roomValue || !selectedRoomForEdit?.equipments?.length}
                >
                  <option value="">-- Aucun équipement --</option>
                  {selectedRoomForEdit?.equipments?.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </SelectInput>
              </div>
            </div>

            <div className="p-5 border-t border-[rgb(var(--border))] bg-surface-2 shrink-0">
              <Button onClick={saveDetails} className="w-full justify-center">
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={photoToDelete !== null}
        onClose={() => setPhotoToDelete(null)}
        onConfirm={confirmDelete}
        title="Retirer la photo"
        confirmText="Retirer"
      >
        Es-tu sûr de vouloir retirer cette photo ? Elle sera conservée dans les archives mais
        n'apparaîtra plus sur cet état des lieux.
      </ConfirmModal>
    </div>
  );
}
