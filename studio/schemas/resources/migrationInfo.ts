import {defineField, defineType} from 'sanity'

// Source-system details for documents imported from the old AFWI SilverStripe site
export default defineType({
  name: 'migrationInfo',
  title: 'Migration details',
  type: 'object',
  fields: [
    defineField({name: 'sourceId', title: 'Source ID', type: 'number'}),
    defineField({name: 'legacyUrl', title: 'Old URL', type: 'url'}),
    defineField({name: 'viewCount', title: 'View count on old site', type: 'number'}),
    defineField({
      name: 'legacyIsPublished',
      title: 'Old "IsPublished" flag',
      description: 'Not used by the old site; every resource was public',
      type: 'boolean',
    }),
    defineField({
      name: 'vimeoThumbnailUrl',
      title: 'Vimeo thumbnail URL',
      type: 'url',
    }),
    defineField({
      name: 'missingFiles',
      title: 'Files not found during migration',
      description: 'Old URLs of files that were missing from the assets copy',
      type: 'array',
      of: [{type: 'url'}],
    }),
  ],
})
