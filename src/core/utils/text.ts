/** Recorta un texto largo respetando palabras completas. */
export function excerpt(text: string, maxLength = 140): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** Normaliza para búsquedas: sin tildes, en minúsculas. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/** Búsqueda simple por coincidencia en varios campos. */
export function matchesSearch(query: string, ...fields: (string | undefined)[]): boolean {
  const needle = normalize(query.trim());
  if (!needle) return true;
  return fields.some((field) => field && normalize(field).includes(needle));
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
