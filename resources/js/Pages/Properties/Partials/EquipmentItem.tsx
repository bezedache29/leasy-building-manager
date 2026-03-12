import { Equipment } from '@/Types/property';
import IconButton from '@/Components/IconButton';

interface Props {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
}

export default function EquipmentItem({ equipment, onEdit, onDelete }: Props) {
  return (
    <li className="flex items-center justify-between py-3 border-b border-[rgb(var(--border))] last:border-0 gap-4">
      <div className="flex flex-col min-w-0 flex-1 pr-4">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[rgb(var(--primary-500))] text-lg leading-none">•</span>
          <span className="font-medium text-app truncate">
            {equipment.quantity}x {equipment.name}
          </span>
          {equipment.type && (
            <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted border border-[rgb(var(--border))]">
              {equipment.type}
            </span>
          )}
        </div>

        {equipment.notes && (
          <p className="mt-1 pl-4 text-xs text-muted truncate" title={equipment.notes}>
            {equipment.notes}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <IconButton
          aria-label="Modifier l'équipement"
          variant="ghost"
          size="sm"
          title="Modifier l'équipement"
          onClick={() => onEdit(equipment)}
          className="bg-orange-500/10 hover:bg-orange-500/30"
          icon={
            <svg
              className="h-4 w-4 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          }
        />
        <IconButton
          aria-label="Supprimer l'équipement"
          variant="ghost"
          size="sm"
          title="Supprimer l'équipement"
          onClick={() => onDelete(equipment)}
          className="bg-red-500/10 hover:bg-red-500/30"
          icon={
            <svg
              className="h-4 w-4 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          }
        />
      </div>
    </li>
  );
}
