import {BookIcon} from '@sanity/icons/Book'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const resourceTypes = [
  {title: 'Document', value: 'document'},
  {title: 'Video', value: 'video'},
  {title: 'Presentation', value: 'presentation'},
  {title: 'Report', value: 'report'},
  {title: 'Website', value: 'website'},
  {title: 'Brain Story Toolkit', value: 'brainStoryToolkit'},
]

export default defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  icon: BookIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'classification', title: 'Classification'},
    {name: 'migration', title: 'Migration'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'resourceType',
      title: 'Type',
      type: 'string',
      group: 'content',
      options: {list: resourceTypes, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: 'English', value: 'en'},
          {title: 'French', value: 'fr'},
        ],
        layout: 'radio',
      },
      initialValue: 'en',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      description: 'Short description shown in resource listings',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'author',
      title: 'Author or presenter',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'authorCredentials',
      title: 'Author credentials',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'publishedDate',
      title: 'Published date',
      type: 'date',
      group: 'content',
    }),
    defineField({
      name: 'modifiedDate',
      title: 'Modified date',
      type: 'date',
      group: 'content',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),
    defineField({
      name: 'showInWhatsNew',
      title: "Show in What's New",
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'accessibleImage',
      group: 'media',
    }),
    defineField({
      name: 'file',
      title: 'File',
      description: 'PDF, PowerPoint, Keynote or ZIP download',
      type: 'file',
      group: 'media',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External link',
      type: 'url',
      group: 'media',
      hidden: ({document}) => document?.resourceType === 'video',
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'object',
      group: 'media',
      hidden: ({document}) => document?.resourceType !== 'video',
      fields: [
        defineField({
          name: 'vimeoId',
          title: 'Vimeo ID',
          type: 'string',
        }),
        defineField({
          name: 'downloadUrl',
          title: 'Download link',
          type: 'url',
        }),
        defineField({
          name: 'nextVideo',
          title: 'Next video',
          type: 'reference',
          to: [{type: 'resource'}],
          options: {filter: 'resourceType == "video"'},
        }),
      ],
    }),
    defineField({
      name: 'topics',
      title: 'Topics',
      type: 'array',
      group: 'classification',
      of: [defineArrayMember({type: 'reference', to: [{type: 'resourceTopic'}]})],
    }),
    defineField({
      name: 'audiences',
      title: 'Audiences',
      type: 'array',
      group: 'classification',
      of: [defineArrayMember({type: 'reference', to: [{type: 'resourceAudience'}]})],
    }),
    defineField({
      name: 'publisher',
      title: 'Publisher',
      type: 'reference',
      group: 'classification',
      to: [{type: 'resourcePublisher'}],
    }),
    defineField({
      name: 'relatedResources',
      title: 'Related resources',
      type: 'array',
      group: 'classification',
      of: [defineArrayMember({type: 'reference', to: [{type: 'resource'}]})],
    }),
    defineField({
      name: 'migration',
      title: 'Migration details',
      description: 'Where this came from on the old AFWI site. Kept for redirects and QA.',
      type: 'migrationInfo',
      group: 'migration',
      readOnly: true,
    }),
  ],
  preview: {
    select: {title: 'title', type: 'resourceType', language: 'language', media: 'image'},
    prepare: ({title, type, language, media}) => ({
      title,
      subtitle: [resourceTypes.find((t) => t.value === type)?.title, language === 'fr' && 'French']
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
})
