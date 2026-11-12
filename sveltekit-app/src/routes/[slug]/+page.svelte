<script lang="ts">
  import {useQuery} from '@sanity/sveltekit'
  import type {PageQueryResult} from '$lib/sanity/sanity.types'
  import PageBuilder from '../../components/PageBuilder.svelte'
  import Seo from '../../components/Seo.svelte'
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()
  const query = $derived(useQuery<PageQueryResult>(data))
  const page = $derived($query.data)
</script>

{#if page}
  <Seo
    title={page.seo.title}
    description={page.seo.description}
    image={page.seo.image}
    noIndex={page.seo.noIndex}
  />
  <article class="page">
    <h1 class="page__title">{page.title}</h1>
    {#if page.content}
      <PageBuilder blocks={page.content} />
    {/if}
  </article>
{/if}

<style>
  .page {
    padding: 0 var(--space-3);
  }

  .page__title {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-7);
    line-height: var(--line-height-6);
    font-weight: 800;
    margin: var(--space-4) 0;
  }
</style>
