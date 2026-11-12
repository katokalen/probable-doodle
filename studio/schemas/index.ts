import accessibleImage from './accessibleImage'
import blockContent from './blockContent'
import hero from './blocks/hero'
import imageBlock from './blocks/imageBlock'
import textBlock from './blocks/textBlock'
import page from './page'
import pageBuilder from './pageBuilder'
import post from './post'
import migrationInfo from './resources/migrationInfo'
import resource from './resources/resource'
import resourceAudience from './resources/resourceAudience'
import resourcePublisher from './resources/resourcePublisher'
import resourceTopic from './resources/resourceTopic'
import seo from './seo'

export const schemaTypes = [
  page,
  post,
  resource,
  resourceTopic,
  resourceAudience,
  resourcePublisher,
  pageBuilder,
  hero,
  textBlock,
  imageBlock,
  seo,
  accessibleImage,
  blockContent,
  migrationInfo,
]
