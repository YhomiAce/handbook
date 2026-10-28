import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import { editLinkBaseUrl, parseBuildEnv } from './src/lib/env';

const env = parseBuildEnv(process.env);
const editBase = editLinkBaseUrl(env);

// https://astro.build/config
export default defineConfig({
  ...(env.PUBLIC_SITE_URL ? { site: env.PUBLIC_SITE_URL } : {}),
  output: 'static',
  server: { port: 5111, host: true },
  // The handbook has no raster images to optimise, so skip sharp entirely.
  image: { service: passthroughImageService() },
  integrations: [
    starlight({
      title: 'Engineering Handbook',
      description:
        'How our engineering team works: onboarding, practices, operations, architecture and security.',
      lastUpdated: true,
      ...(editBase ? { editLink: { baseUrl: editBase } } : {}),
      social: env.PUBLIC_REPO_URL
        ? [{ icon: 'github', label: 'Source', href: env.PUBLIC_REPO_URL }]
        : [],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        { label: 'Onboarding', items: [{ autogenerate: { directory: 'onboarding' } }] },
        { label: 'Engineering practices', items: [{ autogenerate: { directory: 'practices' } }] },
        { label: 'Operations', items: [{ autogenerate: { directory: 'operations' } }] },
        {
          label: 'Architecture',
          items: [
            'architecture/system-overview',
            'architecture/adr-process',
            { label: 'Decision records', items: [{ autogenerate: { directory: 'architecture/adr' } }] },
          ],
        },
        { label: 'Security', items: [{ autogenerate: { directory: 'security' } }] },
      ],
    }),
  ],
});
