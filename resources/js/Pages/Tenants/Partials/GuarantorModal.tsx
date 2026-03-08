import { useEffect, useState } from 'react';
import { useForm, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import GuarantorCard from './GuarantorCard';
import { Guarantor } from '@/Types/guarantor';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import { guarantorModalSchema } from '@/Schemas/CreateGuarantorSchema';

type FormValues = z.infer<typeof guarantorModalSchema>;

interface Props {
  show: boolean;
  onClose: () => void;
  tenantId: number;
  guarantor: Guarantor | null;
  availableGuarantors: Guarantor[];
}

export default function GuarantorModal({
  show,
  onClose,
  tenantId,
  guarantor,
  availableGuarantors,
}: Props) {
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
    defaultValues: {
      first_name: '',
      last_name: '',
      relationship: '',
      marital_status: '',
      email: '',
      phone: '',
      current_address: '',
      profession: '',
      documents: [],
    },
  });

  useEffect(() => {
    if (show) {
      if (guarantor) {
        reset({
          first_name: guarantor.first_name,
          last_name: guarantor.last_name,
          relationship: guarantor.pivot?.relationship || '',
          marital_status: guarantor.marital_status || '',
          email: guarantor.email || '',
          phone: guarantor.phone || '',
          current_address: guarantor.current_address || '',
          profession: guarantor.profession || '',
          documents: [], // Les documents existants ne sont pas chargés ici (logique complexe à gérer côté métier)
        });
      } else {
        reset({
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
      }
    }
  }, [show, guarantor, reset]);

  const onSubmit = (data: FormValues) => {
    const submitRoute = guarantor
      ? route('tenants.guarantors.update', [tenantId, guarantor.id])
      : route('tenants.guarantors.store', tenantId);

    // On ajoute _method='put' manuellement pour Laravel si on est en édition
    const payload = { ...data, _method: guarantor ? 'put' : 'post' };

    router.post(submitRoute, payload, {
      forceFormData: true, // Obligatoire pour envoyer des fichiers
      preserveScroll: true,
      onSuccess: () => onClose(),
      onError: (serverErrors) => {
        // Si Laravel renvoie des erreurs de validation (422), on les injecte dans React Hook Form
        Object.entries(serverErrors).forEach(([key, message]) => {
          setError(key as Path<FormValues>, {
            type: 'server',
            message,
          });
        });
      },
    });
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl">
        <h2 className="text-xl font-semibold text-app mb-6">
          {guarantor ? 'Modifier le garant' : 'Ajouter un garant'}
        </h2>

        {!guarantor && (
          <div className="mb-6 flex gap-2 p-1 bg-surface-2 rounded-lg border border-[rgb(var(--border))] w-fit">
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'new' ? 'bg-surface text-primary shadow-sm border border-[rgb(var(--border))]' : 'text-muted hover:text-app'}`}
            >
              Nouveau garant
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'existing' ? 'bg-surface text-primary shadow-sm border border-[rgb(var(--border))]' : 'text-muted hover:text-app'}`}
            >
              Garant existant
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {mode === 'existing' && !guarantor ? (
            <div className="space-y-4 border border-[rgb(var(--border))] p-5 rounded-lg bg-surface-2">
              <div>
                <InputLabel value="Sélectionner un garant existant" className="mb-1" />
                <SelectInput {...register('guarantor_id')} className="w-full">
                  <option value="">Choisir dans la liste...</option>
                  {availableGuarantors.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.last_name} {g.first_name} ({g.email || "Pas d'email"})
                    </option>
                  ))}
                </SelectInput>
              </div>
              <div>
                <InputLabel value="Lien avec le locataire" className="mb-1" />
                <SelectInput {...register('relationship')} className="w-full">
                  <option value="">Sélectionner...</option>
                  <option value="parent">Parent</option>
                  <option value="colleague">Collègue</option>
                  <option value="other">Autre</option>
                </SelectInput>
              </div>
            </div>
          ) : (
            /* --- VUE : CRÉATION / ÉDITION --- */
            <GuarantorCard
              prefix=""
              register={register}
              control={control}
              setValue={setValue}
              errors={errors}
            />
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border))]">
            <Button type="button" variant="danger" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Enregistrement...'
                : guarantor
                  ? 'Sauvegarder les modifications'
                  : 'Ajouter le garant'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
