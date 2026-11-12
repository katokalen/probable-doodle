<script lang="ts">
  import type {PageBlock} from '$lib/sanity/blocks'
  import Hero from './blocks/Hero.svelte'
  import ImageBlock from './blocks/ImageBlock.svelte'
  import TextBlock from './blocks/TextBlock.svelte'

  const {blocks}: {blocks: PageBlock[]} = $props()
</script>

<!-- Keyed on _key so Visual Editing overlays stay attached to the right block when reordering -->
{#each blocks as block (block._key)}
  {#if block._type === 'hero'}
    <Hero {block} />
  {:else if block._type === 'textBlock'}
    <TextBlock {block} />
  {:else if block._type === 'imageBlock'}
    <ImageBlock {block} />
  {/if}
{/each}
