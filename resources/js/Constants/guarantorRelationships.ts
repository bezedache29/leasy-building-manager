// Liste centralisee des liens possibles entre un garant et un locataire,
// utilisee a la fois pour la creation d'un nouveau garant et le rattachement
// d'un garant existant (colocation).
export const GUARANTOR_RELATIONSHIPS: { value: string; label: string }[] = [
  { value: 'parent', label: 'Parent' },
  { value: 'grandparent', label: 'Grand-parent' },
  { value: 'sibling', label: 'Frère / Sœur' },
  { value: 'friend', label: 'Ami(e)' },
  { value: 'colleague', label: 'Collègue' },
  { value: 'other', label: 'Autre' },
];
