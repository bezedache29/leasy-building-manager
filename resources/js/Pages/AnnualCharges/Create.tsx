import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Property } from '@/Types/property';
import { router } from '@inertiajs/react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface Props {
  property: Property;
}

interface AnnualChargeFormValues {
  year: number;
  water_meter_old: number;
  water_meter_new: number;

  // abonnements distribution
  distrib_sub_suez: number;
  distrib_sub_iroise: number;

  // tarifs distribution
  distrib_sup_1: number;
  distrib_shared_2: number; // valeur commune
  distrib_inf_2: number;
  distrib_sup_3: number;
  distrib_inf_3: number;

  // abonnements eaux usees
  wastewater_sub_suez: number;
  wastewater_sub_iroise: number;

  // tarifs eaux usees
  wastewater_sup_1: number;
  wastewater_shared_2: number; // valeur commune
  wastewater_inf_2: number;
  wastewater_sup_3: number;
  wastewater_inf_3: number;

  // organismes
  modernization_fee: number;
  water_agency_fee: number;
}

export default function Create({ property }: Props) {
  const activeLease = property.leases?.find((l) => l.status === 'active');

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AnnualChargeFormValues>({
    defaultValues: {
      year: new Date().getFullYear() - 1,
      water_meter_old: 0,
      water_meter_new: 0,
      distrib_sub_suez: 0,
      distrib_sub_iroise: 0,
      distrib_sup_1: 0,
      distrib_shared_2: 0,
      distrib_inf_2: 0,
      distrib_sup_3: 0,
      distrib_inf_3: 0,
      wastewater_sub_suez: 0,
      wastewater_sub_iroise: 0,
      wastewater_sup_1: 0,
      wastewater_shared_2: 0,
      wastewater_inf_2: 0,
      wastewater_sup_3: 0,
      wastewater_inf_3: 0,
      modernization_fee: 0.16,
      water_agency_fee: 0.3,
    },
  });

  const onSubmit: SubmitHandler<AnnualChargeFormValues> = (data) => {
    router.post(
      route('properties.annual-charges.store', property.id),
      data as unknown as Record<string, number>,
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl pb-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-app">Charges Annuelles - {property.name}</h1>
            <p className="text-muted mt-1 text-sm">
              Locataire(s) :{' '}
              {activeLease?.tenants?.map((t) => `${t.first_name} ${t.last_name}`).join(', ') ||
                'Aucun'}
            </p>
          </div>
          <Button href={route('properties.show', property.id)} variant="secondary">
            Retour au lot
          </Button>
        </header>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="w-32">
              <InputLabel value="Année" className="mb-2" />
              <TextInput
                type="number"
                {...register('year', { valueAsNumber: true, required: true })}
                className="mt-1"
              />
            </div>

            <div className="bg-[rgb(var(--warning-500))]/10 p-5 rounded-lg border border-[rgb(var(--warning-500))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--warning-700))] mb-4">
                1. Relevés du sous-compteur (Locataire)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <InputLabel value="Ancien index (m³)" />
                  <TextInput
                    type="number"
                    step="0.01"
                    {...register('water_meter_old', { valueAsNumber: true, required: true })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <InputLabel value="Nouvel index (m³)" />
                  <TextInput
                    type="number"
                    step="0.01"
                    {...register('water_meter_new', { valueAsNumber: true, required: true })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* DISTRIBUTION */}
            <div className="bg-[rgb(var(--primary-500))]/10 p-5 rounded-lg border border-[rgb(var(--primary-500))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--primary-700))] mb-4">
                2. Distribution d'Eau
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <InputLabel value="Abonnement Part Suez (€)" />
                  <TextInput
                    type="number"
                    step="0.01"
                    {...register('distrib_sub_suez', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <InputLabel value="Abonnement Part Iroise (€)" />
                  <TextInput
                    type="number"
                    step="0.01"
                    {...register('distrib_sub_iroise', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[rgb(var(--primary-500))]/20">
                <div className="mb-6 w-full sm:w-1/2">
                  <InputLabel value="2ème période page 3 (€) - Commune aux deux calculs" />
                  <TextInput
                    type="number"
                    step="0.0001"
                    {...register('distrib_shared_2', { valueAsNumber: true })}
                    className="mt-1 border-[rgb(var(--primary-500))] focus:ring-[rgb(var(--primary-500))]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-app text-sm mb-3">Valeur Année Inférieure</h4>
                    <div>
                      <InputLabel value="3ème période page 3 (€)" />
                      <TextInput
                        type="number"
                        step="0.0001"
                        {...register('distrib_inf_2', { valueAsNumber: true })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <InputLabel value="Dernière période page 2 (€)" />
                      <TextInput
                        type="number"
                        step="0.0001"
                        {...register('distrib_inf_3', { valueAsNumber: true })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-app text-sm mb-3">Valeur Année Supérieure</h4>
                    <div>
                      <InputLabel value="1ère période page 3 (€)" />
                      <TextInput
                        type="number"
                        step="0.0001"
                        {...register('distrib_sup_1', { valueAsNumber: true })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <InputLabel value="Dernière période page 3 (€)" />
                      <TextInput
                        type="number"
                        step="0.0001"
                        {...register('distrib_sup_3', { valueAsNumber: true })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EAUX USEES */}
            <div className="bg-[rgb(var(--primary-500))]/10 p-5 rounded-lg border border-[rgb(var(--primary-500))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--primary-700))] mb-4">
                3. Eaux Usées
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <InputLabel value="Abonnement Part Suez (€)" />
                  <TextInput
                    type="number"
                    step="0.01"
                    {...register('wastewater_sub_suez', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <InputLabel value="Abonnement Part Iroise (€)" />
                  <TextInput
                    type="number"
                    step="0.01"
                    {...register('wastewater_sub_iroise', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[rgb(var(--primary-500))]/20">
                <div className="mb-6 w-full sm:w-1/2">
                  <InputLabel value="2ème période page 3 (€) - Commune aux deux calculs" />
                  <TextInput
                    type="number"
                    step="0.0001"
                    {...register('wastewater_shared_2', { valueAsNumber: true })}
                    className="mt-1 border-[rgb(var(--primary-500))] focus:ring-[rgb(var(--primary-500))]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-app text-sm mb-3">Valeur Année Inférieure</h4>
                    <div>
                      <InputLabel value="3ème période page 3 (€)" />
                      <TextInput
                        type="number"
                        step="0.0001"
                        {...register('wastewater_inf_2', { valueAsNumber: true })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <InputLabel value="Dernière période page 2 (€)" />
                      <TextInput
                        type="number"
                        step="0.0001"
                        {...register('wastewater_inf_3', { valueAsNumber: true })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-app text-sm mb-3">Valeur Année Supérieure</h4>
                    <div>
                      <InputLabel value="1ère période page 3 (€)" />
                      <TextInput
                        type="number"
                        step="0.0001"
                        {...register('wastewater_sup_1', { valueAsNumber: true })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <InputLabel value="Dernière période page 3 (€)" />
                      <TextInput
                        type="number"
                        step="0.0001"
                        {...register('wastewater_sup_3', { valueAsNumber: true })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ORGANISMES PUBLICS */}
            <div className="bg-[rgb(var(--primary-500))]/10 p-5 rounded-lg border border-[rgb(var(--primary-500))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--primary-700))] mb-4">
                4. Organismes Publics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <InputLabel value="Modernisation Réseau (€/m³)" />
                  <TextInput
                    type="number"
                    step="0.0001"
                    {...register('modernization_fee', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <InputLabel value="Agence de l'eau (€/m³)" />
                  <TextInput
                    type="number"
                    step="0.0001"
                    {...register('water_agency_fee', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[rgb(var(--border))]">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Calcul en cours...' : 'Générer le calcul'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
