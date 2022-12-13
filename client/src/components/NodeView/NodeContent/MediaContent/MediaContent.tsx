import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as fa from 'react-icons/fa'
import * as ri from 'react-icons/ri'
import { fetchLinks } from '..'
import { useHistory } from 'react-router-dom'
import { INodeContentProps } from '../NodeContent'
import './MediaContent.scss'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
import _ReactPlayer, { ReactPlayerProps } from 'react-player'
const ReactPlayer = _ReactPlayer as unknown as React.FC<ReactPlayerProps>
import {
  selectedNodeState,
  selectedAnchorsState,
  alertMessageState,
  alertOpenState,
  alertTitleState,
  selectedExtentState,
  currentNodeState,
  refreshState,
  startAnchorState,
  refreshLinkListState,
  isLinkingState,
} from '../../../../global/Atoms'
import { FrontendAnchorGateway } from '../../../../anchors'
import { FrontendNodeGateway } from '../../../../nodes'
import { IMediaExtent, isIMediaExtent } from '../../../../types/Extent'
import {
  Extent,
  IAnchor,
  IImageExtent,
  INode,
  isIImageExtent,
  INodeProperty,
  makeINodeProperty,
} from '../../../../types'
import './MediaContent.scss'
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'

interface IMediaContentProps {
  jump: boolean
}

/** The content of an audio/video node, including any anchors */
export const MediaContent = () => {
  // recoil state management
  const currentNode = useRecoilValue(currentNodeState)
  const [selectedExtent, setSelectedExtent] = useRecoilState(selectedExtentState)
  const [isLinking, setIsLinking] = useRecoilState(isLinkingState)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [isReady, setIsReady] = React.useState(false)
  const [selAnchors, setSelAnchors] = useRecoilState(selectedAnchorsState)
  const playerRef = React.useRef<any>()
  const timeToStart = 0

  if (selAnchors.length > 0) {
    let audioExtent: IMediaExtent | null = null
    for (let i = 0; i < selAnchors.length; i++) {
      if (selAnchors[i].extent?.type == 'audio') {
        console.log(selAnchors[i].extent)
        if (isIMediaExtent(selAnchors[i].extent)) {
          audioExtent = selAnchors[i].extent as IMediaExtent
          playerRef.current.seekTo(audioExtent.timeStamp, 'seconds')
        }
        setSelAnchors([])
      }
    }
  }

  const content = currentNode.content
  return (
    <div
      style={{
        marginLeft: 50,
        marginTop: 50,
        borderRadius: 25,
        maxHeight: '100%',
        maxWidth: '100%',
        backgroundImage:
          'url("https://cdn.dribbble.com/users/21883/screenshots/6804930/app-icon_1.gif")',
        backgroundPosition: 'center',
      }}
    >
      <ReactPlayer
        url={content}
        ref={playerRef}
        controls={true}
        playing={!isLinking}
        onProgress={(progress) => {
          const time: Extent = {
            type: 'audio',
            timeStamp: progress.playedSeconds,
          }
          setSelectedExtent(time)
        }}
      />
    </div>
  )
}
