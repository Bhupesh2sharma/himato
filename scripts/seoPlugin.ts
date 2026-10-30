import fs from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import type { Plugin, ResolvedConfig } from 'vite';
import {
  absUrl,
  canonicalUrl,
  DEFAULT_IMAGE,
  DEFAULT_IMAGE_ALT,
  GUIDES_LAST_REVIEWED,
  guideAnswer,
  guideMeta,
  INDEXABLE_STATIC_PATHS,
  PAGES_LAST_UPDATED,
  privatePageMeta,
  relatedGuides,
  SITE_URL,
  STATIC_GUIDES,
  staticPageMeta,
  type GuideInput,
  type PageMeta,
} from '../src/seo/meta';

/**
 * Build-time SEO for the traveller site (runs after `vite build`).
 *
 * The app is a client-rendered SPA, so without this every URL serves an empty
 * <div id="root"> with the homepage's <head>. This plugin writes, for every
 * public route, an HTML file with that page's own title / canonical / schema
 * and its real text inside #root. React's createRoot replaces that text on
 * load, so users see the normal app; crawlers that don't run JavaScript
 * (most AI crawlers) see the content.
 *
 * Output (in outDir):
 *   index.html, chat.html, guides.html, …       prerendered static pages
 *   guide/<slug>.html                           prerendered guides
 *   guide-shell.html                            fallback for guides published after the build
 *   app-shell.html                              noindex fallback for private/app routes
 *   sitemap.xml, robots.txt, llms.txt, llms-full.txt
 *
 * vercel.json serves *.html without the extension (cleanUrls) and rewrites
 * unknown routes to the shells.
 */

const SEO_START = '<!-- seo:start -->';
const SEO_END = '<!-- seo:end -->';
const ROOT_EMPTY = '<div id="root"></div>';

const CATEGORY_ORDER = ['Hidden Gem', 'Offbeat', 'Adventure', 'Spiritual', 'Family', 'Food', 'Logistics', 'Workation', 'Seasonal', 'History'];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// JSON inside <script> must not be able to close the tag.
const jsonForScript = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

const guidePath = (g: GuideInput) => `/guide/${g.slug}`;

function renderHead(meta: PageMeta, { canonical = true } = {}): string {
  const url = canonicalUrl(meta.path);
  const image = absUrl(meta.image || DEFAULT_IMAGE);
  const imageAlt = meta.imageAlt || DEFAULT_IMAGE_ALT;
  const robots = meta.noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    !meta.noindex && canonical ? `<link rel="canonical" href="${esc(url)}" />` : '',
    `<meta property="og:type" content="${meta.type || 'website'}" />`,
    canonical ? `<meta property="og:url" content="${esc(url)}" />` : '',
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(imageAlt)}" />`,
    ...(meta.jsonLd ?? []).map((d) => `<script type="application/ld+json" data-seo-jsonld>${jsonForScript(d)}</script>`),
  ];
  return tags.filter(Boolean).join('\n  ');
}

const markdownToHtml = (md: string) =>
  // The page already has an <h1> (the guide title), so demote markdown h1s.
  renderToStaticMarkup(createElement(Markdown, { components: { h1: 'h2' } }, md));

const STATIC_CSS = `
.seo-static{font-family:Inter,system-ui,sans-serif;background:#f6f1e7;color:#0e1116;line-height:1.65;min-height:100vh}
.seo-static a{color:#2f4a3a}
.seo-static header,.seo-static main,.seo-static footer{max-width:760px;margin:0 auto;padding:16px}
.seo-static header nav a{margin-right:16px;font-weight:600;text-decoration:none}
.seo-static h1{font-family:Poppins,sans-serif;font-size:2rem;line-height:1.2;margin:24px 0 12px}
.seo-static h2{font-family:Poppins,sans-serif;font-size:1.35rem;margin:28px 0 8px}
.seo-static .answer{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:12px;padding:16px;margin:16px 0}
.seo-static .cta{display:inline-block;background:#2f4a3a;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600}
.seo-static footer{font-size:.875rem;color:#555;border-top:1px solid rgba(0,0,0,.1);margin-top:40px}
`;

