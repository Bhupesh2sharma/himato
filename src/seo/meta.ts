import { SEO_TOPICS, type SeoTopic } from '../data/seoTopics';

/**
 * Single source of truth for page-level SEO.
 *
 * Used in two places:
 *  - the browser (components/SEO.tsx) to update <head> on client-side navigation
 *  - the build (scripts/seoPlugin.ts) to prerender real HTML per route, so
 *    Google and AI crawlers that don't run JavaScript still see each page's
 *    title, canonical, structured data and text.
 *
 * Keep this file free of DOM / Node APIs — both environments import it.
 */

export const SITE_URL = 'https://www.himato.in';
export const SITE_NAME = 'Himato';
export const DEFAULT_IMAGE = '/gurudungmar.jpg';
export const DEFAULT_IMAGE_ALT = 'Gurudongmar Lake in North Sikkim, one of the highest lakes in the world';

// Bump when guide content in src/data/seoTopics.ts is reviewed/updated.
// Used as dateModified / sitemap lastmod for guides without their own date.
export const GUIDES_LAST_REVIEWED = '2026-04-26';
// Bump when the non-guide public pages change meaningfully.
export const PAGES_LAST_UPDATED = '2026-10-30';

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export type JsonLd = Record<string, unknown>;

export interface PageMeta {
  /** Canonical path, e.g. "/guide/kupup-lake-day-trip" */
  path: string;
  title: string;
  description: string;
  /** Root-relative ("/x.jpg") or absolute URL */
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  /** Keep out of search results (auth pages, private/ephemeral shares) */
  noindex?: boolean;
  jsonLd?: JsonLd[];
}

/** Guide shape shared by static topics and admin-published (DB) guides. */
export interface GuideInput {
  slug: string;
  title: string;
  shortDescription: string;
  description?: string;
  answer?: string;
  category: string;
  image: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export const absUrl = (pathOrUrl: string) =>
  /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

export const canonicalUrl = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);

export const topicToGuide = (t: SeoTopic): GuideInput => ({
  slug: t.id,
  title: t.title,
  shortDescription: t.shortDescription,
  description: t.description,
  answer: t.answer,
  category: t.category,
  image: t.image,
  content: t.content,
  updatedAt: t.updated,
});

export const STATIC_GUIDES: GuideInput[] = SEO_TOPICS.map(topicToGuide);

/** The short, direct answer shown at the top of a guide (and used in FAQ schema). */
export const guideAnswer = (g: GuideInput) => (g.answer || g.description || g.shortDescription).trim();

const stripMarkdown = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Q&A pairs from a guide's "## FAQ" section, written as a bold question line
 * ("**Question?**") followed by its answer. These are visible on the page, so
 * they can be marked up as FAQPage.
 */
export function guideFaq(content: string): { question: string; answer: string }[] {
  const lines = content.split('\n');
  const start = lines.findIndex((l) => /^##\s+(faq|frequently asked questions)\b/i.test(l.trim()));
  if (start === -1) return [];
  const out: { question: string; answer: string }[] = [];
  for (const raw of lines.slice(start + 1)) {
    const line = raw.trim();
    if (/^#{1,2}\s/.test(line)) break;
    const q = line.match(/^\*\*(.+\?)\*\*$/);
    if (q) out.push({ question: stripMarkdown(q[1]), answer: '' });
    else if (line && out.length) out[out.length - 1].answer += ` ${line}`;
  }
  return out.map((f) => ({ ...f, answer: stripMarkdown(f.answer) })).filter((f) => f.answer);
}

const breadcrumb = (items: { name: string; path: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: canonicalUrl(it.path),
  })),
});

const truncate = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);

export function guideMeta(g: GuideInput): PageMeta {
  const path = `/guide/${g.slug}`;
  const url = canonicalUrl(path);
  const answer = guideAnswer(g);
  const modified = (g.updatedAt || GUIDES_LAST_REVIEWED).slice(0, 10);

  const jsonLd: JsonLd[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: truncate(g.title, 110),
      description: answer,
      image: [absUrl(g.image)],
      ...(g.createdAt ? { datePublished: g.createdAt.slice(0, 10) } : {}),
      dateModified: modified,
      inLanguage: 'en-IN',
      articleSection: g.category,
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: url,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@type': 'State', name: 'Sikkim', containedInPlace: { '@type': 'Country', name: 'India' } },
    },
    breadcrumb([
      { name: 'Home', path: '/' },
      { name: 'Guides', path: '/guides' },
      { name: g.title, path },
    ]),
  ];

  // FAQ markup only for Q&A that is visible on the page: a question-style
  // title (answered by the "Quick answer" box) plus the guide's FAQ section.
  const faq = [
    ...(g.title.trim().endsWith('?') ? [{ question: g.title.trim(), answer }] : []),
    ...guideFaq(g.content),
  ];
  if (faq.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  }

  return {
    path,
    title: `${g.title} | ${SITE_NAME}`,
    description: g.answer
      ? truncate(answer, 160)
      : truncate(`${answer}${/[.!?]$/.test(answer) ? '' : '.'} ${g.shortDescription}`.trim(), 160),
    image: g.image,
    imageAlt: g.title,
    type: 'article',
    jsonLd,
  };
}

