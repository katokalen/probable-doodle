import {defineField, defineType} from 'sanity'

// An image with editor-controlled cropping and alt text. Use this for any image shown in content.
export default defineType({
  name: 'accessibleImage',
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
    }),
  ],
})
