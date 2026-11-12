import {at, defineMigration, setIfMissing} from 'sanity/migrate'

// Posts created before `publishedAt` existed get their creation date, which is what the site showed until now
export default defineMigration({
  title: 'Backfill post publishedAt from _createdAt',
  documentTypes: ['post'],
  filter: '!defined(publishedAt)',
  migrate: {
    document(doc) {
      return at('publishedAt', setIfMissing(doc._createdAt))
    },
  },
})
