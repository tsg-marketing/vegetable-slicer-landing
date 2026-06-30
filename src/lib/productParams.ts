import { type ProductParam } from '@/components/ProductCard';

const URL_RE = /(https?:\/\/[^\s"<>]+)/i;

export function isVideoParam(param: ProductParam): boolean {
  const name = (param.name || '').toLowerCase();
  return name.includes('видео') || name.includes('video');
}

export function extractUrl(value: string): string | null {
  if (!value) return null;
  const match = value.match(URL_RE);
  return match ? match[0] : null;
}

export function toRutubeEmbed(url: string): string {
  if (!url) return '';
  if (url.includes('/play/embed/')) return url;
  const m = url.match(/rutube\.ru\/(?:video|play\/embed)\/([0-9a-zA-Z]+)/);
  if (m) return `https://rutube.ru/play/embed/${m[1]}/`;
  return url;
}