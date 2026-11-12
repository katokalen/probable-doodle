import {TextIcon} from '@sanity/icons/Text'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'textBlock',
  title: 'Text',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
  ],
  preview: {
    select: {body: 'body'},
    prepare: ({body}) => ({
      // First paragraph's text, so blocks are tellable apart in the list
      title: body?.[0]?.children?.map((child: {text?: string}) => child.text).join(''),
      subtitle: 'Text',
    }),
  },
})
