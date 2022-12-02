import React from 'react'
import {
  RiFolderLine,
  RiImageLine,
  RiStickyNoteLine,
  RiVideoLine,
  RiFilePdfLine,
  RiQuestionLine,
  RiMusicFill,
  RiMap2Fill,
  RiMapFill,
  RiUserLocationFill,
} from 'react-icons/ri'
import { FaLocationArrow } from 'react-icons/fa'
import { MdLocationOn } from 'react-icons/md'
import uniqid from 'uniqid'
import { NodeType } from '../types'
import { INodePath } from '../types'

export const apiKey = 'AIzaSyAkQwN0JqckFsxoReJp6tQihWnv6Wj7Qu8'

export const nodeTypeIcon = (type: NodeType): JSX.Element => {
  switch (type) {
    case 'text':
      return <RiStickyNoteLine />
    case 'video':
      return <RiVideoLine />
    case 'folder':
      return <RiFolderLine />
    case 'image':
      return <RiImageLine />
    case 'audio':
      return <RiMusicFill />
    case 'geo':
      return <MdLocationOn />
    case 'pdf':
      return <RiFilePdfLine />
    default:
      return <RiQuestionLine />
  }
}

export const pathToString = (filePath: INodePath): string => {
  let urlPath: string = ''
  if (filePath.path) {
    for (const id of filePath.path) {
      urlPath = urlPath + id + '/'
    }
  }
  return urlPath
}

/**
 * Helpful for filtering out null and undefined values
 * @example
 * const validNodes = myNodes.filter(isNotNullOrUndefined)
 */
export const isNotNullOrUndefined = (data: any) => {
  return data != null
}

type hypertextObjectType = NodeType | 'link' | 'anchor'

export function generateObjectId(prefix: hypertextObjectType) {
  return uniqid(prefix + '.')
}
