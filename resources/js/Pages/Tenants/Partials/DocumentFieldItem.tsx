import {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  ArrayPath,
} from 'react-hook-form';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import { DOCUMENT_CATEGORIES } from '@/Constants/documentCategories';

import { UseFieldArrayRemove } from 'react-hook-form';

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  docPath: ArrayPath<T>;
  index: number;
  remove: UseFieldArrayRemove;
  categoryKeys: string[];
}

export default function DocumentFieldItem<T extends FieldValues>({
  register,
  setValue,
  errors,
  docPath,
  index,
  remove,
  categoryKeys,
}: Props<T>) {
  const errorClass = 'mt-1 text-xs text-red-400 font-medium';

  const getNestedError = (fieldName: string): string | undefined => {
    const fullPath = `${docPath}.${index}.${fieldName}`;
    const parts = fullPath.split('.');
    let current: unknown = errors;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return (current as { message?: string })?.message;
  };

  return (
    <div className="flex flex-wrap items-start gap-4 rounded-lg border border-[rgb(var(--border))] p-3 bg-surface">
      {/* Sélecteur de Catégorie */}
      <div className="flex-1 min-w-[120px]">
        <InputLabel value="Catégorie" className="mb-1" />
        <SelectInput {...register(`${docPath}.${index}.category` as Path<T>)}>
          <option value="">Sélectionner...</option>
          {categoryKeys.map((key) => (
            <option key={key} value={key}>
              {DOCUMENT_CATEGORIES[key]}
            </option>
          ))}
        </SelectInput>
      </div>

      {/* Nom du document */}
      <div className="flex-1 min-w-[150px]">
        <InputLabel value="Nom du document" className="mb-1" />
        <TextInput
          {...register(`${docPath}.${index}.name` as Path<T>)}
          placeholder="ex: CNI Recto"
        />
        {getNestedError('name') && <p className={errorClass}>{getNestedError('name')}</p>}
      </div>

      {/* Input Fichier */}
      <div className="flex-1 min-w-[200px]">
        <InputLabel value="Fichier PDF / Image" className="mb-1" />
        <input
          type="file"
          className="block w-full text-xs text-muted file:mr-2 file:rounded-md file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-xs file:font-medium file:text-app hover:file:bg-surface file:cursor-pointer file:border file:border-[rgb(var(--border))]"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setValue(
                `${docPath}.${index}.file` as Path<T>,
                e.target.files[0] as PathValue<T, Path<T>>,
                { shouldValidate: true }
              );
            }
          }}
        />
        {getNestedError('file') && <p className={errorClass}>{getNestedError('file')}</p>}
      </div>

      <button
        type="button"
        onClick={() => remove(index)}
        className="mt-6 text-sm text-red-400 hover:text-red-300 font-bold px-2 cursor-pointer"
        title="Retirer ce document"
      >
        Retirer
      </button>
    </div>
  );
}
