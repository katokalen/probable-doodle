/**
 * Step 2: turn extracted/snapshot.json into transformed/resources.ndjson for `sanity datasets import`,
 * and write reports/report.md. Reads only the snapshot and the local assets folder. Run with:
 *   pnpm exec sanity exec migrations/afwi-resources/transform.ts
 */
import {existsSync, readdirSync} from 'node:fs'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {htmlToBlocks} from '@portabletext/block-tools'
import {Schema} from '@sanity/schema'
import {JSDOM} from 'jsdom'

import blockContent from '../../schemas/blockContent'
import {assetsDir, extractedFile, legacyOrigin, ndjsonFile, reportFile} from './config'

type Row = Record<string, any>

const snapshot = JSON.parse(await readFile(extractedFile, 'utf8'))
const blockContentType = Schema.compile({name: 'migration', types: [blockContent]}).get('blockContent')

// Everything worth a human look ends up in the report, grouped by heading
const issues: Record<string, string[]> = {}
function note(heading: string, line: string) {
  ;(issues[heading] ??= []).push(line)
}

// IDs are derived from SilverStripe IDs so every rerun replaces the same documents
const ids = {
  resource: (id: number) => `resource-${id}`,
  topic: (id: number) => `resourceTopic-${id}`,
  audience: (id: number) => `resourceAudience-${id}`,
  publisher: (id: number) => `resourcePublisher-${id}`,
}

const reference = (ref: string) => ({_type: 'reference', _ref: ref, _key: ref})

// --- Lookups ---------------------------------------------------------------

const filesById = new Map<number, Row>(snapshot.files.map((f: Row) => [f.ID, f]))
const pagesById = new Map<number, Row>(snapshot.pages.map((p: Row) => [p.ID, p]))
const resourcesById = new Map<number, Row>(snapshot.resources.map((r: Row) => [r.ID, r]))
const topicIds = new Set(snapshot.topics.map((t: Row) => t.ID))
const audienceIds = new Set(snapshot.audiences.map((a: Row) => a.ID))
const publisherIds = new Set(snapshot.publishers.map((p: Row) => p.ID))

function pageUrl(id: number): string | undefined {
  const segments: string[] = []
  for (let page = pagesById.get(id); page; page = pagesById.get(page.ParentID)) {
    segments.unshift(page.URLSegment)
  }
  if (!segments.length) return undefined
  return segments.join('/') === 'home' ? `${legacyOrigin}/` : `${legacyOrigin}/${segments.join('/')}/`
}

const fileUrl = (file: Row) => `${legacyOrigin}/assets/${file.FileFilename}`

// SilverStripe 4/5 has stored files in several layouts over the years; check each
function localFilePath(file: Row): string | undefined {
  const dir = path.dirname(file.FileFilename)
  const name = path.basename(file.FileFilename)
  const hash = String(file.FileHash).slice(0, 10)
  const candidates = [
    path.join(assetsDir, file.FileFilename),
    path.join(assetsDir, dir, hash, name),
    path.join(assetsDir, '.protected', dir, hash, name),
  ]
  const found = candidates.find((candidate) => existsSync(candidate))
  if (found) return found

  // Legacy versioned layout: <dir>/_versions/<file ID>/<name>.<version>.<ext>; take the newest
  const versionsDir = path.join(assetsDir, dir, '_versions', String(file.ID))
  if (!existsSync(versionsDir)) return undefined
  const ext = path.extname(name)
  const stem = name.slice(0, -ext.length)
  const versions = readdirSync(versionsDir)
    .filter((entry) => entry.startsWith(`${stem}.`) && entry.endsWith(ext))
    .map((entry) => ({entry, version: entry.slice(stem.length + 1, -ext.length)}))
    .filter((v) => /^\d+$/.test(v.version))
    .sort((a, b) => Number(b.version) - Number(a.version))
  return versions[0] && path.join(versionsDir, versions[0].entry)
}

// --- Rich text ---------------------------------------------------------------

