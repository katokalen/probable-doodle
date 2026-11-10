/**
 * Sanity CLI Configuration
 * This file configures the Sanity CLI tool with project-specific settings
 * and customizes the Vite bundler configuration.
 * Learn more: https://www.sanity.io/docs/cli
 */

import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '<your project ID>'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost: process.env.SANITY_STUDIO_STUDIO_HOST || '', // Visit https://www.sanity.io/docs/environment-variables to leanr more about using environment variables for local & production.
  deployment: {autoUpdates: true},
  // Both run on `sanity dev` and `sanity build`. Types land in the SvelteKit app, which owns the queries.
  schemaExtraction: {enabled: true, enforceRequiredFields: true},
  typegen: {
    enabled: true,
    path: '../sveltekit-app/src/**/*.{ts,svelte}',
    schema: 'schema.json',
    generates: '../sveltekit-app/src/lib/sanity/sanity.types.ts',
    // The app types loadQuery/useQuery directly and doesn't depend on @sanity/client,
    // so the generated `declare module '@sanity/client'` wouldn't resolve
    overloadClientMethods: false,
  },
})
