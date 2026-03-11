import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import SelectInput from '@/Components/SelectInput';
import Modal from '@/Components/Modal'; // Retour au bon composant
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Property } from '@/Types/property';
import { propertySchema } from '@/Schemas/PropertySchema';
import z from 'zod';
import { useState } from 'react';

type PropertyFormInput = z.input<typeof propertySchema>;
type PropertyFormData = z.output<typeof propertySchema>;

interface Props {
  property: Property;
}

export default function Edit({ property }: Props) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput, unknown, PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property.name || '',
      type: property.type || 'apartment',
      floor: property.floor != null ? String(property.floor) : '',
      surface_area: property.surface_area != null ? String(property.surface_area) : '',
      tantiemes_eau: property.tantiemes_eau != null ? String(property.tantiemes_eau) : '',
      tantiemes_communs:
        property.tantiemes_communs != null ? String(property.tantiemes_communs) : '',
      description: property.description || '',
      notes: property.notes || '',
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    router.put(route('properties.update', property.id), data);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    router.delete(route('properties.destroy', property.id));
  };

  const inputClass =
    'mt-1 block w-full rounded-md border-[rgb(var(--border))] bg-surface text-app shadow-sm focus:border-[rgb(var(--primary-500))] focus:ring-[rgb(var(--primary-500))] sm:text-sm';
  const labelClass = 'block text-sm font-medium text-app';
  const errorClass = 'mt-1 text-sm text-red-500';

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl pb-12">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-app">Modifier : {property.name}</h1>
          <Button href={route('properties.show', property.id)} variant="secondary">
            Annuler
          </Button>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm space-y-6"
        >
          {/* ... Le contenu du formulaire reste strictement identique ... */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClass}>
                Nom du bien
              </label>
              <input type="text" id="name" {...register('name')} className={inputClass} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="type" className={labelClass}>
                Type de lot
              </label>
              <SelectInput id="type" {...register('type')} className="mt-1">
                <option value="apartment">Appartement</option>
                <option value="studio">Studio</option>
                <option value="commercial">Local Commercial</option>
                <option value="garage">Garage / Parking</option>
                <option value="other">Autre</option>
              </SelectInput>
              {errors.type && <p className={errorClass}>{errors.type.message}</p>}
            </div>

            <div>
              <label htmlFor="surface_area" className={labelClass}>
                Surface (m²)
              </label>
              <input
                type="number"
                step="0.01"
                id="surface_area"
                {...register('surface_area')}
                className={inputClass}
              />
              {errors.surface_area && <p className={errorClass}>{errors.surface_area.message}</p>}
            </div>

            <div>
              <label htmlFor="tantiemes_eau" className={labelClass}>
                Tantièmes Eau ( / 10000)
              </label>
              <input
                type="number"
                id="tantiemes_eau"
                {...register('tantiemes_eau')}
                className={inputClass}
              />
              {errors.tantiemes_eau && <p className={errorClass}>{errors.tantiemes_eau.message}</p>}
            </div>

            <div>
              <label htmlFor="tantiemes_communs" className={labelClass}>
                Tantièmes Communs ( / 1000)
              </label>
              <input
                type="number"
                id="tantiemes_communs"
                {...register('tantiemes_communs')}
                className={inputClass}
              />
              {errors.tantiemes_communs && (
                <p className={errorClass}>{errors.tantiemes_communs.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="floor" className={labelClass}>
                Étage
              </label>
              <SelectInput id="floor" {...register('floor')} className="mt-1">
                <option value="">Sélectionner un étage</option>
                <option value="0">RDC</option>
                <option value="1">1er Étage</option>
                <option value="2">2ème Étage</option>
              </SelectInput>
              {errors.floor && <p className={errorClass}>{errors.floor.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className={labelClass}>
                Description / Équipements
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className={inputClass}
              />
              {errors.description && <p className={errorClass}>{errors.description.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className={labelClass}>
                Notes internes
              </label>
              <textarea id="notes" rows={2} {...register('notes')} className={inputClass} />
              {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-6 mt-6">
            <Button type="button" variant="danger" onClick={handleDeleteClick}>
              Supprimer ce bien
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="primary">
              Mettre à jour
            </Button>
          </div>
        </form>
      </div>

      <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="md">
        <div className="bg-surface p-8 rounded-xl border border-[rgb(var(--border))] shadow-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-app">Supprimer le bien</h2>
          <p className="mt-6 text-sm text-muted leading-relaxed">
            Es-tu sûr de vouloir supprimer le lot <br />
            <span className="font-semibold text-app">"{property.name}"</span> ? <br /> <br />
            Ses données seront conservées en archive (Soft delete).
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={executeDelete}>
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
