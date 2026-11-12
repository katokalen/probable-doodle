import {defineField} from 'sanity'

// Fields every routable document type shares. Spread into a type's `fields`.
export const pageFields = [
  defineField({
    name: 'title',
    title: 'Title',
    type: 'string',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    validation: (Rule) => Rule.required(),
    options: {
      source: 'title',
      maxLength: 96,
    },
  }),
  defineField({
    name: 'seo',
    title: 'SEO',
    type: 'seo',
  }),
]
