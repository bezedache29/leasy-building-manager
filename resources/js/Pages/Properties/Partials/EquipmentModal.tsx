import { useEffect } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import SelectInput from '@/Components/SelectInput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { equipmentSchema } from '@/Schemas/EquipmentSchema';
import z from 'zod';
import { Equipment } from '@/Types/property';

type EquipmentFormInput = z.input<typeof equipmentSchema>;
type EquipmentFormData = z.output<typeof equipmentSchema>;

interface Props {
  show: boolean;
  onClose: () => void;
  roomId: number | null;
  equipment: Equipment | null;
}

export default function EquipmentModal({ show, onClose, roomId, equipment }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormInput, unknown, EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: { name: '', type: '', quantity: 1, notes: '' },
  });

  // Pré-remplissage ou réinitialisation [cite: 2026-03-10]
  useEffect(() => {
    if (show) {
      if (equipment) {
        reset({
          name: equipment.name,
          type: equipment.type || '',
          quantity: equipment.quantity,
          notes: equipment.notes || '',
        });
      } else {
        reset({ name: '', type: '', quantity: 1, notes: '' });
      }
    }
  }, [show, equipment, reset]);

  const onSubmit = (data: EquipmentFormData) => {
    if (equipment) {
      // Mode édition
      router.put(route('equipments.update', equipment.id), data, {
        preserveScroll: true,
        onSuccess: () => onClose(),
      });
    } else if (roomId) {
      // Mode création
      router.post(route('equipments.store', roomId), data, {
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
    <Modal show={show} onClose={onClose} maxWidth="md">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl">
        <h2 className="text-xl font-semibold text-app mb-6">
          {equipment ? "Modifier l'équipement" : 'Ajouter un équipement'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Nom de l'équipement
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className={inputClass}
                placeholder="ex: Prise murale, Radiateur..."
              />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className={labelClass}>
                  Quantité
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  {...register('quantity')}
                  className={inputClass}
                />
                {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
              </div>
              <div>
                <label htmlFor="type" className={labelClass}>
                  Catégorie
                </label>
                <SelectInput id="type" {...register('type')} className="mt-1">
                  <option value="">Sélectionner</option>
                  <option value="Électricité">Électricité</option>
                  <option value="Plomberie">Plomberie</option>
                  <option value="Menuiserie">Menuiserie</option>
                  <option value="Chauffage">Chauffage</option>
                  <option value="Électroménager">Électroménager</option>
                  <option value="Autre">Autre</option>
                </SelectInput>
                {errors.type && <p className={errorClass}>{errors.type.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className={labelClass}>
                Notes / Marque (optionnel)
              </label>
              <textarea
                id="notes"
                rows={2}
                {...register('notes')}
                className={inputClass}
                placeholder="État, marque, puissance..."
              />
              {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
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
