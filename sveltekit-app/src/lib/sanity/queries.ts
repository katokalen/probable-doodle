import {defineQuery} from '@sanity/sveltekit'

export const postQuery = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  publishedAt,
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

export const pageQuery = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  content[]{
    _key,
    _type,
    _type == "hero" => {heading, tagline, image},
    _type == "textBlock" => {body},
    _type == "imageBlock" => {image, caption}
  },
  "seo": {
    "title": coalesce(seo.title, title),
    "description": seo.description,
    "image": seo.image,
    "noIndex": seo.noIndex == true
  }
}`)

export const sitemapQuery = defineQuery(`*[_type in ["post", "page"] && defined(slug.current) && seo.noIndex != true]{
  "path": select(_type == "post" => "/post/", "/") + slug.current,
  _updatedAt
}`)

export const postsQuery =defineQuery(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  publishedAt,
  slug,
  excerpt,
  mainImage
}`)