/** Related guides: same category first, then others, never the guide itself. */
export function relatedGuides(g: GuideInput, all: GuideInput[], limit = 4): GuideInput[] {
  const others = all.filter((x) => x.slug !== g.slug);
  return [...others.filter((x) => x.category === g.category), ...others.filter((x) => x.category !== g.category)].slice(0, limit);
}

/** Public pages that should be indexed and prerendered (guides are added separately). */
export const INDEXABLE_STATIC_PATHS = ['/', '/chat', '/guides', '/hidden-gems', '/reach_us', '/terms'] as const;

export function staticPageMeta(path: string, guides: GuideInput[] = STATIC_GUIDES): PageMeta | null {
  switch (path) {
    case '/':
      return {
        path: '/',
        title: 'Himato — Plan Your Sikkim Trip in 60 Seconds (Free AI Planner)',
        description:
          'Free day-by-day Sikkim itineraries with permit info, drive times and the hidden valleys blogs miss. Gangtok, Lachung, Yumthang, Gurudongmar, Pelling — your day-by-day plan in a minute.',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Himato Sikkim Trip Planner',
            url: `${SITE_URL}/chat`,
            applicationCategory: 'TravelApplication',
            operatingSystem: 'Web',
            description: 'AI travel planner that builds day-by-day Sikkim itineraries, including permits and drive times.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
            provider: { '@id': ORG_ID },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'TouristDestination',
            name: 'Sikkim',
            description:
              'Himalayan state in North-East India known for Kanchenjunga views, high-altitude lakes, Buddhist monasteries and restricted-area valleys that need permits.',
            containedInPlace: { '@type': 'Country', name: 'India' },
            includesAttraction: [
              { '@type': 'City', name: 'Gangtok', description: 'Capital of Sikkim, known for monasteries and mountain views' },
              { '@type': 'City', name: 'Pelling', description: 'West Sikkim town with views of Kanchenjunga and ancient monasteries' },
              { '@type': 'TouristAttraction', name: 'Gurudongmar Lake', description: 'One of the highest lakes in the world, in North Sikkim' },
              { '@type': 'TouristAttraction', name: 'Yumthang Valley', description: 'Valley of Flowers near Lachung with hot springs' },
              { '@type': 'TouristAttraction', name: 'Ravangla Buddha Park', description: 'Park with a giant Buddha statue in South Sikkim' },
            ],
          },
        ],
      };
    case '/chat':
      return {
        path: '/chat',
        title: 'AI Sikkim Trip Planner — Build Your Day-by-Day Itinerary | Himato',
        description:
          'Tell Himato how many days, who is coming and when. Get a day-by-day Sikkim itinerary with stays, drive times and the permits you need — free, in about a minute.',
        jsonLd: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Trip planner', path: '/chat' }])],
      };
    case '/guides':
      return {
        path: '/guides',
        title: 'Sikkim Travel Guides: Permits, Hidden Gems & Local Tips | Himato',
        description: `${guides.length} Sikkim travel guides — permits, North Sikkim, hidden valleys, family safety, food and workations. Read what you need, then plan your trip free.`,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Sikkim Travel Guides',
            description: 'Sikkim travel guides covering permits, hidden valleys, family safety and everyday logistics.',
            url: canonicalUrl('/guides'),
            isPartOf: { '@id': WEBSITE_ID },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: guides.length,
              itemListElement: guides.map((g, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: canonicalUrl(`/guide/${g.slug}`),
                name: g.title,
              })),
            },
          },
          breadcrumb([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }]),
        ],
      };
    case '/hidden-gems':
      return {
        path: '/hidden-gems',
        title: 'Hidden Gems of Sikkim: Offbeat Places Most Tourists Miss | Himato',
        description:
          'Offbeat Sikkim — Dzongu, Gnathang, Biksthang, Yangang, Okhrey and more quiet villages and valleys most itineraries skip, with how to reach them.',
        jsonLd: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Hidden gems', path: '/hidden-gems' }])],
      };
    case '/reach_us':
      return {
        path: '/reach_us',
        title: 'Contact Himato — Sikkim Trip Planning Help',
        description: 'Questions about your Sikkim trip or Himato? Call +91 9733814168 or email hello@himato.in.',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            url: canonicalUrl('/reach_us'),
            about: { '@id': ORG_ID },
          },
        ],
      };
    case '/terms':
      return {
        path: '/terms',
        title: 'Terms and Conditions | Himato',
        description: 'Terms and conditions for using Himato, the AI Sikkim trip planner by Waglogy.',
      };
    default:
      return null;
  }
}

/** Generic, non-indexable meta for app/private routes (login, shares, history…). */
export const privatePageMeta = (path: string): PageMeta => ({
  path,
  title: 'Himato — Sikkim Trip Planner',
  description: 'Plan your Sikkim trip with Himato.',
  noindex: true,
});

/**
 * Meta for a client-side route. Guide pages return null — GuidePage sets its
 * own meta once the guide (static or from the API) is loaded.
 */
export function routeMeta(pathname: string): PageMeta | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (path.startsWith('/guide/')) return null;
  return staticPageMeta(path) ?? privatePageMeta(path);
}
