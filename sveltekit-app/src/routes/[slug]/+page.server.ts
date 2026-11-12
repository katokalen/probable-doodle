import {error} from '@sveltejs/kit'
import {pageQuery as query} from '$lib/sanity/queries'
import type {PageQueryResult} from '$lib/sanity/sanity.types'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals, params}) => {
  const {loadQuery} = locals.sanity
  const {slug} = params
  const initial = await loadQuery<PageQueryResult>(query, {slug})

  if (!initial.data) {
    error(404, 'Page not found')
  }

  return {
    query,
    params: {slug},
    options: {initial},
  }
}