function layout(main: string): string {
  return `<div class="seo-static"><style>${STATIC_CSS}</style>
<header><nav aria-label="Main"><a href="/">Himato</a><a href="/chat">Plan a trip</a><a href="/guides">Sikkim guides</a><a href="/hidden-gems">Hidden gems</a><a href="/reach_us">Contact</a></nav></header>
<main>${main}</main>
<footer><p>Himato is a free AI trip planner for Sikkim, India, by Waglogy. Contact: hello@himato.in · +91 9733814168</p>
<p><a href="/chat">Plan a Sikkim trip</a> · <a href="/guides">Sikkim travel guides</a> · <a href="/hidden-gems">Hidden gems of Sikkim</a> · <a href="/terms">Terms</a></p></footer>
</div>`;
}

const guideLink = (g: GuideInput, withDesc = true) =>
  `<li><a href="${guidePath(g)}">${esc(g.title)}</a>${withDesc ? ` — ${esc(g.shortDescription)}` : ''}</li>`;

function byCategory(guides: GuideInput[]): [string, GuideInput[]][] {
  const map = new Map<string, GuideInput[]>();
  for (const g of guides) map.set(g.category, [...(map.get(g.category) ?? []), g]);
  const order = (c: string) => (CATEGORY_ORDER.indexOf(c) + 1 || 99);
  return [...map.entries()].sort((a, b) => order(a[0]) - order(b[0]));
}

function renderGuideBody(g: GuideInput, all: GuideInput[]): string {
  const related = relatedGuides(g, all);
  return layout(`
<nav aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/guides">Guides</a> › ${esc(g.category)}</nav>
<article>
<h1>${esc(g.title)}</h1>
<p>${esc(g.shortDescription)}</p>
<section class="answer" aria-label="Quick answer"><strong>Quick answer:</strong> ${esc(guideAnswer(g))}</section>
${markdownToHtml(g.content)}
<p><a class="cta" href="/chat">Turn this guide into a day-by-day Sikkim itinerary — free</a></p>
</article>
${related.length ? `<nav aria-label="Related guides"><h2>Related Sikkim guides</h2><ul>${related.map((r) => guideLink(r, false)).join('')}</ul><p><a href="/guides">Browse all Sikkim guides</a></p></nav>` : ''}`);
}

function renderStaticBody(p: string, guides: GuideInput[]): string {
  const meta = staticPageMeta(p, guides)!;
  const intro = `<p>${esc(meta.description)}</p>`;
  switch (p) {
    case '/':
      return layout(`
<h1>Plan your Sikkim trip in 60 seconds</h1>
${intro}
<p><a class="cta" href="/chat">Start planning free</a></p>
<h2>How Himato works</h2>
<ol>
<li><strong>Say what you want.</strong> How many days, who is coming, roughly when. One line is enough.</li>
<li><strong>Get a day-by-day plan.</strong> Stops with times, where you sleep each night, drive times, and the permits you need.</li>
<li><strong>Make it yours.</strong> Ask for changes in plain words, share a link with your group, or download the PDF.</li>
</ol>
<h2>Sikkim travel guides</h2>
${byCategory(guides)
  .map(([c, list]) => `<h3>${esc(c)}</h3><ul>${list.slice(0, 5).map((g) => guideLink(g, false)).join('')}</ul>`)
  .join('\n')}
<p><a href="/guides">All ${guides.length} Sikkim guides</a> · <a href="/hidden-gems">Hidden gems of Sikkim</a></p>`);
    case '/guides':
      return layout(`
<h1>Sikkim travel guides</h1>
${intro}
${byCategory(guides)
  .map(([c, list]) => `<h2>${esc(c)}</h2><ul>${list.map((g) => guideLink(g)).join('')}</ul>`)
  .join('\n')}
<p><a class="cta" href="/chat">Plan your Sikkim trip free</a></p>`);
    case '/hidden-gems': {
      const gems = guides.filter((g) => g.category === 'Hidden Gem' || g.category === 'Offbeat');
      return layout(`
<h1>Hidden gems of Sikkim</h1>
${intro}
<ul>${gems.map((g) => guideLink(g)).join('')}</ul>
<p><a class="cta" href="/chat">Add these to your Sikkim itinerary</a></p>`);
    }
    case '/chat':
      return layout(`
<h1>AI Sikkim trip planner</h1>
${intro}
<h2>Try asking</h2>
<ul>
<li>Plan 6 days in Sikkim in December for a family with kids</li>
<li>5-day North Sikkim trip with Gurudongmar and Yumthang</li>
<li>Gangtok, Pelling and Ravangla in 7 days for senior citizens</li>
</ul>
<p>Each plan includes where you stay each night, drive times between stops, and which permits you need (for example for Nathula, Tsomgo, North Sikkim and Dzongu).</p>
<p><a href="/guides">Read the Sikkim travel guides</a></p>`);
    case '/reach_us':
      return layout(`
<h1>Contact Himato</h1>
${intro}
<ul><li>Phone: +91 9733814168</li><li>Email: hello@himato.in</li><li>Website: www.himato.in</li><li>Company: Waglogy</li></ul>`);
    default:
      return layout(`<h1>${esc(meta.title.replace(/ \| Himato$/, ''))}</h1>${intro}`);
  }
}

