import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FormEventHandler, useEffect } from 'react';
import { Lease } from '@/Types/lease';
import { getLocalISODate } from '@/Utils/formatters';

interface Props {
  show: boolean;
  onClose: () => void;
  lease: Lease | null;
}

export default function TerminateLeaseModal({ show, onClose, lease }: Props) {
  const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
    end_date: getLocalISODate(),
  });

  useEffect(() => {
    if (show) {
      setData('end_date', getLocalISODate());
      clearErrors();
    } else {
      reset();
    }
  }, [show]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    if (!lease) return;

    patch(route('leases.terminate', lease.id), {
      preserveScroll: true,
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal show={show} onClose={onClose} maxWidth="md">
      <div className="p-6 bg-surface border border-[rgb(var(--border))] rounded-xl">
        <h2 className="text-xl font-semibold text-app mb-6">Mettre fin au bail</h2>

        <form onSubmit={submit} className="space-y-6">
          <p className="text-sm text-muted">
            Veuillez indiquer la date de fin effective du contrat. Le bail sera conservé dans
            l'historique de l'appartement.
          </p>

          <div>
            <InputLabel htmlFor="end_date" value="Date de fin (Sortie) *" className="mb-1" />
            <TextInput
              id="end_date"
              type="date"
              className="w-full"
              value={data.end_date}
              onChange={(e) => setData('end_date', e.target.value)}
              error={errors.end_date}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border))]">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="danger" disabled={processing}>
              Clôturer le bail
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
