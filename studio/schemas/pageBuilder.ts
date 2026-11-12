import {defineArrayMember, defineType} from 'sanity'

export default defineType({
  name: 'pageBuilder',
  title: 'Page builder',
  type: 'array',
  of: [
    defineArrayMember({type: 'hero'}),
    defineArrayMember({type: 'textBlock'}),
    defineArrayMember({type: 'imageBlock'}),
  ],
})
