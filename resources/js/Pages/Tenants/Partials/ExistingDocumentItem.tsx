import { AppDocument } from '@/Types';
import IconButton from '@/Components/IconButton';
import { DOCUMENT_CATEGORIES } from '@/Constants/documentCategories';

interface Props {
  doc: AppDocument;
  onDelete: (_doc: AppDocument) => void;
}

export default function ExistingDocumentItem({ doc, onDelete }: Props) {
  const getCategoryLabel = (cat: string | null) => {
    if (!cat) return 'Document';
    return DOCUMENT_CATEGORIES[cat as keyof typeof DOCUMENT_CATEGORIES] || cat;
  };

  return (
    <li className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
      <a
        href={`/storage/${doc.file_path}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-primary hover:underline flex items-center gap-2 min-w-0 flex-1 pr-4"
        title={`Ouvrir ${doc.name}`}
      >
        <span className="shrink-0">📄</span>
        <span className="truncate">
          {getCategoryLabel(doc.category)} - {doc.name}
        </span>
      </a>

      <IconButton
        variant="danger"
        size="sm"
        title="Supprimer le document"
        onClick={() => onDelete(doc)}
        className="bg-red-500/30"
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        }
      />
    </li>
  );
}
