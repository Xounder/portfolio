import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { seo, siteUrl, serializedStructuredData, robotsText, sitemapXml } from './src/data/seo'

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// Vite's HTML is not a TS import: replace tokens at build AND dev time so the
// source metadata, canonical URLs and crawlable JSON-LD all come from seo.ts.
const metadata = (): Plugin => {
  const values: Record<string, string> = {
    LANGUAGE: seo.language,
    TITLE: seo.title,
    DESCRIPTION: seo.description,
    CANONICAL: siteUrl('/'),
    ROBOTS: seo.robots,
    IMAGE: siteUrl('/og-image.webp'),
    LOCALE: seo.locale,
    TWITTER_CARD: seo.twitterCard,
    THEME_COLOR: seo.themeColor,
  }
  return {
    name: 'seo-metadata',
    transformIndexHtml(html: string) {
      return html.replace(/__SEO_(JSONLD|[A-Z_]+)__/g, (_match, key: string) =>
        key === 'JSONLD' ? serializedStructuredData() : escapeHtml(values[key]))
    },
    configureServer(server) {
      // Public copies would shadow this middleware and drift when origin changes.
      server.middlewares.use((request, response, next) => {
        const path = (request as { url?: string }).url?.split('?')[0]
        if (path !== '/robots.txt' && path !== '/sitemap.xml') return next()
        response.setHeader('Content-Type', path === '/robots.txt' ? 'text/plain; charset=utf-8' : 'application/xml; charset=utf-8')
        response.end(path === '/robots.txt' ? robotsText() : sitemapXml())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsText() })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), metadata()],
})