// ── Guides from the backend (admin-published) ────────────────────────────────

type ApiGuide = GuideInput;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return (await res.json()) as T;
}

async function fetchApiGuides(apiBase: string): Promise<GuideInput[]> {
  const base = apiBase.replace(/\/+$/, '');
  const list = (await getJson<{ data: { guides: { slug: string }[] } }>(`${base}/api/guides`)).data.guides;
  const out: GuideInput[] = [];
  for (let i = 0; i < list.length; i += 6) {
    const batch = await Promise.all(
      list
        .slice(i, i + 6)
        .map(async ({ slug }) => (await getJson<{ data: { guide: ApiGuide } }>(`${base}/api/guides/${encodeURIComponent(slug)}`)).data.guide),
    );
    for (const g of batch) {
      out.push({
        slug: g.slug,
        title: g.title,
        shortDescription: g.shortDescription,
        description: g.description,
        category: g.category,
        image: g.image,
        content: g.content,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      });
    }
  }
  return out;
}

/** Static guides, with admin-published guides overriding / extending them (same as GuidePage). */
async function loadGuides(apiBase: string | undefined, log: (m: string) => void): Promise<GuideInput[]> {
  if (!apiBase || process.env.SEO_FETCH_GUIDES === 'false') return STATIC_GUIDES;
  try {
    const api = await fetchApiGuides(apiBase);
    const bySlug = new Map(STATIC_GUIDES.map((g) => [g.slug, g]));
    for (const g of api) bySlug.set(g.slug, g);
    log(`[seo] ${api.length} published guide(s) from API merged with ${STATIC_GUIDES.length} static`);
    return [...bySlug.values()];
  } catch (err) {
    log(`[seo] Could not load guides from API (${(err as Error).message}); using ${STATIC_GUIDES.length} static guides only`);
    return STATIC_GUIDES;
  }
}

// ── Crawler files ────────────────────────────────────────────────────────────

const guideDate = (g: GuideInput) => (g.updatedAt || GUIDES_LAST_REVIEWED).slice(0, 10);

function renderSitemap(guides: GuideInput[]): string {
  const latestGuide = guides.map(guideDate).sort().at(-1) ?? GUIDES_LAST_REVIEWED;
  const hubDate = [latestGuide, PAGES_LAST_UPDATED].sort().at(-1)!;
  const hubs = new Set(['/', '/guides', '/hidden-gems']);
  const url = (loc: string, lastmod: string, image?: string) =>
    `<url><loc>${esc(loc)}</loc><lastmod>${lastmod}</lastmod>${image ? `<image:image><image:loc>${esc(absUrl(image))}</image:loc></image:image>` : ''}</url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[
  ...INDEXABLE_STATIC_PATHS.map((p) => url(canonicalUrl(p), hubs.has(p) ? hubDate : PAGES_LAST_UPDATED, p === '/' ? DEFAULT_IMAGE : undefined)),
  ...guides.map((g) => url(canonicalUrl(guidePath(g)), guideDate(g), g.image)),
].join('\n')}
</urlset>
`;
}

const PRIVATE_DISALLOW = ['/login', '/register', '/history', '/dashboard', '/manage-himato'];

// AI search / assistant crawlers. Listed explicitly so it's unambiguous that
// they're welcome (some site templates block them by default). A crawler that
// matches a named group ignores the "*" group, so the disallows are repeated.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

