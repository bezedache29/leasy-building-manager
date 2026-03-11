import { useForm, useFieldArray, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import createTenantSchema from '@/Schemas/CreateTenantSchema';
import z from 'zod';
import { useState } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import Button from '@/Components/Button';
import GuarantorCard from '@/Pages/Tenants/Partials/GuarantorCard';
import { DOCUMENT_CATEGORIES, TENANT_DOCUMENT_KEYS } from '@/Constants/documentCategories';
import TenantFormFields from '@/Pages/Tenants/Partials/TenantFormFields';

type TenantFormValues = z.infer<typeof createTenantSchema>;

export default function CreateTenant() {
  const [isPosting, setIsPosting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      marital_status: '',
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
      onStart: () => setIsPosting(true),
      onFinish: () => setIsPosting(false),
      onError: (serverErrors) => {
        Object.entries(serverErrors).forEach(([name, message]) => {
          setError(name as Path<TenantFormValues>, {
            type: 'server',
            message,
          });
        });
      },
    });
  };

  const errorClass = 'mt-1 text-xs text-red-400 font-medium';
  const sectionClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';

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

            <TenantFormFields register={register} errors={errors} />
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
                    relationship: '',
                    marital_status: '',
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
                    prefix={`guarantors.${index}.`}
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
                onClick={() =>
                  addDocument({ category: '', name: '', file: undefined as unknown as File })
                }
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
                        <option value="">Sélectionner une catégorie</option>
                        {TENANT_DOCUMENT_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {DOCUMENT_CATEGORIES[key]}
                          </option>
                        ))}
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

            <Button type="submit" variant="primary" disabled={isSubmitting || isPosting}>
              {isSubmitting || isPosting ? 'Enregistrement...' : 'Enregistrer le dossier'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
