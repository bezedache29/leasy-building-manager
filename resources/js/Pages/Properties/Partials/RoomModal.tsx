import { useEffect } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { roomSchema } from '@/Schemas/RoomSchema';
import { Room } from '@/Types/property';
import z from 'zod';

type RoomFormInput = z.input<typeof roomSchema>;
type RoomFormData = z.output<typeof roomSchema>;

interface Props {
  show: boolean;
  onClose: () => void;
  propertyId: number;
  room: Room | null; // Ajout de la pièce à modifier [cite: 2026-03-10]
}

export default function RoomModal({ show, onClose, propertyId, room }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormInput, unknown, RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: '', surface_area: '' },
  });

  // Pré-remplissage ou réinitialisation selon le mode (édition/création) [cite: 2026-03-10]
  useEffect(() => {
    if (show) {
      if (room) {
        reset({
          name: room.name,
          surface_area: room.surface_area ? String(room.surface_area) : '',
        });
      } else {
        reset({ name: '', surface_area: '' });
      }
    }
  }, [show, room, reset]);

  const onSubmit = (data: RoomFormData) => {
    if (room) {
      router.put(route('rooms.update', room.id), data, {
        preserveScroll: true,
        onSuccess: () => onClose(),
      });
    } else {
      router.post(route('rooms.store', propertyId), data, {
        preserveScroll: true,
        onSuccess: () => onClose(),
      });
    }
  };

  const inputClass =
    'mt-1 block w-full rounded-md border-[rgb(var(--border))] bg-surface text-app shadow-sm focus:border-[rgb(var(--primary-500))] focus:ring-[rgb(var(--primary-500))] sm:text-sm';
  const labelClass = 'block text-sm font-medium text-app';
  const errorClass = 'mt-1 text-sm text-red-500';

  return (
    <Modal show={show} onClose={onClose} maxWidth="sm">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl">
        <h2 className="text-xl font-semibold text-app mb-6">
          {room ? 'Modifier la pièce' : 'Ajouter une pièce'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Nom de la pièce
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className={inputClass}
                placeholder="ex: Cuisine, Chambre 1..."
              />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="surface_area" className={labelClass}>
                Surface (m²) - Optionnel
              </label>
              <input
                type="number"
                step="0.01"
                id="surface_area"
                {...register('surface_area')}
                className={inputClass}
                placeholder="ex: 12.5"
              />
              {errors.surface_area && <p className={errorClass}>{errors.surface_area.message}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border))]">
            <Button type="button" variant="danger" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
