import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { leaseSchema } from '@/Schemas/LeaseSchema';
import Button from '@/Components/Button';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { Property } from '@/Types/property';
import { Tenant } from '@/Types/tenant';
import { Lease } from '@/Types/lease';
import z from 'zod';

type FormInput = z.input<typeof leaseSchema>;
type FormOutput = z.output<typeof leaseSchema>;

interface Props {
  properties: Property[];
  tenants: Tenant[];
  lease?: Lease;
  defaultPropertyId?: number;
}

export default function LeaseForm({ properties, tenants, lease, defaultPropertyId }: Props) {
  const isEdit = !!lease;

  // Sécurisation de l'ordre : on s'assure que le locataire principal est TOUJOURS en premier
  const initialTenants = lease?.tenants
    ? [...lease.tenants].sort((a, b) => {
        if (a.pivot?.is_main_tenant) return -1;
        if (b.pivot?.is_main_tenant) return 1;
        return 0;
      })
    : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenants, setSelectedTenants] = useState<Tenant[]>(initialTenants);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      property_id: lease?.property_id || defaultPropertyId || 0,
      tenant_ids: initialTenants.map((t) => t.id),
      payment_day: lease?.payment_day || 1,
      // Utilisation du format local (en-CA donne YYYY-MM-DD) au lieu de l'UTC
      start_date: lease?.start_date
        ? String(lease.start_date).split('T')[0]
        : new Date().toLocaleDateString('en-CA'),
      end_date: lease?.end_date ? String(lease.end_date).split('T')[0] : '',
      rent_amount: lease?.rent_amount || 0,
      charges_amount: lease?.charges_amount || 0,
      deposit_amount: lease?.deposit_amount ?? null,
      insurer_name: lease?.insurer_name || '',
      insurer_address: lease?.insurer_address || '',
      insurer_phone: lease?.insurer_phone || '',
      keys_building_count: lease?.keys_building_count || 0,
      keys_mailbox_count: lease?.keys_mailbox_count || 0,
      keys_apartment_count: lease?.keys_apartment_count || 0,
    },
  });

  const onSubmit = (data: FormOutput) => {
    if (isEdit) {
      router.put(route('leases.update', lease.id), data);
    } else {
      router.post(route('leases.store'), data);
    }
  };

  const handleAddTenant = (tenant: Tenant) => {
    const newSelection = [...selectedTenants, tenant];
    setSelectedTenants(newSelection);
    setValue(
      'tenant_ids',
      newSelection.map((t) => t.id),
      { shouldValidate: true }
    );
    setSearchTerm('');
  };

  const handleRemoveTenant = (tenantId: number) => {
    const newSelection = selectedTenants.filter((t) => t.id !== tenantId);
    setSelectedTenants(newSelection);
    setValue(
      'tenant_ids',
      newSelection.map((t) => t.id),
      { shouldValidate: true }
    );
  };

  const availableTenants = tenants.filter(
    (t) =>
      !selectedTenants.find((st) => st.id === t.id) &&
      (t.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sectionTitleClass = 'text-lg font-semibold text-[rgb(var(--primary-500))] mb-6';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm space-y-10"
    >
      <section>
        <h2 className={sectionTitleClass}>Le Bien & La Période</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <InputLabel htmlFor="property_id" value="Bien loué *" className="mb-1" />
            <SelectInput
              id="property_id"
              {...register('property_id')}
              className={`w-full ${defaultPropertyId || isEdit ? 'bg-surface-2 cursor-not-allowed opacity-70' : ''}`}
              error={errors.property_id?.message}
              disabled={!!defaultPropertyId || isEdit}
            >
              <option value={0} disabled>
                Sélectionner un appartement...
              </option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </SelectInput>
          </div>

          <div>
            <InputLabel htmlFor="start_date" value="Date d'entrée *" className="mb-1" />
            <TextInput
              type="date"
              id="start_date"
              {...register('start_date')}
              className="w-full"
              error={errors.start_date?.message}
            />
          </div>

          <div>
            <InputLabel htmlFor="end_date" value="Date de sortie (Optionnel)" className="mb-1" />
            <TextInput
              type="date"
              id="end_date"
              {...register('end_date')}
              className="w-full"
              error={errors.end_date?.message}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--border))] pt-8">
        <h2 className={sectionTitleClass}>Les Locataires</h2>
        <div className="mb-4">
          <InputLabel htmlFor="tenant_search" value="Rechercher un locataire *" className="mb-1" />
          <div className="relative mt-1">
            <TextInput
              id="tenant_search"
              type="text"
              placeholder="Tapez un nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              error={errors.tenant_ids?.message}
            />

            {searchTerm && availableTenants.length > 0 && (
              <ul
                role="listbox"
                className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-surface border border-[rgb(var(--border))] py-1 shadow-lg"
              >
                {availableTenants.map((tenant) => (
                  <li key={tenant.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => handleAddTenant(tenant)}
                      className="w-full text-left cursor-pointer px-4 py-2 hover:bg-surface-2 focus:bg-surface-2 focus:outline-none text-app text-sm transition-colors"
                    >
                      {tenant.first_name} {tenant.last_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedTenants.length === 0 && (
            <span className="text-sm text-muted italic">Aucun locataire sélectionné.</span>
          )}
          {selectedTenants.map((tenant, index) => (
            <div
              key={tenant.id}
              className="flex items-center gap-2 rounded-full border border-[rgb(var(--primary-500))] bg-[rgb(var(--primary-500))]/10 py-1 pl-3 pr-1"
            >
              <span className="text-sm font-medium text-app">
                {index === 0 && (
                  <span className="mr-1" title="Locataire Principal">
                    👑
                  </span>
                )}
                {tenant.first_name} {tenant.last_name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveTenant(tenant.id)}
                aria-label={`Retirer ${tenant.first_name} ${tenant.last_name}`}
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-500 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[rgb(var(--border))] pt-8">
        <h2 className={sectionTitleClass}>Finances & Modalités</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <InputLabel htmlFor="rent_amount" value="Loyer (HC) *" className="mb-1" />
            <div className="relative mt-1">
              <TextInput
                type="number"
                step="0.01"
                id="rent_amount"
                {...register('rent_amount')}
                className="w-full pr-8"
                error={errors.rent_amount?.message}
              />
              <div className="pointer-events-none absolute right-3 top-2.5 flex items-center">
                <span className="text-muted sm:text-sm">€</span>
              </div>
            </div>
          </div>

          <div>
            <InputLabel htmlFor="charges_amount" value="Provision Charges *" className="mb-1" />
            <div className="relative mt-1">
              <TextInput
                type="number"
                step="0.01"
                id="charges_amount"
                {...register('charges_amount')}
                className="w-full pr-8"
                error={errors.charges_amount?.message}
              />
              <div className="pointer-events-none absolute right-3 top-2.5 flex items-center">
                <span className="text-muted sm:text-sm">€</span>
              </div>
            </div>
          </div>

          <div>
            <InputLabel htmlFor="deposit_amount" value="Dépôt de garantie" className="mb-1" />
            <div className="relative mt-1">
              <TextInput
                type="number"
                step="0.01"
                id="deposit_amount"
                {...register('deposit_amount')}
                className="w-full pr-8"
                error={errors.deposit_amount?.message}
              />
              <div className="pointer-events-none absolute right-3 top-2.5 flex items-center">
                <span className="text-muted sm:text-sm">€</span>
              </div>
            </div>
          </div>

          <div>
            <InputLabel htmlFor="payment_day" value="Jour de paiement *" className="mb-1" />
            <div className="relative mt-1">
              <TextInput
                type="number"
                min="1"
                max="31"
                id="payment_day"
                {...register('payment_day')}
                className="w-full pl-10"
                error={errors.payment_day?.message}
              />
              <div className="pointer-events-none absolute left-3 top-2.5 flex items-center">
                <span className="text-muted sm:text-sm">Le</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--border))] pt-8">
        <h2 className={sectionTitleClass}>Assurance & Remise des clés</h2>

        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <InputLabel htmlFor="insurer_name" value="Compagnie d'assurance" className="mb-1" />
            <TextInput
              id="insurer_name"
              {...register('insurer_name')}
              placeholder="Ex: Macif, Allianz..."
              className="w-full"
              error={errors.insurer_name?.message}
            />
          </div>
          <div>
            <InputLabel htmlFor="insurer_phone" value="Téléphone assurance" className="mb-1" />
            <TextInput
              id="insurer_phone"
              type="tel"
              {...register('insurer_phone')}
              className="w-full"
              error={errors.insurer_phone?.message}
            />
          </div>
          <div className="sm:col-span-2">
            <InputLabel htmlFor="insurer_address" value="Adresse de l'assurance" className="mb-1" />
            <TextInput
              id="insurer_address"
              {...register('insurer_address')}
              error={errors.insurer_address?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 rounded-lg border border-[rgb(var(--border))] bg-surface-2 p-4 sm:grid-cols-3">
          <div>
            <InputLabel
              htmlFor="keys_building_count"
              value="Clés Immeuble (Vigik)"
              className="mb-1"
            />
            <TextInput
              id="keys_building_count"
              type="number"
              min="0"
              {...register('keys_building_count')}
              className="w-full"
              error={errors.keys_building_count?.message}
            />
          </div>
          <div>
            <InputLabel
              htmlFor="keys_mailbox_count"
              value="Clés Boîte aux lettres"
              className="mb-1"
            />
            <TextInput
              id="keys_mailbox_count"
              type="number"
              min="0"
              {...register('keys_mailbox_count')}
              className="w-full"
              error={errors.keys_mailbox_count?.message}
            />
          </div>
          <div>
            <InputLabel htmlFor="keys_apartment_count" value="Clés Appartement" className="mb-1" />
            <TextInput
              id="keys_apartment_count"
              type="number"
              min="0"
              {...register('keys_apartment_count')}
              className="w-full"
              error={errors.keys_apartment_count?.message}
            />
          </div>
        </div>
      </section>

      <div className="mt-6 flex justify-end border-t border-[rgb(var(--border))] pt-6">
        <Button type="submit" disabled={isSubmitting} variant="primary">
          {isSubmitting
            ? 'Enregistrement...'
            : isEdit
              ? 'Enregistrer les modifications'
              : 'Créer le bail'}
        </Button>
      </div>
    </form>
  );
}
