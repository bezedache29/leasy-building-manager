import { useForm, useFieldArray, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import editTenantSchema from '@/Schemas/EditTenantSchema';
import z from 'zod';
import { useState } from 'react';
import Button from '@/Components/Button';
import TenantFormFields from '@/Pages/Tenants/Partials/TenantFormFields';
import { Tenant } from '@/Types/tenant';
import { DOCUMENT_CATEGORIES, TENANT_DOCUMENT_KEYS } from '@/Constants/documentCategories';
import IconButton from '@/Components/IconButton';
import DocumentFieldItem from '@/Pages/Tenants/Partials/DocumentFieldItem';

type EditTenantValues = z.infer<typeof editTenantSchema>;

export default function Edit({ tenant }: { tenant: Tenant }) {
  const [isPosting, setIsPosting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditTenantValues>({
    resolver: zodResolver(editTenantSchema),
    defaultValues: {
      first_name: tenant.first_name || '',
      last_name: tenant.last_name || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      current_address: tenant.current_address || '',
      birth_date: tenant.birth_date ? tenant.birth_date.split('T')[0] : '',
      birth_place: tenant.birth_place || '',
      nationality: tenant.nationality || '',
      profession: tenant.profession || '',
      marital_status: tenant.marital_status || '',
      notes: tenant.notes || '',
      tenant_documents: [],
    },
  });

  const {
    fields: docFields,
    append: addDocument,
    remove: removeDocument,
  } = useFieldArray({ control, name: 'tenant_documents' });

  const deleteExistingDoc = (docId: number) => {
    if (confirm('Voulez-vous vraiment supprimer ce document ?')) {
      router.delete(route('documents.destroy', docId), {
        preserveScroll: true,
      });
    }
  };

  const onSubmit = (data: EditTenantValues) => {
    const payload = { ...data, _method: 'put' };

    router.post(route('tenants.update', tenant.id), payload, {
      forceFormData: true,
      preserveScroll: true,
      onStart: () => setIsPosting(true),
      onFinish: () => setIsPosting(false),
      onError: (serverErrors) => {
        Object.entries(serverErrors).forEach(([name, message]) => {
          setError(name as Path<EditTenantValues>, { type: 'server', message });
        });
      },
    });
  };

  const sectionClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl pb-12">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-app">
            Modifier {tenant.first_name} {tenant.last_name}
          </h1>
          <Link href={route('tenants.show', tenant.id)}>
            <Button variant="secondary" type="button">
              Retour
            </Button>
          </Link>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className={sectionClass}>
            <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
              Informations du locataire
            </h2>
            <TenantFormFields register={register} errors={errors} />
          </section>

          {tenant.documents && tenant.documents.length > 0 && (
            <section className={sectionClass}>
              <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                Documents déjà enregistrés
              </h2>
              <ul className="space-y-3">
                {tenant.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
                  >
                    <a
                      href={`/storage/${doc.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-2 min-w-0 flex-1 pr-4"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-primary">
                          {DOCUMENT_CATEGORIES[doc.category || ''] || doc.category}
                        </span>
                        <span className="text-xs text-muted">{doc.name}</span>
                      </div>
                    </a>
                    <IconButton
                      aria-label={`Supprimer le document ${doc.name}`}
                      variant="danger"
                      size="sm"
                      title="Supprimer le document"
                      onClick={() => deleteExistingDoc(doc.id)}
                      className="bg-red-500/30"
                      icon={
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={sectionClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(var(--primary-500))]">
                Ajouter de nouveaux documents
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addDocument({
                    category: '',
                    name: '',
                    file: undefined,
                  } as unknown as Parameters<typeof addDocument>[0])
                }
              >
                + Joindre un fichier
              </Button>
            </div>

            <div className="space-y-4">
              {docFields.map((field, index) => (
                <DocumentFieldItem
                  key={field.id}
                  index={index}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  docPath="tenant_documents"
                  remove={removeDocument}
                  categoryKeys={TENANT_DOCUMENT_KEYS}
                />
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-4">
            <Link href={route('tenants.show', tenant.id)}>
              <Button type="button" variant="danger">
                Annuler
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={isSubmitting || isPosting}>
              {isSubmitting || isPosting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
