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
import {
  DOCUMENT_CATEGORIES,
  TENANT_DOCUMENT_KEYS,
  COMMERCIAL_PHYSICAL_DOCUMENT_KEYS,
  COMMERCIAL_LEGAL_ENTITY_DOCUMENT_KEYS,
} from '@/Constants/documentCategories';
import TenantFormFields from '@/Pages/Tenants/Partials/TenantFormFields';

type TenantFormValues = z.input<typeof createTenantSchema>;
type TenantFormOutput = z.output<typeof createTenantSchema>;

export default function CreateTenant() {
  const [isPosting, setIsPosting] = useState(false);
  const [guarantorTypes, setGuarantorTypes] = useState<Array<'human' | 'visale'>>([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormValues, unknown, TenantFormOutput>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      tenant_type: 'physical',
      has_residential: true,
      has_commercial: false,
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

  const hasResidential = watch('has_residential');
  const hasCommercial = watch('has_commercial');
  const tenantType = watch('tenant_type');
  const isLegalEntity = tenantType === 'legal_entity';

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

  const onSubmit = (data: TenantFormOutput) => {
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

  // Calcul des catégories de documents selon les profils actifs
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

  const handleResidentialToggle = (checked: boolean) => {
    if (!checked && !hasCommercial) return; // au moins 1 obligatoire
    setValue('has_residential', checked);
  };

  const handleCommercialToggle = (checked: boolean) => {
    if (!checked && !hasResidential) return; // au moins 1 obligatoire
    setValue('has_commercial', checked);
    if (!checked) {
      // Si on désactive commercial et qu'on était en société → repasser en physical
      setValue('tenant_type', 'physical');
    }
  };

  const handleCommercialSubType = (subType: 'physical' | 'legal_entity') => {
    setValue('tenant_type', subType);
    if (subType === 'legal_entity') {
      // Une société ne peut pas être locataire résidentiel
      setValue('has_residential', false);
    }
  };

  const errorClass = 'mt-1 text-xs text-red-400 font-medium';
  const sectionClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';
  const checkboxCardClass = (active: boolean) =>
    `flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
      active
        ? 'border-[rgb(var(--primary-500))] bg-[rgb(var(--primary-500))]/5'
        : 'border-[rgb(var(--border))] hover:bg-surface-2'
    }`;

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl pb-12">
        <h1 className="mb-6 text-2xl font-semibold text-app">Nouveau Dossier Locataire</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- 0. TYPE DE DOSSIER --- */}
          <section className={sectionClass}>
            <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--primary-500))]">
              Type de dossier
            </h2>
            <p className="text-sm text-muted mb-4">
              Sélectionnez le ou les profils pour ce locataire. Au moins un profil est obligatoire.
            </p>

            <div className="flex gap-4 flex-wrap">
              {/* Checkbox Résidentiel */}
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

              {/* Checkbox Commercial */}
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
                      <p className="text-xs text-muted">
                        SARL, SAS, EURL… (profil résidentiel désactivé)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Champs cachés soumis silencieusement */}
            <input type="hidden" {...register('tenant_type')} />
            <input type="hidden" {...register('has_residential')} />
            <input type="hidden" {...register('has_commercial')} />
          </section>

          {/* --- 1. INFORMATIONS PERSONNELLES --- */}
          <section className={sectionClass}>
            <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
              Informations personnelles
            </h2>
            <TenantFormFields
              register={register}
              errors={errors}
              showResidentialFields={hasResidential ?? false}
            />
          </section>

          {/* --- 2. INFORMATIONS COMMERCIALES (si profil commercial actif) --- */}
          {hasCommercial && (
            <section className={sectionClass}>
              <h2 className="mb-5 text-lg font-semibold text-[rgb(var(--primary-500))]">
                {isLegalEntity ? 'Informations société' : 'Informations auto-entrepreneur'}
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Champs société uniquement */}
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

                {/* SIRET — pour tous les profils commerciaux */}
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

          {/* --- 3. GARANTS (résidentiel uniquement) --- */}
          {(hasResidential ?? false) && (
            <section className={sectionClass}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[rgb(var(--primary-500))]">
                  Garants (Cautions)
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addGuarantor({
                      type: 'human',
                      first_name: '',
                      last_name: '',
                      relationship: '',
                      marital_status: '',
                      email: '',
                      phone: '',
                      current_address: '',
                      profession: '',
                      documents: [],
                    });
                    setGuarantorTypes((prev) => [...prev, 'human']);
                  }}
                >
                  + Ajouter un garant
                </Button>
              </div>

              {guarantorFields.length === 0 ? (
                <p className="text-sm text-muted italic">Aucun garant n'a été ajouté.</p>
              ) : (
                <div className="space-y-6">
                  {guarantorFields.map((field, index) => {
                    const currentType = guarantorTypes[index] ?? 'human';
                    const isVisale = currentType === 'visale';

                    const handleTypeChange = (type: 'human' | 'visale') => {
                      setGuarantorTypes((prev) => prev.map((t, i) => (i === index ? type : t)));
                      setValue(`guarantors.${index}.type` as Path<TenantFormValues>, type);
                    };

                    return (
                      <div
                        key={field.id}
                        className="relative rounded-lg border border-dashed border-[rgb(var(--border))] p-5 bg-surface-2 space-y-4"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            removeGuarantor(index);
                            setGuarantorTypes((prev) => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute right-4 top-4 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                        >
                          Retirer le garant
                        </button>

                        {/* Toggle type */}
                        <div className="flex gap-3 pr-28">
                          <label
                            className={`flex-1 flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${!isVisale ? 'border-[rgb(var(--primary-500))] bg-[rgb(var(--primary-500))]/5' : 'border-[rgb(var(--border))] hover:bg-surface'}`}
                          >
                            <input
                              type="radio"
                              checked={!isVisale}
                              onChange={() => handleTypeChange('human')}
                              className="h-4 w-4 text-[rgb(var(--primary-500))]"
                            />
                            <div>
                              <p className="text-sm font-medium text-app">Garant ordinaire</p>
                              <p className="text-xs text-muted">Personne physique</p>
                            </div>
                          </label>
                          <label
                            className={`flex-1 flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${isVisale ? 'border-[rgb(var(--primary-500))] bg-[rgb(var(--primary-500))]/5' : 'border-[rgb(var(--border))] hover:bg-surface'}`}
                          >
                            <input
                              type="radio"
                              checked={isVisale}
                              onChange={() => handleTypeChange('visale')}
                              className="h-4 w-4 text-[rgb(var(--primary-500))]"
                            />
                            <div>
                              <p className="text-sm font-medium text-app">Garantie Visale</p>
                              <p className="text-xs text-muted">Action Logement</p>
                            </div>
                          </label>
                        </div>

                        {isVisale && (
                          <div className="rounded-lg border border-[rgb(var(--primary-500))]/30 bg-[rgb(var(--primary-500))]/5 px-4 py-3 text-sm text-muted">
                            Le garant sera enregistré sous le nom{' '}
                            <span className="font-semibold text-app">Action Logement / Visale</span>
                            . Uploader le document Visale ci-dessous.
                          </div>
                        )}

                        <GuarantorCard
                          prefix={`guarantors.${index}.`}
                          control={control}
                          register={register}
                          setValue={setValue}
                          errors={errors}
                          isVisale={isVisale}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* --- 4. DOCUMENTS --- */}
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
                        {documentKeys.map((key) => (
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
