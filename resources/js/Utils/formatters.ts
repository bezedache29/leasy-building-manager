/**
 * Formate l'étage pour l'affichage (0 -> RDC, 1 -> 1er, etc.) [cite: 2026-03-10]
 */
export const formatFloor = (floor: number | null): string => {
  if (floor === null) return '—';
  if (floor === 0) return 'RDC';
  if (floor === 1) return '1er';
  return `${floor}ème`;
};

export const getLocalISODate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatFullName = (person: {
  first_name: string | null;
  last_name: string | null;
}): string => {
  return `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim();
};

export const parseLocalDate = (dateInput: string | Date): Date => {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }

  const dateString = dateInput;
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);

  return new Date(year, month - 1, day);
};
