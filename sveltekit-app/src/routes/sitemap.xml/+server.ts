import {siteUrl} from '$lib/sanity/api'
import {serverClient} from '$lib/sanity/client.server'
import {sitemapQuery} from '$lib/sanity/queries'
import type {SitemapQueryResult} from '$lib/sanity/sanity.types'
import type {RequestHandler} from './$types'

export const GET: RequestHandler = async () => {
  // The dataset is private, so this needs the token client. Stega would put invisible
  // characters into the URLs, and drafts must never be listed.
  const posts = await serverClient.fetch<SitemapQueryResult>(
    sitemapQuery,
    {},
    {stega: false, perspective: 'published'},
  )

  const urls = [
    `<url><loc>${siteUrl}/</loc></url>`,
    ...posts.map(
      (post) => `<url><loc>${siteUrl}${post.path}</loc><lastmod>${post._updatedAt}</lastmod></url>`,
    ),
  ]

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    {headers: {'Content-Type': 'application/xml'}},
  )
}
