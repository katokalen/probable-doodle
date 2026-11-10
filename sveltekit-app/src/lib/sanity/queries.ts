import {defineQuery} from '@sanity/sveltekit'

export const postQuery = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  excerpt,
  mainImage,
  body
}`)

export const postsQuery = defineQuery(`*[_type == "post" && defined(slug.current)] | order(_createdAt desc){
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  slug,
  excerpt,
  mainImage
}`)
