import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { absUrl, canonicalUrl, DEFAULT_IMAGE, DEFAULT_IMAGE_ALT, routeMeta, type PageMeta } from '../seo/meta';

// Prerendered HTML (scripts/seoPlugin.ts) marks its page-level JSON-LD with
// this attribute, so client-side navigation replaces it instead of piling up.
const JSONLD_ATTR = 'data-seo-jsonld';

const setMeta = (key: string, content: string, attr: 'name' | 'property' = 'name') => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

function applyMeta(meta: PageMeta) {
  const url = canonicalUrl(meta.path);
  const image = absUrl(meta.image || DEFAULT_IMAGE);

  document.title = meta.title;
  setMeta('description', meta.description);
  setMeta(
    'robots',
    meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  );

  setMeta('og:title', meta.title, 'property');
  setMeta('og:description', meta.description, 'property');
  setMeta('og:url', url, 'property');
  setMeta('og:type', meta.type || 'website', 'property');
  setMeta('og:image', image, 'property');
  setMeta('og:image:alt', meta.imageAlt || DEFAULT_IMAGE_ALT, 'property');
  setMeta('twitter:title', meta.title);
  setMeta('twitter:description', meta.description);
  setMeta('twitter:image', image);
  setMeta('twitter:image:alt', meta.imageAlt || DEFAULT_IMAGE_ALT);

  // Private pages get no canonical — pointing them anywhere else is wrong.
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (meta.noindex) {
    existing?.remove();
  } else {
    const canonical = existing ?? document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'canonical' }));
    canonical.href = url;
  }

  document.head.querySelectorAll(`script[${JSONLD_ATTR}]`).forEach((el) => el.remove());
  for (const data of meta.jsonLd ?? []) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(JSONLD_ATTR, '');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
}

/** Sets <head> for an explicit page (e.g. a guide once it has loaded). */
export const SEO = ({ meta }: { meta: PageMeta }) => {
  const key = JSON.stringify(meta);
  useEffect(() => {
    applyMeta(JSON.parse(key));
  }, [key]);
  return null;
};

/** Sets <head> from the current route. Guide routes are left to GuidePage. */
export const RouteSEO = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = routeMeta(pathname);
    if (meta) applyMeta(meta);
  }, [pathname]);
  return null;
};
