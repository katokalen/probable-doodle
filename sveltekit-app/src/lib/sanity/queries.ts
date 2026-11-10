import {defineQuery} from '@sanity/sveltekit'

export const postQuery = defineQuery(`*[_type == "post" && slug.current == $slug][0]`)

export const postsQuery = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(_createdAt desc)`,
)
