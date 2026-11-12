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
  body,
  "seo": {
    "title": coalesce(seo.title, title),
    "description": coalesce(seo.description, excerpt),
    "image": coalesce(seo.image, mainImage),
    "noIndex": seo.noIndex == true
  }
}`)

export const sitemapQuery = defineQuery(`*[_type == "post" && defined(slug.current) && seo.noIndex != true]{
  "path": "/post/" + slug.current,
  _updatedAt
}`)

export const postsQuery =defineQuery(`*[_type == "post" && defined(slug.current)] | order(_createdAt desc){
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
