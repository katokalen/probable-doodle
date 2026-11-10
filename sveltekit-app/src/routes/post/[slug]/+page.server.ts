import {postQuery as query} from '$lib/sanity/queries'
import type {PostQueryResult} from '$lib/sanity/sanity.types'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals, params}) => {
  const {loadQuery} = locals.sanity
  const {slug} = params
  const initial = await loadQuery<PostQueryResult>(query, {slug})

  // We pass the data in a format that is easy for `useQuery` to consume in the
  // corresponding `+page.svelte` file, but you can return the data in any
  // format you like.
  return {
    query,
    params: {slug},
    options: {initial},
  }
}
