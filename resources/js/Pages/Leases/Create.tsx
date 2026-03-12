import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { Property } from '@/Types/property';
import { Tenant } from '@/Types/tenant';
import LeaseForm from '@/Pages/Leases/Partials/LeaseForm';

interface Props {
  properties: Property[];
  tenants: Tenant[];
  defaultPropertyId?: number;
}

export default function Create({ properties, tenants, defaultPropertyId }: Props) {
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl pb-12">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-app">Nouveau Bail</h1>
          <Button href={route('properties.index')} variant="secondary">
            Retour
          </Button>
        </header>

        <LeaseForm
          properties={properties}
          tenants={tenants}
          defaultPropertyId={defaultPropertyId}
        />
      </div>
    </AppLayout>
  );
}
