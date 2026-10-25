/** Build-time and future prerender metadata. Keep this module free of browser/asset imports. */
export const seo = {
  origin: 'https://portfolio-renan-fellipes-projects.vercel.app',
  title: 'Renan Fellipe',
  description: 'I am passionate about technology and gaming. I completed my technical high school in Electronics and am currently pursuing a degree in Computer Engineering, both at the Instituto Federal do Maranhão (IFMA - Federal Institute of Maranhão).',
  language: 'en',
  locale: 'en_US',
  robots: 'index, follow',
  twitterCard: 'summary_large_image',
  themeColor: '#1D0C3A',
  // TASK-18's verified content date; never replace this with the build date.
  lastModified: '2026-10-22',
} as const;

// These profile URLs were moved verbatim from the Contact entries in iconsData.ts.
// The menu and structured data both consume this same set; do not add unverified profiles.
export const socialProfiles = {
  github: 'https://github.com/Xounder',
  linkedin: 'https://www.linkedin.com/in/renan-fellipe/',
  youtube: 'https://www.youtube.com/@Xounder_Tech',
  instagram: 'https://www.instagram.com/renan.llipe/',
} as const;

export const siteUrl = (path: '/' | '/scroll' | '/og-image.webp' | '/sitemap.xml') =>
  `${seo.origin}${path}`;

export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteUrl('/')}#person`,
      name: seo.title,
      description: seo.description,
      url: siteUrl('/'),
      sameAs: Object.values(socialProfiles),
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl('/')}#website`,
      name: seo.title,
      description: seo.description,
      url: siteUrl('/'),
      inLanguage: seo.language,
      author: { '@id': `${siteUrl('/')}#person` },
    },
  ],
} as const;

/** Prevent data strings from closing the HTML script element or injecting markup. */
export const serializedStructuredData = () =>
  JSON.stringify(structuredData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

/** Shared crawlable resources for both Vite dev and the production build. */
export const robotsText = () =>
  `User-agent: *\nAllow: /\nSitemap: ${siteUrl('/sitemap.xml')}\n`;

export const sitemapXml = () =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl('/')}</loc>\n    <lastmod>${seo.lastModified}</lastmod>\n  </url>\n  <url>\n    <loc>${siteUrl('/scroll')}</loc>\n    <lastmod>${seo.lastModified}</lastmod>\n  </url>\n</urlset>\n`;
