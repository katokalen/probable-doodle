<script lang="ts">
  import type {ImageBlock} from '$lib/sanity/blocks'
  import {urlFor} from '$lib/sanity/image'

  const {block}: {block: ImageBlock} = $props()
</script>

<figure class="image">
  <img src={urlFor(block.image).width(1500).url()} alt={block.image.alt ?? ''} />
  {#if block.caption}
    <figcaption class="image__caption">{block.caption}</figcaption>
  {/if}
</figure>

<style>
  .image {
    margin: var(--space-4) 0;
  }

  .image img {
    width: 100%;
    height: auto;
  }

  .image__caption {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-1);
    margin-top: var(--space-2);
  }
</style>
