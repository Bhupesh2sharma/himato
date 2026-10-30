import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { seoPrerender } from './scripts/seoPlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      // Prerendered HTML per public route + sitemap.xml, robots.txt, llms.txt.
      // Pulls admin-published guides from the API when reachable
      // (set SEO_FETCH_GUIDES=false to skip).
      seoPrerender({ apiBaseUrl: env.VITE_API_BASE_URL }),
    ],
  }
})
