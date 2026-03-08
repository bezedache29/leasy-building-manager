import {
  useFieldArray,
  UseFormRegister,
  Control,
  UseFormSetValue,
  FieldErrors,
  FieldValues,
  Path,
  ArrayPath,
  PathValue,
} from 'react-hook-form';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import Button from '@/Components/Button';
import { DOCUMENT_CATEGORIES, GUARANTOR_DOCUMENT_KEYS } from '@/Constants/documentCategories';

// 1. On utilise un Générique <T> qui accepte n'importe quel formulaire valide
interface Props<T extends FieldValues> {
  prefix?: string;
  register: UseFormRegister<T>;
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  onRemove?: () => void;
}

// 2. On applique le Générique au composant
export default function GuarantorCard<T extends FieldValues>({
  prefix = '',
  register,
  control,
  setValue,
  errors,
  onRemove,
}: Props<T>) {
  const errorClass = 'mt-1 text-xs text-red-400 font-medium';

  // On dit à TypeScript que ce chemin dynamique pointe bien vers un tableau dans notre formulaire
  const docPath = (prefix ? `${prefix}documents` : 'documents') as ArrayPath<T>;

  const {
    fields: docs,
    append: addDoc,
    remove: removeDoc,
  } = useFieldArray({
    control,
    name: docPath,
  });

  // Fonction utilitaire strictement typée pour aller chercher les erreurs imbriquées
  const getError = (path: string): string | undefined => {
    const parts = path.split('.');
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
    <div
      className={`relative ${onRemove ? 'rounded-lg border border-dashed border-[rgb(var(--border))] p-5 bg-surface-2' : ''}`}
    >
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-4 top-4 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
        >
          Retirer
        </button>
      )}

      <div className="grid gap-4 md:grid-cols-2 mt-2">
        <div>
          <InputLabel value="Prénom *" className="mb-1" />
          <TextInput {...register(`${prefix}first_name` as Path<T>)} />
          {getError(`${prefix}first_name`) && (
            <p className={errorClass}>{getError(`${prefix}first_name`)}</p>
          )}
        </div>
        <div>
          <InputLabel value="Nom *" className="mb-1" />
          <TextInput {...register(`${prefix}last_name` as Path<T>)} />
          {getError(`${prefix}last_name`) && (
            <p className={errorClass}>{getError(`${prefix}last_name`)}</p>
          )}
        </div>

        <div>
          <InputLabel value="Lien avec le locataire" className="mb-1" />
          <SelectInput {...register(`${prefix}relationship` as Path<T>)} className="w-full">
            <option value="">Sélectionner...</option>
            <option value="parent">Parent</option>
            <option value="grandparent">Grand-parent</option>
            <option value="sibling">Frère / Sœur</option>
            <option value="friend">Ami(e)</option>
            <option value="colleague">Collègue</option>
            <option value="other">Autre</option>
          </SelectInput>
          {getError(`${prefix}relationship`) && (
            <p className={errorClass}>{getError(`${prefix}relationship`)}</p>
          )}
        </div>

        <div>
          <InputLabel value="Statut marital" className="mb-1" />
          <SelectInput {...register(`${prefix}marital_status` as Path<T>)} className="w-full">
            <option value="">Sélectionner...</option>
            <option value="single">Célibataire</option>
            <option value="married">Marié(e)</option>
            <option value="pacs">Pacsé(e)</option>
            <option value="divorced">Divorcé(e)</option>
            <option value="widowed">Veuf/Veuve</option>
          </SelectInput>
          {getError(`${prefix}marital_status`) && (
            <p className={errorClass}>{getError(`${prefix}marital_status`)}</p>
          )}
        </div>

        <div>
          <InputLabel value="Email" className="mb-1" />
          <TextInput type="email" {...register(`${prefix}email` as Path<T>)} />
          {getError(`${prefix}email`) && <p className={errorClass}>{getError(`${prefix}email`)}</p>}
        </div>
        <div>
          <InputLabel value="Téléphone" className="mb-1" />
          <TextInput type="tel" {...register(`${prefix}phone` as Path<T>)} />
          {getError(`${prefix}phone`) && <p className={errorClass}>{getError(`${prefix}phone`)}</p>}
        </div>

        <div className="md:col-span-2">
          <InputLabel value="Adresse actuelle" className="mb-1" />
          <TextInput {...register(`${prefix}current_address` as Path<T>)} />
          {getError(`${prefix}current_address`) && (
            <p className={errorClass}>{getError(`${prefix}current_address`)}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <InputLabel value="Profession" className="mb-1" />
          <TextInput {...register(`${prefix}profession` as Path<T>)} />
          {getError(`${prefix}profession`) && (
            <p className={errorClass}>{getError(`${prefix}profession`)}</p>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[rgb(var(--border))]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-app">Documents joints</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addDoc({
                category: 'id_card',
                name: '',
                file: undefined,
              } as unknown as Parameters<typeof addDoc>[0])
            }
          >
            + Joindre un document
          </Button>
        </div>

        {docs.length === 0 ? (
          <p className="text-xs text-muted italic">Aucun document joint pour ce garant.</p>
        ) : (
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            {docs.map((doc, docIndex) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-start gap-4 rounded-lg border border-[rgb(var(--border))] p-3 bg-surface"
              >
                <div className="flex-1 min-w-[120px]">
                  <InputLabel value="Catégorie" className="mb-1" />
                  <SelectInput {...register(`${docPath}.${docIndex}.category` as Path<T>)}>
                    <option value="">Sélectionner une catégorie</option>
                    {GUARANTOR_DOCUMENT_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {DOCUMENT_CATEGORIES[key]}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <InputLabel value="Nom du document" className="mb-1" />
                  <TextInput
                    {...register(`${docPath}.${docIndex}.name` as Path<T>)}
                    placeholder="ex: CNI Recto"
                  />
                  {getError(`${docPath}.${docIndex}.name`) && (
                    <p className={errorClass}>{getError(`${docPath}.${docIndex}.name`)}</p>
                  )}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <InputLabel value="Fichier PDF / Image" className="mb-1" />
                  <input
                    type="file"
                    className="block w-full text-xs text-muted file:mr-2 file:rounded-md file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-xs file:font-medium file:text-app hover:file:bg-surface file:cursor-pointer file:border file:border-[rgb(var(--border))]"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        // setValue strictement typé
                        setValue(
                          `${docPath}.${docIndex}.file` as Path<T>,
                          e.target.files[0] as PathValue<T, Path<T>>,
                          { shouldValidate: true }
                        );
                      }
                    }}
                  />
                  {getError(`${docPath}.${docIndex}.file`) && (
                    <p className={errorClass}>{getError(`${docPath}.${docIndex}.file`)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeDoc(docIndex)}
                  className="mt-6 text-sm text-red-400 hover:text-red-300"
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
