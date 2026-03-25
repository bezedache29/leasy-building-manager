import { Disclosure } from '@headlessui/react';
import PhotoGallery from '@/Components/PhotoGallery';
import IconButton from '@/Components/IconButton';
import { Equipment, Room } from '@/Types/property';
import { AppDocument } from '@/Types';

interface Props {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
  photos?: AppDocument[];
  rooms?: Room[];
}

export default function EquipmentItem({
  equipment,
  onEdit,
  onDelete,
  photos = [],
  rooms = [],
}: Props) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-[rgb(var(--border))] p-3">
      {/* Ligne principale avec le nom et les boutons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-app">
            {equipment.quantity}x {equipment.name}
          </span>
          {equipment.type && (
            <span className="rounded-full border border-[rgb(var(--border))] bg-surface-2 px-2 py-0.5 text-xs text-muted">
              {equipment.type}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            variant="warning"
            size="sm"
            aria-label="Modifier l'équipement"
            onClick={() => onEdit(equipment)}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            variant="danger"
            size="sm"
            aria-label="Archiver l'équipement"
            onClick={() => onDelete(equipment)}
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
        </div>
      </div>

      {/* Etat et notes */}
      <div className="text-sm text-muted">{equipment.notes && <span>{equipment.notes}</span>}</div>

      {/* Le fameux Collapse pour les photos de l'equipement */}
      {photos.length > 0 && (
        <Disclosure as="div" className="mt-2">
          {({ open }) => (
            <>
              <Disclosure.Button className="cursor-pointer flex items-center text-xs font-medium text-[rgb(var(--primary-300))] hover:text-[rgb(var(--primary-400))] focus:outline-none">
                <svg
                  className={`mr-1 h-4 w-4 transform transition-transform ${open ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                {open ? 'Masquer' : `Voir photos (${photos.length})`}
              </Disclosure.Button>
              <Disclosure.Panel className="pt-2">
                <PhotoGallery photos={photos} rooms={rooms} title="Détails" />
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}
    </li>
  );
}
