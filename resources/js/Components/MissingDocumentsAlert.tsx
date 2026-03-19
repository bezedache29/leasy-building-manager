import { DOCUMENT_CATEGORIES } from '@/Constants/documentCategories';

interface Props {
  missingCategories: string[];
  title?: string;
}

export default function MissingDocumentsAlert({
  missingCategories,
  title = 'Pièces manquantes recommandées pour finaliser le dossier :',
}: Props) {
  if (!missingCategories || missingCategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-[rgb(var(--warning-500))]/20 bg-[rgb(var(--warning-500))]/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-app flex items-center gap-2">
        <span>💡</span> {title}
      </h3>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-muted">
        {missingCategories.map((key) => (
          <li key={key} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--warning-500))]"></span>
            {DOCUMENT_CATEGORIES[key] || key}
          </li>
        ))}
      </ul>
    </div>
  );
}
