import {TagIcon} from '@sanity/icons/Tag'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'resourceTopic',
  title: 'Resource topic',
  type: 'document',
  icon: TagIcon,
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
      name: 'colour',
      title: 'Colour',
      description: 'Carried over from the old site, where each topic had a colour',
      type: 'string',
      options: {
        list: ['light-blue', 'turquoise', 'blue', 'red', 'grey', 'purple', 'yellow'],
      },
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
    }),
    defineField({
      name: 'migration',
      title: 'Migration details',
      type: 'migrationInfo',
      readOnly: true,
    }),
  ],
  orderings: [{title: 'Order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
})
