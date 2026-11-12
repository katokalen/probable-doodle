import {
  PUBLIC_SANITY_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_API_VERSION,
  PUBLIC_SANITY_STUDIO_URL,
  PUBLIC_SITE_URL,
} from '$env/static/public'

export function assertEnvVar<T>(value: T | undefined, name: string): T {
  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export const dataset = assertEnvVar(PUBLIC_SANITY_DATASET, 'PUBLIC_SANITY_DATASET')

export const projectId = assertEnvVar(PUBLIC_SANITY_PROJECT_ID, 'PUBLIC_SANITY_PROJECT_ID')

export const apiVersion = PUBLIC_SANITY_API_VERSION || '2025-10-22'

export const studioUrl = PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333'

// Public origin of the site, no trailing slash. Used for canonical URLs, Open Graph and the sitemap.
export const siteUrl = assertEnvVar(PUBLIC_SITE_URL, 'PUBLIC_SITE_URL')
