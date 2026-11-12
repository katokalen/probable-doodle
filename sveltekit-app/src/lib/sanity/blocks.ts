import type {PageQueryResult} from './sanity.types'

export type PageBlock = NonNullable<NonNullable<PageQueryResult>['content']>[number]
export type HeroBlock = Extract<PageBlock, {_type: 'hero'}>
export type TextBlock = Extract<PageBlock, {_type: 'textBlock'}>
export type ImageBlock = Extract<PageBlock, {_type: 'imageBlock'}>
