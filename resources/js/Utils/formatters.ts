/**
 * Formate l'étage pour l'affichage (0 -> RDC, 1 -> 1er, etc.) [cite: 2026-03-10]
 */
export const formatFloor = (floor: number | null): string => {
  if (floor === null) return '—';
  if (floor === 0) return 'RDC';
  if (floor === 1) return '1er';
  return `${floor}ème`;
};
