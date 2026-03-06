import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import createTenantSchema from '@/Schemas/CreateTenantSchema';
import z from 'zod';

import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import Button from '@/Components/Button';

// On importe notre nouveau sous-composant
import GuarantorCard from './Partials/GuarantorCard';

type TenantFormValues = z.infer<typeof createTenantSchema>;

export default function CreateTenant() {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      current_address: '',
      birth_date: '',
      birth_place: '',
      profession: '',
      notes: '',
      guarantors: [],
      tenant_documents: [],
    },
  });

  const {
    fields: guarantorFields,
    append: addGuarantor,
    remove: removeGuarantor,
  } = useFieldArray({ control, name: 'guarantors' });

  const {
    fields: docFields,
    append: addDocument,
    remove: removeDocument,
  } = useFieldArray({ control, name: 'tenant_documents' });

  const onSubmit = (data: TenantFormValues) => {
    router.post(route('tenants.store'), data, {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const errorClass = 'mt-1 text-xs text-red-400 font-medium';
  const sectionClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';
  const textareaClass =
    'w-full rounded-md border border-[rgb(var(--border))] bg-surface text-app px-3 py-2 outline-none transition-all duration-150 focus:border-[rgb(var(--primary-900))]';

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl pb-12">
        <h1 className="mb-6 text-2xl font-semibold text-app">Nouveau Dossier Locataire</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- 1. LOCATAIRE --- */}
          <section className={sectionClass}>
            <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
              Informations du locataire
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <InputLabel htmlFor="first_name" value="Prénom *" className="mb-1" />
                <TextInput id="first_name" {...register('first_name')} />
                {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
              </div>
              <div>
                <InputLabel htmlFor="last_name" value="Nom *" className="mb-1" />
                <TextInput id="last_name" {...register('last_name')} />
                {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
              </div>
              <div>
                <InputLabel htmlFor="email" value="Email" className="mb-1" />
                <TextInput id="email" type="email" {...register('email')} />
                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
              </div>
              <div>
                <InputLabel htmlFor="phone" value="Téléphone" className="mb-1" />
                <TextInput id="phone" type="tel" {...register('phone')} />
              </div>
              <div className="md:col-span-2">
                <InputLabel htmlFor="current_address" value="Adresse actuelle" className="mb-1" />
                <TextInput id="current_address" {...register('current_address')} />
              </div>
              <div>
                <InputLabel htmlFor="birth_date" value="Date de naissance" className="mb-1" />
                <TextInput id="birth_date" type="date" {...register('birth_date')} />
              </div>
              <div>
                <InputLabel htmlFor="birth_place" value="Lieu de naissance" className="mb-1" />
                <TextInput id="birth_place" {...register('birth_place')} />
              </div>
              <div className="md:col-span-2">
                <InputLabel htmlFor="profession" value="Profession" className="mb-1" />
                <TextInput id="profession" {...register('profession')} />
              </div>
              <div className="md:col-span-2">
                <InputLabel htmlFor="notes" value="Notes internes" className="mb-1" />
                <textarea id="notes" rows={3} {...register('notes')} className={textareaClass} />
              </div>
            </div>
          </section>

          {/* --- 2. GARANTS --- */}
          <section className={sectionClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(var(--primary-500))]">
                Garants (Cautions)
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addGuarantor({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    current_address: '',
                    profession: '',
                    documents: [],
                  })
                }
              >
                + Ajouter un garant
              </Button>
            </div>

            {guarantorFields.length === 0 ? (
              <p className="text-sm text-muted italic">Aucun garant n'a été ajouté.</p>
            ) : (
              <div className="space-y-6">
                {guarantorFields.map((field, index) => (
                  <GuarantorCard
                    key={field.id}
                    index={index}
                    control={control}
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    onRemove={() => removeGuarantor(index)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* --- 3. DOCUMENTS --- */}
          <section className={sectionClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(var(--primary-500))]">
                Documents joints au locataire
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addDocument({ category: 'id_card', name: '', file: null })}
              >
                + Joindre un fichier
              </Button>
            </div>

            {docFields.length === 0 ? (
              <p className="text-sm text-muted italic">Aucun document joint.</p>
            ) : (
              <div className="space-y-4">
                {docFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-wrap items-start gap-4 rounded-lg border border-[rgb(var(--border))] p-4 bg-surface-2"
                  >
                    <div className="flex-1 min-w-[150px]">
                      <InputLabel value="Catégorie" className="mb-1" />
                      <SelectInput {...register(`tenant_documents.${index}.category`)}>
                        <option value="id_card">Pièce d'identité</option>
                        <option value="payslip">Fiche de paie</option>
                        <option value="insurance">Assurance</option>
                        <option value="other">Autre</option>
                      </SelectInput>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <InputLabel value="Nom du document" className="mb-1" />
                      <TextInput
                        {...register(`tenant_documents.${index}.name`)}
                        placeholder="ex: CNI Recto"
                      />
                      {errors.tenant_documents?.[index]?.name && (
                        <p className={errorClass}>
                          {errors.tenant_documents[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <InputLabel value="Fichier PDF / Image" className="mb-1" />
                      <input
                        type="file"
                        className="block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-medium file:text-app hover:file:bg-surface-2 file:cursor-pointer file:transition-colors file:border file:border-[rgb(var(--border))]"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setValue(`tenant_documents.${index}.file`, e.target.files[0], {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                      {errors.tenant_documents?.[index]?.file && (
                        <p className={errorClass}>
                          {errors.tenant_documents[index]?.file?.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="mt-8 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* --- ACTIONS --- */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="danger" onClick={() => window.history.back()}>
              Annuler
            </Button>

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le dossier'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
