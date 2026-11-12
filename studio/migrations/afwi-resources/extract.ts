/**
 * Step 1: snapshot the AFWI SilverStripe tables needed for Resources to extracted/snapshot.json.
 * Reads the throwaway MySQL container described in README.md. Run with:
 *   pnpm exec sanity exec migrations/afwi-resources/extract.ts
 */
import {mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'
import mysql from 'mysql2/promise'

import {extractedFile} from './config'

const db = await mysql.createConnection({
  host: '127.0.0.1',
  port: 3316,
  user: 'root',
  password: 'root',
  database: 'afwi',
  // The tables are latin1 but hold UTF-8 bytes; reading as utf8mb4 returns correct accented text
  charset: 'utf8mb4',
  // Keep DATE columns as 'YYYY-MM-DD' instead of timezone-shifted JS Dates
  dateStrings: true,
})

async function rows(sql: string) {
  const [result] = await db.query(sql)
  return result
}

const snapshot = {
  extractedAt: new Date().toISOString(),
  resources: await rows('SELECT * FROM Resource ORDER BY ID'),
  topics: await rows('SELECT * FROM ResourceTopic ORDER BY ID'),
  audiences: await rows('SELECT * FROM ResourceAudience ORDER BY ID'),
  publishers: await rows('SELECT * FROM ResourcePublisher ORDER BY ID'),
  // Join tables, in the order rows were added (SilverStripe's own order for these lists)
  resourceTopics: await rows('SELECT ResourceID, ResourceTopicID FROM ResourceTopic_Resources ORDER BY ID'),
  resourceAudiences: await rows(
    'SELECT ResourceID, ResourceAudienceID FROM ResourceAudience_Resources ORDER BY ID',
  ),
  relatedResources: await rows('SELECT ResourceID, ChildID FROM Resource_RelatedResources ORDER BY ID'),
  // Every file, so header images, attachments and [file_link] shortcodes can all be resolved
  files: await rows('SELECT ID, ClassName, FileFilename, FileHash, Title FROM File ORDER BY ID'),
  // Live pages, to turn [sitetree_link] shortcodes into URLs
  pages: await rows('SELECT ID, ParentID, URLSegment FROM SiteTree_Live ORDER BY ID'),
}

await db.end()

await mkdir(path.dirname(extractedFile), {recursive: true})
await writeFile(extractedFile, JSON.stringify(snapshot, null, 2))

console.log(`Wrote ${extractedFile}`)
for (const [name, value] of Object.entries(snapshot)) {
  if (Array.isArray(value)) console.log(`  ${name}: ${value.length}`)
}
