import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';

interface TenantFormFieldsProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}

export default function TenantFormFields<T extends FieldValues>({
  register,
  errors,
}: TenantFormFieldsProps<T>) {
  const errorClass = 'mt-1 text-xs text-red-400 font-medium';
  const textareaClass =
    'w-full rounded-md border border-[rgb(var(--border))] bg-surface text-app px-3 py-2 outline-none transition-all duration-150 focus:border-[rgb(var(--primary-900))]';

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <InputLabel htmlFor="first_name" value="Prénom *" className="mb-1" />
        <TextInput id="first_name" {...register('first_name' as Path<T>)} />
        {errors.first_name && <p className={errorClass}>{errors.first_name.message as string}</p>}
      </div>
      <div>
        <InputLabel htmlFor="last_name" value="Nom *" className="mb-1" />
        <TextInput id="last_name" {...register('last_name' as Path<T>)} />
        {errors.last_name && <p className={errorClass}>{errors.last_name.message as string}</p>}
      </div>
      <div>
        <InputLabel htmlFor="email" value="Email" className="mb-1" />
        <TextInput id="email" type="email" {...register('email' as Path<T>)} />
        {errors.email && <p className={errorClass}>{errors.email.message as string}</p>}
      </div>
      <div>
        <InputLabel htmlFor="phone" value="Téléphone" className="mb-1" />
        <TextInput id="phone" type="tel" {...register('phone' as Path<T>)} />
      </div>
      <div className="md:col-span-2">
        <InputLabel htmlFor="current_address" value="Adresse actuelle" className="mb-1" />
        <TextInput id="current_address" {...register('current_address' as Path<T>)} />
      </div>
      <div className="md:col-span-2">
        <InputLabel htmlFor="marital_status" value="Statut marital" className="mb-1" />
        <SelectInput
          id="marital_status"
          {...register('marital_status' as Path<T>)}
          className="w-full"
        >
          <option value="">Sélectionner...</option>
          <option value="single">Célibataire</option>
          <option value="married">Marié(e)</option>
          <option value="pacs">Pacsé(e)</option>
          <option value="divorced">Divorcé(e)</option>
          <option value="widowed">Veuf/Veuve</option>
          <option value="colocation">En colocation</option>
        </SelectInput>
      </div>
      <div>
        <InputLabel htmlFor="birth_date" value="Date de naissance" className="mb-1" />
        <TextInput id="birth_date" type="date" {...register('birth_date' as Path<T>)} />
      </div>
      <div>
        <InputLabel htmlFor="birth_place" value="Lieu de naissance" className="mb-1" />
        <TextInput id="birth_place" {...register('birth_place' as Path<T>)} />
      </div>
      <div>
        <InputLabel htmlFor="nationality" value="Nationalité" className="mb-1" />
        <TextInput id="nationality" {...register('nationality' as Path<T>)} />
      </div>
      <div className="mb-1">
        <InputLabel htmlFor="profession" value="Profession" className="mb-1" />
        <TextInput id="profession" {...register('profession' as Path<T>)} />
      </div>
      <div className="md:col-span-2">
        <InputLabel htmlFor="notes" value="Notes internes" className="mb-1" />
        <textarea id="notes" rows={3} {...register('notes' as Path<T>)} className={textareaClass} />
      </div>
    </div>
  );
}
