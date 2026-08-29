import {
  useFieldArray,
  UseFormRegister,
  Control,
  UseFormSetValue,
  FieldErrors,
  FieldValues,
  Path,
  ArrayPath,
} from 'react-hook-form';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import Button from '@/Components/Button';
import { GUARANTOR_DOCUMENT_KEYS, VISALE_DOCUMENT_KEYS } from '@/Constants/documentCategories';
import { GUARANTOR_RELATIONSHIPS } from '@/Constants/guarantorRelationships';
import { AppDocument } from '@/Types';
import { router } from '@inertiajs/react';
import DocumentFieldItem from '@/Pages/Tenants/Partials/DocumentFieldItem';
import ExistingDocumentItem from '@/Pages/Tenants/Partials/ExistingDocumentItem'; // 👈 Nouvel import

interface Props<T extends FieldValues> {
  prefix?: string;
  register: UseFormRegister<T>;
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  onRemove?: () => void;
  showDocuments?: boolean;
  existingDocuments?: AppDocument[];
  isVisale?: boolean;
}

export default function GuarantorCard<T extends FieldValues>({
  prefix = '',
  register,
  control,
  setValue,
  errors,
  onRemove,
  showDocuments = true,
  existingDocuments = [],
  isVisale = false,
}: Props<T>) {
  const errorClass = 'mt-1 text-xs text-red-400 font-medium';

  const docPath = (prefix ? `${prefix}documents` : 'documents') as ArrayPath<T>;

  const {
    fields: docs,
    append: addDoc,
    remove: removeDoc,
  } = useFieldArray({
    control,
    name: docPath,
  });

  // Utilitaire pour récupérer les erreurs d'identité
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

  // Suppression immédiate en base (Soft Delete)
  const deleteExistingDoc = (doc: AppDocument) => {
    if (confirm(`Voulez-vous vraiment supprimer le document "${doc.name}" ?`)) {
      router.delete(route('documents.destroy', doc.id), {
        preserveScroll: true,
      });
    }
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
          Retirer le garant
        </button>
      )}

      {/* Numéro de contrat — uniquement pour Visale */}
      {isVisale && (
        <div className="mt-2">
          <InputLabel value="Numéro de contrat Visale" className="mb-1" />
          <TextInput
            {...register(`${prefix}visale_contract_number` as Path<T>)}
            placeholder="Ex : V12345678"
          />
          {getError(`${prefix}visale_contract_number`) && (
            <p className={errorClass}>{getError(`${prefix}visale_contract_number`)}</p>
          )}
        </div>
      )}

      {/* Champs d'identité — masqués pour Visale */}
      {!isVisale && (
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
              {GUARANTOR_RELATIONSHIPS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </SelectInput>
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
          </div>

          <div>
            <InputLabel value="Email" className="mb-1" />
            <TextInput type="email" {...register(`${prefix}email` as Path<T>)} />
          </div>
          <div>
            <InputLabel value="Téléphone" className="mb-1" />
            <TextInput type="tel" {...register(`${prefix}phone` as Path<T>)} />
          </div>

          <div className="md:col-span-2">
            <InputLabel value="Adresse actuelle" className="mb-1" />
            <TextInput {...register(`${prefix}current_address` as Path<T>)} />
          </div>

          <div>
            <InputLabel value="Date de naissance" className="mb-1" />
            <TextInput type="date" {...register(`${prefix}birth_date` as Path<T>)} />
          </div>
          <div>
            <InputLabel value="Lieu de naissance" className="mb-1" />
            <TextInput {...register(`${prefix}birth_place` as Path<T>)} />
          </div>

          <div>
            <InputLabel value="Nationalité" className="mb-1" />
            <TextInput {...register(`${prefix}nationality` as Path<T>)} />
          </div>

          <div>
            <InputLabel value="Profession" className="mb-1" />
            <TextInput {...register(`${prefix}profession` as Path<T>)} />
          </div>
        </div>
      )}

      {/* SECTION DOCUMENTS */}
      {showDocuments && (
        <div className="mt-6 pt-4 border-t border-[rgb(var(--border))]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-app">Gestion des documents</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addDoc({
                  category: '',
                  name: '',
                  file: undefined,
                } as unknown as Parameters<typeof addDoc>[0])
              }
            >
              + Joindre un fichier
            </Button>
          </div>

          {/* ✨ Documents déjà enregistrés ✨ */}
          {existingDocuments.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Déjà enregistrés
              </p>
              <ul className="space-y-1">
                {existingDocuments.map((doc) => (
                  <ExistingDocumentItem key={doc.id} doc={doc} onDelete={deleteExistingDoc} />
                ))}
              </ul>
            </div>
          )}

          {/* ✨ Nouveaux documents à ajouter ✨ */}
          {docs.length > 0 ? (
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                À ajouter au dossier
              </p>
              {docs.map((docField, docIndex) => (
                <DocumentFieldItem
                  key={docField.id}
                  index={docIndex}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  docPath={docPath}
                  remove={removeDoc}
                  categoryKeys={isVisale ? VISALE_DOCUMENT_KEYS : GUARANTOR_DOCUMENT_KEYS}
                />
              ))}
            </div>
          ) : (
            existingDocuments.length === 0 && (
              <p className="text-xs text-muted italic text-center py-4">
                Aucun document joint pour le moment.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
