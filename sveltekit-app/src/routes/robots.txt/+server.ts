import {siteUrl} from '$lib/sanity/api'
import type {RequestHandler} from './$types'

// AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) are allowed like any other bot.
// To keep content out of AI training, add a `User-agent: <bot>` / `Disallow: /` group per bot.
export const GET: RequestHandler = () =>
  new Response(
    `User-agent: *
Disallow: /preview/

Sitemap: ${siteUrl}/sitemap.xml
`,
    {headers: {'Content-Type': 'text/plain'}},
  )
