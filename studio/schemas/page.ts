import {DocumentIcon} from '@sanity/icons/Document'
import {defineField, defineType} from 'sanity'

import {pageFields} from './shared/pageFields'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    ...pageFields,
    defineField({
      name: 'content',
      title: 'Content',
      type: 'pageBuilder',
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare: ({title, slug}) => ({title, subtitle: slug && `/${slug}`}),
  },
})
