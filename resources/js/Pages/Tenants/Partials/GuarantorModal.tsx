import { useEffect, useState } from 'react';
import { useForm, useWatch, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import GuarantorCard from './GuarantorCard';
import { Guarantor } from '@/Types/guarantor';
import { guarantorModalSchema } from '@/Schemas/CreateGuarantorSchema';
// 1. On importe les listes et traductions centralisées
import { GUARANTOR_DOCUMENT_KEYS } from '@/Constants/documentCategories';
import { GUARANTOR_RELATIONSHIPS } from '@/Constants/guarantorRelationships';
import MissingDocumentsAlert from '@/Components/MissingDocumentsAlert';
import { formatFullName } from '@/Utils/formatters';

type FormValues = z.infer<typeof guarantorModalSchema>;

interface Props {
  show: boolean;
  onClose: () => void;
  tenantId: number;
  guarantor: Guarantor | null;
  availableGuarantors: Guarantor[];
}

const DEFAULT_VALUES: FormValues = {
  type: 'human',
  mode: 'new',
  guarantor_id: '',
  visale_contract_number: '',
  first_name: '',
  last_name: '',
  relationship: '',
  marital_status: '',
  email: '',
  phone: '',
  current_address: '',
  birth_date: '',
  birth_place: '',
  nationality: '',
  profession: '',
  documents: [],
};

export default function GuarantorModal({
  show,
  onClose,
  tenantId,
  guarantor,
  availableGuarantors,
}: Props) {
  // Mode de saisie : nouveau garant depuis zero, ou rattachement d'un garant deja existant
  const [mode, setMode] = useState<'new' | 'existing'>('new');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(guarantorModalSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const selectedType = useWatch({ control, name: 'type' });
  const isVisale = selectedType === 'visale' || false;

  const selectedGuarantorId = useWatch({ control, name: 'guarantor_id' });
  const selectedExistingGuarantor = availableGuarantors.find(
    (g) => String(g.id) === String(selectedGuarantorId)
  );

  useEffect(() => {
    if (show) {
      setMode('new');
      if (guarantor) {
        reset({
          ...DEFAULT_VALUES,
          type: guarantor.type ?? 'human',
          visale_contract_number: guarantor.visale_contract_number || '',
          first_name: guarantor.first_name ?? undefined,
          last_name: guarantor.last_name ?? undefined,
          relationship: guarantor.pivot?.relationship || '',
          marital_status: guarantor.marital_status || '',
          email: guarantor.email || '',
          phone: guarantor.phone || '',
          current_address: guarantor.current_address || '',
          birth_date: guarantor.birth_date ? guarantor.birth_date.substring(0, 10) : '',
          birth_place: guarantor.birth_place || '',
          nationality: guarantor.nationality || '',
          profession: guarantor.profession || '',
        });
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [show, guarantor, reset]);

  // Changement de mode : on repart d'un formulaire propre pour ne pas melanger
  // les donnees d'un garant existant avec la saisie d'un nouveau garant
  const handleModeChange = (newMode: 'new' | 'existing') => {
    setMode(newMode);
    reset({ ...DEFAULT_VALUES, mode: newMode });
  };

  // Le garant est-il deja partage avec d'autres locataires ? (pertinent uniquement en édition)
  const sharedWithOtherTenants = (guarantor?.tenants || []).filter((t) => t.id !== tenantId);

  const onSubmit = (data: FormValues) => {
    if (guarantor) {
      // Pour l'édition avec documents, on utilise POST + _method: PUT
      router.post(
        route('tenants.guarantors.update', [tenantId, guarantor.id]),
        {
          ...data,
          _method: 'put',
        },
        {
          forceFormData: true,
          preserveScroll: true,
          onSuccess: () => onClose(),
          onError: (serverErrors) => {
            Object.entries(serverErrors).forEach(([key, message]) => {
              setError(key as Path<FormValues>, { type: 'server', message: message as string });
            });
          },
        }
      );
    } else {
      router.post(route('tenants.guarantors.store', tenantId), data, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => onClose(),
        onError: (serverErrors) => {
          Object.entries(serverErrors).forEach(([key, message]) => {
            setError(key as Path<FormValues>, { type: 'server', message: message as string });
          });
        },
      });
    }
  };

  // 2. Calcul des pièces manquantes pour le garant
  const existingCategories = guarantor?.documents?.map((doc) => doc.category) || [];
  const missingCategories = GUARANTOR_DOCUMENT_KEYS.filter(
    (key) => !existingCategories.includes(key) && key !== 'other'
  );

  return (
    <Modal show={show} onClose={onClose} maxWidth="4xl">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <h2 className="text-xl font-semibold text-app mb-6">
          {guarantor ? 'Modifier le garant' : 'Ajouter un garant'}
        </h2>

        {/* Avertissement : ce garant est partagé avec d'autres locataires (colocation) */}
        {guarantor && sharedWithOtherTenants.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-600">
            ⚠️ Ce garant est également rattaché à{' '}
            <span className="font-semibold">
              {sharedWithOtherTenants.map((t) => formatFullName(t)).join(', ')}
            </span>
            . Toute modification (informations ou documents) s'appliquera aussi à leur dossier.
          </div>
        )}

        {/* Choix du mode — uniquement en ajout, pas en édition d'un garant déjà rattaché */}
        {!guarantor && availableGuarantors.length > 0 && (
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleModeChange('new')}
              className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${mode === 'new' ? 'border-[rgb(var(--primary-500))] bg-[rgb(var(--primary-500))]/5' : 'border-[rgb(var(--border))] hover:bg-surface-2'}`}
            >
              <p className="text-sm font-medium text-app">Nouveau garant</p>
              <p className="text-xs text-muted">Saisir un garant qui n'existe pas encore</p>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('existing')}
              className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${mode === 'existing' ? 'border-[rgb(var(--primary-500))] bg-[rgb(var(--primary-500))]/5' : 'border-[rgb(var(--border))] hover:bg-surface-2'}`}
            >
              <p className="text-sm font-medium text-app">Garant existant</p>
              <p className="text-xs text-muted">
                Rattacher le garant d'un colocataire déjà présent dans l'app
              </p>
            </button>
          </div>
        )}

        {/* Pièces manquantes — uniquement pour les garants ordinaires en mode "nouveau" */}
        {mode === 'new' && !isVisale && (
          <MissingDocumentsAlert
            missingCategories={missingCategories}
            title="Pièces manquantes recommandées pour le dossier du garant :"
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {mode === 'existing' ? (
            <>
              <div>
                <InputLabel value="Garant à rattacher *" className="mb-1" />
                <SelectInput {...register('guarantor_id')} className="w-full">
                  <option value="">Sélectionner un garant...</option>
                  {availableGuarantors.map((g) => (
                    <option key={g.id} value={g.id}>
                      {formatFullName(g)}
                      {g.type === 'visale' ? ' (Visale)' : ''}
                      {g.tenants && g.tenants.length > 0
                        ? ` — déjà garant de : ${g.tenants.map((t) => formatFullName(t)).join(', ')}`
                        : ''}
                    </option>
                  ))}
                </SelectInput>
                {errors.guarantor_id && (
                  <p className="mt-1 text-xs text-red-400 font-medium">
                    {errors.guarantor_id.message}
                  </p>
                )}
              </div>

              {selectedExistingGuarantor && (
                <div className="rounded-lg border border-[rgb(var(--border))] bg-surface-2 px-4 py-3 text-sm text-muted">
                  Ce garant sera rattaché à ce dossier avec les documents déjà fournis
                  {selectedExistingGuarantor.tenants && selectedExistingGuarantor.tenants.length > 0
                    ? ` (actuellement garant de ${selectedExistingGuarantor.tenants.map((t) => formatFullName(t)).join(', ')})`
                    : ''}
                  . Aucune nouvelle pièce à fournir.
                </div>
              )}

              <div>
                <InputLabel value="Lien avec le locataire" className="mb-1" />
                <SelectInput {...register('relationship')} className="w-full">
                  <option value="">Sélectionner...</option>
                  {GUARANTOR_RELATIONSHIPS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </SelectInput>
              </div>
            </>
          ) : (
            <>
              {/* Sélection du type de garant */}
              <div className="flex gap-3">
                <label
                  className={`flex-1 flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${!isVisale ? 'border-[rgb(var(--primary-500))] bg-[rgb(var(--primary-500))]/5' : 'border-[rgb(var(--border))] hover:bg-surface-2'}`}
                >
                  <input
                    type="radio"
                    value="human"
                    {...register('type')}
                    className="h-4 w-4 text-[rgb(var(--primary-500))]"
                  />
                  <div>
                    <p className="text-sm font-medium text-app">Garant ordinaire</p>
                    <p className="text-xs text-muted">Personne physique</p>
                  </div>
                </label>
                <label
                  className={`flex-1 flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${isVisale ? 'border-[rgb(var(--primary-500))] bg-[rgb(var(--primary-500))]/5' : 'border-[rgb(var(--border))] hover:bg-surface-2'}`}
                >
                  <input
                    type="radio"
                    value="visale"
                    {...register('type')}
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
                  <span className="font-semibold text-app">Action Logement / Visale</span>.
                  Renseigner le numéro de contrat Visale et uploader le document Visale ci-dessous.
                </div>
              )}

              <GuarantorCard
                prefix=""
                register={register}
                control={control}
                setValue={setValue}
                errors={errors}
                existingDocuments={guarantor?.documents || []}
                isVisale={isVisale}
              />
            </>
          )}

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
