import {defineDocuments, defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

export const resolve: PresentationPluginOptions['resolve'] = {
  // Lets Presentation open the right document for the URL being previewed
  mainDocuments: defineDocuments([
    {
      route: '/post/:slug',
      filter: `_type == "post" && slug.current == $slug`,
    },
    {
      route: '/:slug',
      filter: `_type == "page" && slug.current == $slug`,
    },
  ]),
  // Shows where a document appears on the site, with links into Presentation
  locations: {
    post: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          {title: doc?.title || 'Untitled', href: `/post/${doc?.slug}`},
          {title: 'Home', href: '/'},
        ],
      }),
    }),
    page: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [{title: doc?.title || 'Untitled', href: `/${doc?.slug}`}],
      }),
    }),
  },
}
