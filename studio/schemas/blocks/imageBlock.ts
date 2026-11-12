import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'accessibleImage',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'caption', media: 'image'},
    prepare: ({title, media}) => ({title, subtitle: 'Image', media}),
  },
})
