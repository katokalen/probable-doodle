import {CaseIcon} from '@sanity/icons/Case'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'resourcePublisher',
  title: 'Resource publisher',
  type: 'document',
  icon: CaseIcon,
  fields: [
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
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'migration',
      title: 'Migration details',
      type: 'migrationInfo',
      readOnly: true,
    }),
  ],
})
