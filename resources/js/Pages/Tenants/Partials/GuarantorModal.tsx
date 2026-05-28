import { useEffect } from 'react';
import { useForm, useWatch, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import GuarantorCard from './GuarantorCard';
import { Guarantor } from '@/Types/guarantor';
import { guarantorModalSchema } from '@/Schemas/CreateGuarantorSchema';
// 1. On importe les listes et traductions centralisées
import { GUARANTOR_DOCUMENT_KEYS } from '@/Constants/documentCategories';
import MissingDocumentsAlert from '@/Components/MissingDocumentsAlert';

type FormValues = z.infer<typeof guarantorModalSchema>;

interface Props {
  show: boolean;
  onClose: () => void;
  tenantId: number;
  guarantor: Guarantor | null;
  availableGuarantors: Guarantor[];
}

export default function GuarantorModal({ show, onClose, tenantId, guarantor }: Props) {
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
    defaultValues: {
      type: 'human',
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
    },
  });

  const selectedType = useWatch({ control, name: 'type' });
  const isVisale = selectedType === 'visale' || false;

  useEffect(() => {
    if (show) {
      if (guarantor) {
        reset({
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
          documents: [],
        });
      } else {
        reset({
          type: 'human',
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
        });
      }
    }
  }, [show, guarantor, reset]);

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

        {/* Pièces manquantes — uniquement pour les garants ordinaires */}
        {!isVisale && (
          <MissingDocumentsAlert
            missingCategories={missingCategories}
            title="Pièces manquantes recommandées pour le dossier du garant :"
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <span className="font-semibold text-app">Action Logement / Visale</span>. Renseigner
              le numéro de contrat Visale et uploader le document Visale ci-dessous.
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
