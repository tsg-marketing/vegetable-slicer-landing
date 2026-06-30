const translitMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
};

export function slugify(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .split('')
    .map((ch) => (ch in translitMap ? translitMap[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function categorySlug(name: string, fallbackId?: string): string {
  const s = slugify(name);
  return s || slugify(fallbackId || '') || 'catalog';
}

export function productSlug(name: string, offerId: string): string {
  const base = slugify(name);
  const idPart = slugify(offerId);
  if (base && idPart) return `${base}-${idPart}`;
  return base || idPart || 'product';
}