function toPortableText(html: string | null, context: string) {
  if (!html?.trim()) return undefined

  const withLinks = html
    .replace(/\[sitetree_link,id=(\d+)\]/g, (match, id) => {
      const url = pageUrl(Number(id))
      note('Links to old site pages (from [sitetree_link] shortcodes)', `${context}: ${url ?? `page ${id} not found`}`)
      return url ?? match
    })
    .replace(/\[file_link,id=(\d+)\]/g, (match, id) => {
      const file = filesById.get(Number(id))
      note('Links to old site files (from [file_link] shortcodes)', `${context}: ${file ? fileUrl(file) : `file ${id} not found`}`)
      return file ? fileUrl(file) : match
    })
    // Relative links, with or without a leading slash, were relative to the old site's root
    .replace(/href="\/?(?!\/|https?:|mailto:|tel:|#)/g, `href="${legacyOrigin}/`)

  let key = 0
  const blocks = htmlToBlocks(withLinks, blockContentType, {
    parseHtml: (input) => new JSDOM(input).window.document,
    // Stable keys keep reruns from rewriting every block
    keyGenerator: () => `k${key++}`,
  })

  // The old editor left a lot of <p>&nbsp;</p> spacer paragraphs
  const meaningful = blocks.filter(
    (block: Row) =>
      block._type !== 'block' ||
      block.children?.some((child: Row) => child.text?.replace(/\u00a0/g, ' ').trim()),
  )

  for (const block of meaningful as Row[]) {
    for (const markDef of block.markDefs ?? []) {
      if (markDef.href?.startsWith(legacyOrigin)) {
        note('Rich text links that still point at the old site (re-point at cutover)', `${context}: ${markDef.href}`)
      }
    }
  }

  return meaningful.length ? meaningful : undefined
}

// --- Assets ------------------------------------------------------------------

function asset(fileId: number, kind: 'image' | 'file', context: string, missing: string[]) {
  if (!fileId) return undefined
  const file = filesById.get(fileId)
  if (!file) {
    note('File records that no longer exist', `${context}: ${kind} file ID ${fileId}`)
    return undefined
  }
  const localPath = localFilePath(file)
  if (!localPath) {
    note('Files missing from the assets folder (not imported)', `${context}: ${fileUrl(file)}`)
    missing.push(fileUrl(file))
    return undefined
  }
  const directive = `${kind}@file://${localPath}`
  return kind === 'image'
    ? {_type: 'accessibleImage', _sanityAsset: directive}
    : {_type: 'file', _sanityAsset: directive}
}

// --- Documents ---------------------------------------------------------------

const slug = (value: string) => ({_type: 'slug', current: value})
const isHttpUrl = (value: string | null) => !!value && /^https?:\/\//.test(value.trim())

// Drop empty strings and undefined so documents only carry real values
function clean<T extends Row>(doc: T): T {
  return Object.fromEntries(
    Object.entries(doc).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as T
}

const publishers = snapshot.publishers.map((p: Row) =>
  clean({
    _id: ids.publisher(p.ID),
    _type: 'resourcePublisher',
    title: p.Title,
    slug: slug(p.URLSegment),
    summary: p.BriefDescription,
    description: p.Description,
    migration: {sourceId: p.ID},
  }),
)

const topics = snapshot.topics.map((t: Row) =>
  clean({
    _id: ids.topic(t.ID),
    _type: 'resourceTopic',
    title: t.Title,
    slug: slug(t.URLSegment),
    // The SilverStripe enum was declared with spaces after the commas
    colour: t.Colour?.trim(),
    order: t.Sort,
    migration: {sourceId: t.ID},
  }),
)

const audiences = snapshot.audiences.map((a: Row) =>
  clean({
    _id: ids.audience(a.ID),
    _type: 'resourceAudience',
    title: a.Title,
    slug: slug(a.URLSegment),
    summary: a.BriefDescription,
    description: a.Description,
    order: a.SortOrder,
    migration: {sourceId: a.ID},
  }),
)

// Join tables carry rows for deleted resources/topics and some duplicates; keep valid, unique pairs in order
function joined(rows: Row[], fromKey: string, toKey: string, validTargets: Set<unknown>, label: string) {
  const byResource = new Map<number, number[]>()
  let dropped = 0
  let duplicates = 0
  for (const row of rows) {
    if (!resourcesById.has(row[fromKey]) || !validTargets.has(row[toKey])) {
      dropped++
      continue
    }
    const list = byResource.get(row[fromKey]) ?? []
    if (list.includes(row[toKey])) {
      duplicates++
      continue
    }
    list.push(row[toKey])
    byResource.set(row[fromKey], list)
  }
  note('Cleaned-up relationship rows', `${label}: ${dropped} pointed at deleted records, ${duplicates} duplicates`)
  return byResource
}

const resourceTopics = joined(snapshot.resourceTopics, 'ResourceID', 'ResourceTopicID', topicIds, 'Resource topics')
const resourceAudiences = joined(snapshot.resourceAudiences, 'ResourceID', 'ResourceAudienceID', audienceIds, 'Resource audiences')
const relatedResources = joined(snapshot.relatedResources, 'ResourceID', 'ChildID', new Set(resourcesById.keys()), 'Related resources')

// Mirrors Resource::Link() on the old site; websites had no page of their own
const legacyPath: Record<string, string> = {
  Document: 'doc',
  Reports: 'reports',
  BrainStoryToolKit: 'brainstorytoolkit',
  Presentation: 'presentation',
  Video: 'video',
}

const resourceType: Record<string, string> = {
  Document: 'document',
  Video: 'video',
  Presentation: 'presentation',
  Reports: 'report',
  Website: 'website',
  BrainStoryToolKit: 'brainStoryToolkit',
}

// Some external links are bare page slugs on the old site (e.g. "advercity-las")
const pagesBySegment = new Map<string, Row>(snapshot.pages.map((p: Row) => [p.URLSegment, p]))

function externalUrl(link: string | null, context: string) {
  if (!link?.trim()) return undefined
  if (isHttpUrl(link)) return link.trim()
  const page = pagesBySegment.get(link.trim())
  if (page) {
    const url = pageUrl(page.ID)
    note('External links that were old site page slugs (now absolute links)', `${context}: ${link} → ${url}`)
    return url
  }
  note('External links that are not URLs (not imported)', `${context}: ${link}`)
  return undefined
}

const resources = snapshot.resources.map((r: Row) => {
  const context = `"${r.Title}" (ID ${r.ID})`
  const missingFiles: string[] = []
  const isVideo = r.Type === 'Video'
  if (r.PublisherID && !publisherIds.has(r.PublisherID)) {
    note('References to deleted records (dropped)', `${context}: publisher ${r.PublisherID}`)
  }
  if (r.NextVideoResourceID && !resourcesById.has(r.NextVideoResourceID)) {
    note('References to deleted records (dropped)', `${context}: next video ${r.NextVideoResourceID}`)
  }

  const video = isVideo
    ? clean({
        vimeoId: r.ExternalLink?.trim(),
        downloadUrl: isHttpUrl(r.VideoDownloadLink) ? r.VideoDownloadLink.trim() : undefined,
        nextVideo: resourcesById.has(r.NextVideoResourceID)
          ? {_type: 'reference', _ref: ids.resource(r.NextVideoResourceID)}
          : undefined,
      })
    : undefined

  return clean({
    _id: ids.resource(r.ID),
    _type: 'resource',
    title: r.Title,
    slug: slug(r.URLSegment),
    resourceType: resourceType[r.Type],
    language: r.IsFrench ? 'fr' : 'en',
    summary: toPortableText(r.BriefDescription, context),
    description: toPortableText(r.Description, context),
    author: r.Author?.trim(),
    authorCredentials: r.AuthorCredentials?.trim(),
    publishedDate: r.DatePublished,
    modifiedDate: r.DateModified,
    featured: Boolean(r.IsPromoted),
    showInWhatsNew: Boolean(r.OnWhatsNew),
    image: asset(r.HeaderImageID, 'image', context, missingFiles),
    file: asset(r.ResourceFileID, 'file', context, missingFiles),
    externalUrl: isVideo ? undefined : externalUrl(r.ExternalLink, context),
    video: video && Object.keys(video).length ? video : undefined,
    topics: resourceTopics.get(r.ID)?.map((id) => reference(ids.topic(id))),
    audiences: resourceAudiences.get(r.ID)?.map((id) => reference(ids.audience(id))),
    publisher: publisherIds.has(r.PublisherID) ? {_type: 'reference', _ref: ids.publisher(r.PublisherID)} : undefined,
    relatedResources: relatedResources.get(r.ID)?.map((id) => reference(ids.resource(id))),
    migration: clean({
      sourceId: r.ID,
      legacyUrl: legacyPath[r.Type] && `${legacyOrigin}/resources/${legacyPath[r.Type]}/${r.URLSegment}`,
      viewCount: r.Viewed,
      legacyIsPublished: Boolean(r.IsPublished),
      vimeoThumbnailUrl: isHttpUrl(r.ExternalImage) ? r.ExternalImage.trim() : undefined,
      missingFiles: missingFiles.length ? missingFiles : undefined,
    }),
  })
})

// --- Checks ------------------------------------------------------------------

const documents = [...publishers, ...topics, ...audiences, ...resources]
const documentIds = new Set(documents.map((doc) => doc._id))

// Schema validation only runs in the Studio, so check what matters before importing
for (const doc of documents) {
  for (const field of ['title', 'slug']) {
    if (!doc[field]) note('Missing required fields', `${doc._id}: ${field}`)
  }
}
const slugs = new Map<string, string>()
for (const doc of resources) {
  const existing = slugs.get(doc.slug.current)
  if (existing) note('Duplicate resource slugs', `${doc.slug.current}: ${existing} and ${doc._id}`)
  slugs.set(doc.slug.current, doc._id)
}
for (const ref of JSON.stringify(documents).matchAll(/"_ref":"([^"]+)"/g)) {
  if (!documentIds.has(ref[1])) note('References to documents not in this import', ref[1])
}
for (const doc of resources.filter((r: Row) => !r.image)) {
  note('Resources without an image', `"${doc.title}" (${doc._id})`)
}

// --- Output ------------------------------------------------------------------

await mkdir(path.dirname(ndjsonFile), {recursive: true})
await writeFile(ndjsonFile, documents.map((doc) => JSON.stringify(doc)).join('\n') + '\n')

const count = (type: string) => documents.filter((doc) => doc._type === type).length
const withAsset = (field: string) => resources.filter((r: Row) => r[field]).length
const report = [
  '# AFWI resources migration report',
  '',
  `Snapshot taken ${snapshot.extractedAt}; transformed ${new Date().toISOString()}.`,
  '',
  '## Counts',
  '',
  '| Type | Source rows | Documents |',
  '|---|---|---|',
  `| resource | ${snapshot.resources.length} | ${count('resource')} |`,
  `| resourceTopic | ${snapshot.topics.length} | ${count('resourceTopic')} |`,
  `| resourceAudience | ${snapshot.audiences.length} | ${count('resourceAudience')} |`,
  `| resourcePublisher | ${snapshot.publishers.length} | ${count('resourcePublisher')} |`,
  '',
  `Images imported: ${withAsset('image')} of ${snapshot.resources.filter((r: Row) => r.HeaderImageID).length}. ` +
    `Files imported: ${withAsset('file')} of ${snapshot.resources.filter((r: Row) => r.ResourceFileID).length}.`,
  '',
  ...Object.entries(issues).flatMap(([heading, lines]) => [
    `## ${heading} (${lines.length})`,
    '',
    ...lines.map((line) => `- ${line}`),
    '',
  ]),
].join('\n')

await mkdir(path.dirname(reportFile), {recursive: true})
await writeFile(reportFile, report)

console.log(`Wrote ${documents.length} documents to ${ndjsonFile}`)
console.log(`Wrote ${reportFile}`)
