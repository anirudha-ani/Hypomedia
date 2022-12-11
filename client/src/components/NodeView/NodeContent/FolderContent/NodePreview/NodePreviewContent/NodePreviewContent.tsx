import React from 'react'
import { NodeType } from '../../../../../../types'
import { ImagePreviewContent } from './ImagePreviewContent'
import './NodePreviewContent.scss'
import { TextPreviewContent } from './TextPreviewContent'
import { AudioPreviewContent } from './AudioPreviewContent'
import { GeoPreviewContent } from './GeoPreviewContent'
import { FolderPreviewContent } from './FolderPreviewContent'

/** Props needed to render any node content */
export interface INodeContentPreviewProps {
  content: any
  user?: boolean
  type: NodeType
}

export const NodePreviewContent = (props: INodeContentPreviewProps) => {
  const { type, content, user } = props
  switch (type) {
    case 'image':
      return <ImagePreviewContent content={content} />
    case 'audio':
      return <AudioPreviewContent />
    case 'geo':
      return <GeoPreviewContent />
    case 'text':
      return <TextPreviewContent content={content} />
    case 'folder':
      return <FolderPreviewContent user={user} />

    default:
      return null
  }
}
