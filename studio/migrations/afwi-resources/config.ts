import path from 'node:path'

const here = path.dirname(new URL(import.meta.url).pathname)

// The old site's public assets folder (SilverStripe's public/assets)
export const assetsDir = '/Users/kalenmcconnell/Sites/palix-albertafamilywellness.org/src/public/assets'

// Old site origin, for legacy URLs, shortcode links and missing-file references
export const legacyOrigin = 'https://www.albertafamilywellness.org'

export const extractedFile = path.join(here, 'extracted/snapshot.json')
export const ndjsonFile = path.join(here, 'transformed/resources.ndjson')
export const reportFile = path.join(here, 'reports/report.md')
