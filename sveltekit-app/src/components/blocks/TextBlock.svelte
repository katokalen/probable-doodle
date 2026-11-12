<script lang="ts">
  import {PortableText} from '@portabletext/svelte'
  import type {TextBlock} from '$lib/sanity/blocks'

  const {block}: {block: TextBlock} = $props()
</script>

{#if block.body}
  <div class="text">
    <PortableText components={{}} value={block.body} />
  </div>
{/if}

<style>
  .text {
    font-family: var(--font-family-serif);
    font-size: var(--font-size-4);
    line-height: var(--line-height-5);
    margin: var(--space-4) 0;
  }

  .text :global(a) {
    color: var(--blue-600);
    text-decoration: none;
  }
</style>
