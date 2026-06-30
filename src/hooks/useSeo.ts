import { useEffect } from 'react';

type SeoOptions = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, unknown> | null;
};

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  if (!url) return;
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

const JSONLD_ID = 'seo-jsonld';

export function useSeo({ title, description, image, url, type = 'website', jsonLd }: SeoOptions) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) setMeta('name', 'description', description);

    if (title) setMeta('property', 'og:title', title);
    if (description) setMeta('property', 'og:description', description);
    if (image) setMeta('property', 'og:image', image);
    if (url) setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);

    setMeta('name', 'twitter:card', 'summary_large_image');
    if (title) setMeta('name', 'twitter:title', title);
    if (description) setMeta('name', 'twitter:description', description);
    if (image) setMeta('name', 'twitter:image', image);

    if (url) setCanonical(url);

    const existing = document.getElementById(JSONLD_ID);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = JSONLD_ID;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const ld = document.getElementById(JSONLD_ID);
      if (ld) ld.remove();
    };
  }, [title, description, image, url, type, jsonLd]);
}

export default useSeo;
