import Button from '@/Components/Button';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }: { className?: string }) {
  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);

  const {
    data,
    setData,
    delete: destroy,
    processing,
    reset,
    errors,
    clearErrors,
  } = useForm({
    password: '',
  });

  const confirmUserDeletion = () => {
    setConfirmingUserDeletion(true);
  };

  const deleteUser: FormEventHandler = (e) => {
    e.preventDefault();
    destroy(route('profile.destroy'), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => passwordInput.current?.focus(),
      onFinish: () => reset(),
    });
  };

  const closeModal = () => {
    setConfirmingUserDeletion(false);
    clearErrors();
    reset();
  };

  return (
    <section className={`space-y-6 ${className}`}>
      <header>
        <h2 className="text-lg font-medium text-app">Supprimer le compte</h2>
        <p className="mt-1 text-sm text-muted">
          Une fois le compte supprimé, toutes les données seront définitivement effacées.
          Téléchargez toute information utile avant de procéder.
        </p>
      </header>

      <Button variant="danger" onClick={confirmUserDeletion}>
        Supprimer le compte
      </Button>

      <Modal show={confirmingUserDeletion} onClose={closeModal}>
        <form onSubmit={deleteUser} className="p-6">
          <h2 className="text-lg font-medium text-app">
            Êtes-vous sûr de vouloir supprimer votre compte ?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Cette action est irréversible. Veuillez saisir votre mot de passe pour confirmer.
          </p>

          <div className="mt-6">
            <InputLabel htmlFor="password" value="Mot de passe" className="sr-only" />
            <TextInput
              id="password"
              type="password"
              name="password"
              ref={passwordInput}
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className="mt-1 block w-3/4"
              isFocused
              placeholder="Mot de passe"
              error={errors.password}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>
              Annuler
            </Button>
            <Button variant="danger" disabled={processing}>
              Supprimer le compte
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
