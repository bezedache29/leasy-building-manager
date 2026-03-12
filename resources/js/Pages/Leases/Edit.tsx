import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { Property } from '@/Types/property';
import { Tenant } from '@/Types/tenant';
import { Lease } from '@/Types/lease';
import LeaseForm from '@/Pages/Leases/Partials/LeaseForm';

interface Props {
  lease: Lease;
  properties: Property[];
  tenants: Tenant[];
}

export default function Edit({ lease, properties, tenants }: Props) {
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl pb-12">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-app">Modifier le bail</h1>
          <Button href={route('properties.show', lease.property_id)} variant="secondary">
            Annuler
          </Button>
        </header>

        <LeaseForm properties={properties} tenants={tenants} lease={lease} />
      </div>
    </AppLayout>
  );
}
