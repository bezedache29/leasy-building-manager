import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import SelectInput from '@/Components/SelectInput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { propertySchema } from '@/Schemas/PropertySchema';
import z from 'zod';

type PropertyFormInput = z.input<typeof propertySchema>;
type PropertyFormData = z.output<typeof propertySchema>;

export default function Create() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput, unknown, PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      type: 'apartment',
      floor: '',
      surface_area: '',
      tantiemes_water: '',
      tantiemes_commons: '',
      description: '',
      notes: '',
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    router.post(route('properties.store'), data);
  };

  const inputClass =
    'mt-1 block w-full rounded-md border-[rgb(var(--border))] bg-surface text-app shadow-sm focus:border-[rgb(var(--primary-500))] focus:ring-[rgb(var(--primary-500))] sm:text-sm';
  const labelClass = 'block text-sm font-medium text-app';
  const errorClass = 'mt-1 text-sm text-red-500';

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl pb-12">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-app">Ajouter un bien</h1>
          <Button href={route('properties.index')} variant="secondary">
            Retour
          </Button>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClass}>
                Nom du bien *
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
              <label htmlFor="tantiemes_water" className={labelClass}>
                Tantièmes Eau ( / 10000)
              </label>
              <input
                type="number"
                id="tantiemes_water"
                {...register('tantiemes_water')}
                className={inputClass}
              />
              {errors.tantiemes_water && (
                <p className={errorClass}>{errors.tantiemes_water.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="tantiemes_commons" className={labelClass}>
                Tantièmes Communs ( / 1000)
              </label>
              <input
                type="number"
                id="tantiemes_commons"
                {...register('tantiemes_commons')}
                className={inputClass}
              />
              {errors.tantiemes_commons && (
                <p className={errorClass}>{errors.tantiemes_commons.message}</p>
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

          <div className="flex justify-end border-t border-[rgb(var(--border))] pt-6 mt-6">
            <Button type="submit" disabled={isSubmitting} variant="primary">
              Enregistrer le bien
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
