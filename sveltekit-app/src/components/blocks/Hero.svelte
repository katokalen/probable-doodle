<script lang="ts">
  import type {HeroBlock} from '$lib/sanity/blocks'
  import {urlFor} from '$lib/sanity/image'

  const {block}: {block: HeroBlock} = $props()
</script>

<section class="hero">
  {#if block.image}
    <img
      class="hero__image"
      src={urlFor(block.image).width(1500).height(760).url()}
      alt={block.image.alt ?? ''}
    />
  {/if}
  <h2 class="hero__heading">{block.heading}</h2>
  {#if block.tagline}
    <p class="hero__tagline">{block.tagline}</p>
  {/if}
</section>

<style>
  .hero {
    margin: var(--space-4) 0;
  }

  .hero__image {
    width: 100%;
    height: 380px;
    object-fit: cover;
  }

  .hero__heading {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-6);
    font-weight: 800;
    margin: var(--space-3) 0 var(--space-2);
  }

  .hero__tagline {
    font-family: var(--font-family-serif);
    font-size: var(--font-size-4);
    margin: 0;
  }
</style>
