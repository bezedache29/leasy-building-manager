import { useForm, useFieldArray, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import editTenantSchema from '@/Schemas/EditTenantSchema';
import z from 'zod';
import { useState } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import Button from '@/Components/Button';
import TenantFormFields from '@/Pages/Tenants/Partials/TenantFormFields';
import { Tenant } from '@/Types/tenant';
import {
  TENANT_DOCUMENT_KEYS,
  COMMERCIAL_PHYSICAL_DOCUMENT_KEYS,
  COMMERCIAL_LEGAL_ENTITY_DOCUMENT_KEYS,
  RESIDENTIAL_REQUIRED_DOC_KEYS,
  COMMERCIAL_PHYSICAL_REQUIRED_DOC_KEYS,
  COMMERCIAL_LEGAL_ENTITY_REQUIRED_DOC_KEYS,
} from '@/Constants/documentCategories';
import DocumentFieldItem from '@/Pages/Tenants/Partials/DocumentFieldItem';
import ExistingDocumentItem from '@/Pages/Tenants/Partials/ExistingDocumentItem';
import MissingDocumentsAlert from '@/Components/MissingDocumentsAlert';

type EditTenantValues = z.input<typeof editTenantSchema>;
type EditTenantOutput = z.output<typeof editTenantSchema>;

export default function Edit({ tenant }: { tenant: Tenant }) {
  const [isPosting, setIsPosting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditTenantValues, unknown, EditTenantOutput>({
    resolver: zodResolver(editTenantSchema),
    defaultValues: {
      tenant_type: tenant.tenant_type ?? 'physical',
      has_residential: tenant.has_residential ?? true,
      has_commercial: tenant.has_commercial ?? false,
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
      // Champs commerciaux
      siret: tenant.siret || '',
      company_name: tenant.company_name || '',
      legal_form: tenant.legal_form || '',
      share_capital: tenant.share_capital ?? null,
      registered_office: tenant.registered_office || '',
      rcs_city: tenant.rcs_city || '',
      tenant_documents: [],
    },
  });

  const hasResidential = watch('has_residential');
  const hasCommercial = watch('has_commercial');
  const tenantType = watch('tenant_type');
  const isLegalEntity = tenantType === 'legal_entity';

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

  const onSubmit = (data: EditTenantOutput) => {
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
  const errorClass = 'mt-1 text-xs text-red-400 font-medium';
  const checkboxCardClass = (active: boolean) =>
    `flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
      active
        ? 'border-[rgb(var(--primary-500))] bg-[rgb(var(--primary-500))]/5'
        : 'border-[rgb(var(--border))] hover:bg-surface-2'
    }`;

  const existingCategories = tenant.documents?.map((doc) => doc.category) || [];

  // Dropdown : tous les types de documents disponibles selon les profils actifs
  const documentKeys = (() => {
    if (hasResidential && hasCommercial) {
      const commercial = isLegalEntity
        ? COMMERCIAL_LEGAL_ENTITY_DOCUMENT_KEYS
        : COMMERCIAL_PHYSICAL_DOCUMENT_KEYS;
      return [...new Set([...TENANT_DOCUMENT_KEYS, ...commercial])];
    }
    if (hasCommercial) {
      return isLegalEntity
        ? COMMERCIAL_LEGAL_ENTITY_DOCUMENT_KEYS
        : COMMERCIAL_PHYSICAL_DOCUMENT_KEYS;
    }
    return TENANT_DOCUMENT_KEYS;
  })();

  // Alerte pièces manquantes : uniquement les docs REQUIS (miroir backend, cohérent avec la modale)
  const requiredDocKeys = (() => {
    if (hasResidential && hasCommercial) {
      const commercial = isLegalEntity
        ? COMMERCIAL_LEGAL_ENTITY_REQUIRED_DOC_KEYS
        : COMMERCIAL_PHYSICAL_REQUIRED_DOC_KEYS;
      return [...new Set([...RESIDENTIAL_REQUIRED_DOC_KEYS, ...commercial])];
    }
    if (hasCommercial) {
      return isLegalEntity
        ? COMMERCIAL_LEGAL_ENTITY_REQUIRED_DOC_KEYS
        : COMMERCIAL_PHYSICAL_REQUIRED_DOC_KEYS;
    }
    return RESIDENTIAL_REQUIRED_DOC_KEYS;
  })();
  const missingCategories = requiredDocKeys.filter((key) => !existingCategories.includes(key));

  const handleResidentialToggle = (checked: boolean) => {
    if (!checked && !hasCommercial) return;
    setValue('has_residential', checked);
  };

  const handleCommercialToggle = (checked: boolean) => {
    if (!checked && !hasResidential) return;
    setValue('has_commercial', checked);
    if (!checked) setValue('tenant_type', 'physical');
  };

  const handleCommercialSubType = (subType: 'physical' | 'legal_entity') => {
    setValue('tenant_type', subType);
    if (subType === 'legal_entity') setValue('has_residential', false);
  };

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
          {/* --- 0. TYPE DE DOSSIER --- */}
          <section className={sectionClass}>
            <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--primary-500))]">
              Type de dossier
            </h2>
            <p className="text-sm text-muted mb-4">
              Vous pouvez ajouter un nouveau profil à ce dossier. Au moins un profil doit rester
              actif.
            </p>

            <div className="flex gap-4 flex-wrap">
              <label className={checkboxCardClass(hasResidential ?? false)}>
                <input
                  type="checkbox"
                  checked={hasResidential ?? false}
                  onChange={(e) => handleResidentialToggle(e.target.checked)}
                  className="h-4 w-4 rounded text-[rgb(var(--primary-500))]"
                  disabled={isLegalEntity}
                />
                <div>
                  <p className="text-sm font-medium text-app">Résidentiel</p>
                  <p className="text-xs text-muted">Location d'appartement</p>
                </div>
              </label>

              <label className={checkboxCardClass(hasCommercial ?? false)}>
                <input
                  type="checkbox"
                  checked={hasCommercial ?? false}
                  onChange={(e) => handleCommercialToggle(e.target.checked)}
                  className="h-4 w-4 rounded text-[rgb(var(--primary-500))]"
                />
                <div>
                  <p className="text-sm font-medium text-app">Commercial</p>
                  <p className="text-xs text-muted">Location de local commercial</p>
                </div>
              </label>
            </div>

            {/* Sous-type commercial */}
            {hasCommercial && (
              <div className="mt-5 pt-5 border-t border-[rgb(var(--border))]">
                <p className="text-sm font-medium text-app mb-3">Profil commercial :</p>
                <div className="flex gap-4 flex-wrap">
                  <label className={checkboxCardClass(!isLegalEntity)}>
                    <input
                      type="radio"
                      checked={!isLegalEntity}
                      onChange={() => handleCommercialSubType('physical')}
                      className="h-4 w-4 text-[rgb(var(--primary-500))]"
                    />
                    <div>
                      <p className="text-sm font-medium text-app">Auto-entrepreneur</p>
                      <p className="text-xs text-muted">Personne physique / indépendant</p>
                    </div>
                  </label>
                  <label className={checkboxCardClass(isLegalEntity)}>
                    <input
                      type="radio"
                      checked={isLegalEntity}
                      onChange={() => handleCommercialSubType('legal_entity')}
                      className="h-4 w-4 text-[rgb(var(--primary-500))]"
                    />
                    <div>
                      <p className="text-sm font-medium text-app">Société</p>
                      <p className="text-xs text-muted">SARL, SAS, EURL…</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <input type="hidden" {...register('tenant_type')} />
            <input type="hidden" {...register('has_residential')} />
            <input type="hidden" {...register('has_commercial')} />
          </section>

          {/* --- 1. INFORMATIONS PERSONNELLES --- */}
          <section className={sectionClass}>
            <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
              Informations du locataire
            </h2>
            <TenantFormFields
              register={register}
              errors={errors}
              showResidentialFields={hasResidential ?? false}
            />
          </section>

          {/* --- 2. INFORMATIONS COMMERCIALES --- */}
          {hasCommercial && (
            <section className={sectionClass}>
              <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                {isLegalEntity ? 'Informations société' : 'Informations auto-entrepreneur'}
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {isLegalEntity && (
                  <>
                    <div className="md:col-span-2">
                      <InputLabel
                        htmlFor="company_name"
                        value="Raison sociale *"
                        className="mb-1"
                      />
                      <TextInput id="company_name" {...register('company_name')} />
                      {errors.company_name && (
                        <p className={errorClass}>{errors.company_name.message}</p>
                      )}
                    </div>

                    <div>
                      <InputLabel htmlFor="legal_form" value="Forme juridique" className="mb-1" />
                      <TextInput
                        id="legal_form"
                        placeholder="SARL, SAS, EURL…"
                        {...register('legal_form')}
                      />
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="share_capital"
                        value="Capital social (€)"
                        className="mb-1"
                      />
                      <TextInput
                        id="share_capital"
                        type="number"
                        step="0.01"
                        {...register('share_capital')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <InputLabel
                        htmlFor="registered_office"
                        value="Siège social"
                        className="mb-1"
                      />
                      <TextInput id="registered_office" {...register('registered_office')} />
                    </div>

                    <div>
                      <InputLabel htmlFor="rcs_city" value="Ville RCS" className="mb-1" />
                      <TextInput id="rcs_city" {...register('rcs_city')} />
                    </div>
                  </>
                )}

                <div>
                  <InputLabel htmlFor="siret" value="Numéro SIRET *" className="mb-1" />
                  <TextInput
                    id="siret"
                    placeholder="12345678901234"
                    maxLength={20}
                    {...register('siret')}
                  />
                  {errors.siret && <p className={errorClass}>{errors.siret.message}</p>}
                </div>
              </div>
            </section>
          )}

          {/* --- 3. AJOUTER DES DOCUMENTS --- */}
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

            <MissingDocumentsAlert missingCategories={missingCategories} />

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
                  categoryKeys={documentKeys}
                />
              ))}
            </div>
          </section>

          {/* --- 4. DOCUMENTS EXISTANTS --- */}
          {tenant.documents && tenant.documents.length > 0 && (
            <section className={sectionClass}>
              <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                Documents déjà enregistrés
              </h2>
              <ul className="space-y-3">
                {tenant.documents.map((doc) => (
                  <ExistingDocumentItem
                    key={doc.id}
                    doc={doc}
                    onDelete={(d) => deleteExistingDoc(d.id)}
                  />
                ))}
              </ul>
            </section>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button href={route('tenants.show', tenant.id)} variant="danger">
              Annuler
            </Button>

            <Button type="submit" variant="primary" disabled={isSubmitting || isPosting}>
              {isSubmitting || isPosting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