function renderRobots(): string {
  const rules = ['Allow: /', ...PRIVATE_DISALLOW.map((p) => `Disallow: ${p}`)].join('\n');
  return `User-agent: *
${rules}

# AI search and assistant crawlers are welcome
${AI_CRAWLERS.map((b) => `User-agent: ${b}`).join('\n')}
${rules}

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// https://llmstxt.org — a plain-text map of the site for AI assistants.
function renderLlmsTxt(guides: GuideInput[]): string {
  return `# Himato

> Himato (${SITE_URL}) is a free AI trip planner for Sikkim, India. It builds day-by-day Sikkim itineraries — where to stay each night, drive times and the permits needed (e.g. for Nathula, Tsomgo Lake, North Sikkim, Dzongu) — and connects travellers with local Sikkim travel agents. Run by Waglogy. Contact: hello@himato.in, +91 9733814168.

## Plan a trip

- [AI Sikkim trip planner](${SITE_URL}/chat): Describe days, travellers and month; get a day-by-day Sikkim itinerary in about a minute. Free.
- [Sikkim travel guides](${SITE_URL}/guides): Index of all guides by category.
- [Hidden gems of Sikkim](${SITE_URL}/hidden-gems): Offbeat villages and valleys most itineraries skip.

${byCategory(guides)
  .map(([c, list]) => `## Guides: ${c}\n\n${list.map((g) => `- [${g.title}](${canonicalUrl(guidePath(g))}): ${guideAnswer(g)}`).join('\n')}`)
  .join('\n\n')}

## Optional

- [Full text of all guides](${SITE_URL}/llms-full.txt)
- [Contact](${SITE_URL}/reach_us)
- [Terms](${SITE_URL}/terms)
`;
}

function renderLlmsFull(guides: GuideInput[]): string {
  return `# Himato — Sikkim travel guides (full text)

> All Sikkim travel guides published on ${SITE_URL}. Plan a personalised itinerary at ${SITE_URL}/chat.

${guides
  .map(
    (g) => `---

# ${g.title}

URL: ${canonicalUrl(guidePath(g))}
Category: ${g.category}
Last reviewed: ${guideDate(g)}

Quick answer: ${guideAnswer(g)}

${g.content.trim().replace(/^# .*\n+/, '')}
`,
  )
  .join('\n')}`;
}

// ── Plugin ───────────────────────────────────────────────────────────────────

export function seoPrerender(options: { apiBaseUrl?: string } = {}): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'himato-seo-prerender',
    apply: 'build',
    configResolved(c) {
      config = c;
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);
      const log = (m: string) => config.logger.info(m);
      const template = await fs.readFile(path.join(outDir, 'index.html'), 'utf8');
      if (!template.includes(SEO_START) || !template.includes(SEO_END) || !template.includes(ROOT_EMPTY)) {
        throw new Error('[seo] index.html is missing the seo:start/seo:end markers or an empty #root');
      }

      const page = (head: string, body = '') => {
        const start = template.indexOf(SEO_START) + SEO_START.length;
        const end = template.indexOf(SEO_END);
        return (template.slice(0, start) + `\n  ${head}\n  ` + template.slice(end)).replace(
          ROOT_EMPTY,
          `<div id="root">${body}</div>`,
        );
      };
      const write = async (urlPath: string, html: string) => {
        const file = urlPath === '/' ? 'index.html' : `${urlPath.slice(1)}.html`;
        const full = path.join(outDir, file);
        await fs.mkdir(path.dirname(full), { recursive: true });
        await fs.writeFile(full, html);
      };

      const guides = await loadGuides(options.apiBaseUrl, log);

      for (const p of INDEXABLE_STATIC_PATHS) {
        await write(p, page(renderHead(staticPageMeta(p, guides)!), renderStaticBody(p, guides)));
      }
      for (const g of guides) {
        await write(guidePath(g), page(renderHead(guideMeta(g)), renderGuideBody(g, guides)));
      }

      // Fallbacks used by vercel.json rewrites. The guide shell stays indexable
      // (GuidePage sets the real canonical once loaded); everything else is noindex.
      await write(
        '/guide-shell',
        page(
          renderHead(
            { path: '/guides', title: 'Sikkim Travel Guide | Himato', description: 'Sikkim travel guide from Himato.' },
            { canonical: false },
          ),
        ),
      );
      await write('/app-shell', page(renderHead(privatePageMeta('/'), { canonical: false })));

      await fs.writeFile(path.join(outDir, 'sitemap.xml'), renderSitemap(guides));
      await fs.writeFile(path.join(outDir, 'robots.txt'), renderRobots());
      await fs.writeFile(path.join(outDir, 'llms.txt'), renderLlmsTxt(guides));
      await fs.writeFile(path.join(outDir, 'llms-full.txt'), renderLlmsFull(guides));

      log(`[seo] Prerendered ${INDEXABLE_STATIC_PATHS.length} pages + ${guides.length} guides; wrote sitemap.xml, robots.txt, llms.txt, llms-full.txt`);
    },
  };
}
