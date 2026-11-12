<script lang="ts">
  import {stegaClean} from '@sanity/sveltekit'
  import type {Image} from '@sanity/types'
  import {page} from '$app/state'
  import {siteUrl} from '$lib/sanity/api'
  import {urlFor} from '$lib/sanity/image'

  const siteName = 'SvelteKit + Sanity'

  type Props = {
    // Omit on the home page, where the site name is the whole title
    title?: string
    description?: string | null
    image?: Image | null
    noIndex?: boolean
    type?: 'website' | 'article'
  }

  const {title, description, image, noIndex = false, type = 'website'}: Props = $props()

  // In preview mode strings carry invisible stega markers for Visual Editing; they mustn't reach <head>
  const fullTitle = $derived(title ? `${stegaClean(title)} | ${siteName}` : siteName)
  const cleanDescription = $derived(stegaClean(description))
  const url = $derived(siteUrl + page.url.pathname)
  const imageUrl = $derived(image && urlFor(image).width(1200).height(630).url())
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <link rel="canonical" href={url} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:url" content={url} />
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={siteName} />
  {#if cleanDescription}
    <meta name="description" content={cleanDescription} />
    <meta property="og:description" content={cleanDescription} />
  {/if}
  {#if imageUrl}
    <meta property="og:image" content={imageUrl} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
  {/if}
  {#if noIndex}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>
