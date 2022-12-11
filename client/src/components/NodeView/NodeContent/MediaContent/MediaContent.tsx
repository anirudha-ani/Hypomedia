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

interface IMediaContentProps {}

/** The content of an audio/video node, including any anchors */
export const MediaContent = () => {
  // recoil state management
  const currentNode = useRecoilValue(currentNodeState)
  const [played, setPlayed] = useState(0)
  const [refreshLinkList, setRefreshLinkListState] = useRecoilState(refreshLinkListState)
  const [selectedAnchors, setSelectedAnchors] = useRecoilState(selectedAnchorsState)
  const [selectedExtent, setSelectedExtent] = useRecoilState(selectedExtentState)
  const [currNode, setCurrentNode] = useRecoilState(currentNodeState)
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [isLinking, setIsLinking] = useRecoilState(isLinkingState)
  const [heightValue, setHeightValue] = React.useState(currentNode.height)
  const [widthValue, setWidthValue] = React.useState(currentNode.width)

  const content = currentNode.content

  return (
    <div>
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
          controls={true}
          playing={!isLinking}
          onProgress={(progress) => {
            const selectedExtent: Extent = {
              type: 'audio',
              timeStamp: progress.playedSeconds,
            }
            setSelectedExtent(selectedExtent)
          }}
        />
      </div>
    </div>
  )
}
