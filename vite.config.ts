import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { SEO_TOPICS } from './src/data/seoTopics'

const HOSTNAME = 'https://www.himato.in'

// All public, indexable routes. Auth pages, /admin/*, /share/:id, /:slug,
// /history, /dashboard, /itinerary/:id are NOT included on purpose — they
// are auth-walled, ephemeral, or duplicate content.
const STATIC_ROUTES = [
  '/',
  '/chat',
  '/guides',
  '/hidden-gems',
  '/reach_us',
  '/terms',
]

const GUIDE_ROUTES = SEO_TOPICS.map((t) => `/guide/${t.id}`)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: HOSTNAME,
      dynamicRoutes: [...STATIC_ROUTES, ...GUIDE_ROUTES],
      // robots.txt is generated alongside; tell Google + others where the
      // sitemap lives so new guides get crawled within days, not weeks.
      generateRobotsTxt: true,
      robots: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/login', '/register', '/dashboard', '/history'],
        },
      ],
    }),
  ],
})
