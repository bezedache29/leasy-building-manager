import {
  useFieldArray,
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormRegister,
} from 'react-hook-form';
import z from 'zod';
import createTenantSchema from '@/Schemas/CreateTenantSchema';

import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import Button from '@/Components/Button';

type TenantFormValues = z.infer<typeof createTenantSchema>;

interface Props {
  index: number;
  control: Control<TenantFormValues>;
  register: UseFormRegister<TenantFormValues>;
  setValue: UseFormSetValue<TenantFormValues>;
  errors: FieldErrors<TenantFormValues>;
  onRemove: () => void;
}

export default function GuarantorCard({
  index,
  control,
  register,
  setValue,
  errors,
  onRemove,
}: Props) {
  const errorClass = 'mt-1 text-xs text-red-400 font-medium';

  const {
    fields: docs,
    append: addDoc,
    remove: removeDoc,
  } = useFieldArray({
    control,
    name: `guarantors.${index}.documents` as const,
  });

  return (
    <div className="relative rounded-lg border border-dashed border-[rgb(var(--border))] p-5 bg-surface-2">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-4 top-4 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
      >
        Retirer
      </button>

      <div className="grid gap-4 md:grid-cols-2 mt-2">
        <div>
          <InputLabel value="Prénom *" className="mb-1" />
          <TextInput {...register(`guarantors.${index}.first_name` as const)} />
          {errors.guarantors?.[index]?.first_name && (
            <p className={errorClass}>{errors.guarantors[index]?.first_name?.message}</p>
          )}
        </div>
        <div>
          <InputLabel value="Nom *" className="mb-1" />
          <TextInput {...register(`guarantors.${index}.last_name` as const)} />
          {errors.guarantors?.[index]?.last_name && (
            <p className={errorClass}>{errors.guarantors[index]?.last_name?.message}</p>
          )}
        </div>
        <div>
          <InputLabel value="Email" className="mb-1" />
          <TextInput type="email" {...register(`guarantors.${index}.email` as const)} />
        </div>
        <div>
          <InputLabel value="Téléphone" className="mb-1" />
          <TextInput type="tel" {...register(`guarantors.${index}.phone` as const)} />
        </div>

        <div className="md:col-span-2">
          <InputLabel value="Adresse actuelle" className="mb-1" />
          <TextInput {...register(`guarantors.${index}.current_address` as const)} />
        </div>
        <div className="md:col-span-2">
          <InputLabel value="Profession" className="mb-1" />
          <TextInput {...register(`guarantors.${index}.profession` as const)} />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[rgb(var(--border))]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-app">Documents du garant</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addDoc({ category: 'id_card', name: '', file: undefined as unknown as File })
            }
          >
            + Joindre un document
          </Button>
        </div>

        {docs.length === 0 ? (
          <p className="text-xs text-muted italic">Aucun document joint pour ce garant.</p>
        ) : (
          <div className="space-y-3">
            {docs.map((doc, docIndex) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-start gap-4 rounded-lg border border-[rgb(var(--border))] p-3 bg-surface"
              >
                <div className="flex-1 min-w-[120px]">
                  <SelectInput
                    {...register(`guarantors.${index}.documents.${docIndex}.category` as const)}
                  >
                    <option value="id_card">Pièce d'identité</option>
                    <option value="payslip">Fiche de paie</option>
                    <option value="tax_notice">Avis d'imposition</option>
                    <option value="other">Autre</option>
                  </SelectInput>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <TextInput
                    {...register(`guarantors.${index}.documents.${docIndex}.name` as const)}
                    placeholder="Nom (ex: CNI)"
                  />
                  {errors.guarantors?.[index]?.documents?.[docIndex]?.name && (
                    <p className={errorClass}>
                      {errors.guarantors[index]?.documents?.[docIndex]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="file"
                    className="block w-full text-xs text-muted file:mr-2 file:rounded-md file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-xs file:font-medium file:text-app hover:file:bg-surface file:cursor-pointer file:border file:border-[rgb(var(--border))]"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setValue(
                          `guarantors.${index}.documents.${docIndex}.file` as const,
                          e.target.files[0],
                          { shouldValidate: true }
                        );
                      }
                    }}
                  />
                  {errors.guarantors?.[index]?.documents?.[docIndex]?.file && (
                    <p className={errorClass}>
                      {errors.guarantors[index]?.documents?.[docIndex]?.file?.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeDoc(docIndex)}
                  className="mt-2 text-sm text-red-400 hover:text-red-300"
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
