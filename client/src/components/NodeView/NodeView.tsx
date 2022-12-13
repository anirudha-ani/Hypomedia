import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FrontendAnchorGateway } from '../../anchors'
import { generateObjectId } from '../../global'
import Geocode from 'react-geocode'

import {
  IAnchor,
  ILink,
  INode,
  isSameExtent,
  NodeIdsToNodesMap,
  nodeTypes,
  RecursiveNodeTree,
} from '../../types'
import { NodeBreadcrumb } from './NodeBreadcrumb'
import { NodeContent } from './NodeContent'
import { NodeHeader } from './NodeHeader'
import { includesAnchorId, loadAnchorToLinksMap, NodeLinkMenu } from './NodeLinkMenu'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  isLinkingState,
  refreshState,
  startAnchorState,
  endAnchorState,
  selectedAnchorsState,
  selectedExtentState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  currentNodeState,
  refreshLinkListState,
} from '../../global/Atoms'
import './NodeView.scss'
import { ShowLinkGraphModal } from '../Modals/ShowLinkGraphModal'
import { RecordAudioModal } from '../Modals/RecordAudioModal'
import { ShowTimelineModal } from '../Modals/ShowTimelineModal'

export interface INodeViewProps {
  currentNode: INode
  // map of nodeIds to nodes
  nodeIdsToNodesMap: NodeIdsToNodesMap
  // handler for completing link
  onCompleteLinkClick: () => void
  // handler for opening create node modal
  onCreateNodeButtonClick: () => void
  // handler for deleting currentNode
  onDeleteButtonClick: (node: INode) => void
  // handler for opening move node modal
  onMoveButtonClick: (node: INode) => void
  // children used when rendering folder node
  onSubmit: () => unknown
  childNodes?: INode[]
  rootNodes: RecursiveNodeTree[]
}

/** Full page view focused on a node's content, with annotations and links */
export const NodeView = (props: INodeViewProps) => {
  const {
    currentNode,
    nodeIdsToNodesMap,
    onCompleteLinkClick,
    onCreateNodeButtonClick,
    onDeleteButtonClick,
    onMoveButtonClick,
    childNodes,
    onSubmit,
    rootNodes,
  } = props
  const setIsLinking = useSetRecoilState(isLinkingState)
  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState)
  const setEndAnchor = useSetRecoilState(endAnchorState)
  const setSelectedAnchors = useSetRecoilState(selectedAnchorsState)
  const selectedExtent = useRecoilValue(selectedExtentState)
  const refresh = useRecoilValue(refreshState)
  const refreshLinkList = useRecoilValue(refreshLinkListState)
  const [anchors, setAnchors] = useState<IAnchor[]>([])
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [isLinkGraphOpen, setIsLinkGraphOpen] = useState(false)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)

  const [timeLineData, setTimeLineData] = useState<
    {
      area: string
      city: string
      country: string
      time: string
      interactionName: string
      interactionContent: string
    }[]
  >([])
  const [currNode, setCurrentNode] = useRecoilState(currentNodeState)
  const {
    filePath: { path },
  } = currentNode

  useEffect(() => {
    setCurrentNode(currentNode)
  })

  useEffect(() => {
    fetchTimeLine()
  }, [currentNode])

  // const currentNode = useRecoilValue(currentNodeState)
  const linkMenuRefresh = useRecoilValue(refreshLinkListState)
  const selectedAnchors = useRecoilValue(selectedAnchorsState)
  const [anchorsMap, setAnchorsMap] = useState<{
    [anchorId: string]: {
      anchor: IAnchor
      links: { link: ILink; oppNode: INode; oppAnchor: IAnchor }[]
    }
  }>({})

  const [nodes, setNodes] = useState([] as any)
  const [edges, setEdges] = useState([] as any)

  useEffect(() => {
    const fetchLinks = async () => {
      setAnchorsMap(await loadAnchorToLinksMap({ ...props, currentNode }))
    }
    fetchLinks()
  }, [currentNode, linkMenuRefresh, selectedAnchors])

  useEffect(() => {
    loadMenu()
  }, [anchorsMap])

  const initialNodes = [
    {
      id: '0',
      // you can also pass a React component as a label
      data: { label: currentNode.title },
      position: { x: 100, y: 0 },
    },
  ]

  type Edge = {
    id: string
    source: string
    target: string
    animated: boolean
  }
  const initialEdges = [] as Edge[]

  const loadMenu = () => {
    const uniqueNames = new Set<string>()
    uniqueNames.add(currentNode.nodeId)

    const fromNode = []
    const toNode = []

    if (anchorsMap) {
      for (const anchorId in anchorsMap) {
        if (Object.prototype.hasOwnProperty.call(anchorsMap, anchorId)) {
          const anchorLinks = anchorsMap[anchorId].links
          for (let i = 0; i < anchorLinks.length; i++) {
            if (uniqueNames.has(anchorLinks[i].oppNode.nodeId)) {
              continue
            } else {
              uniqueNames.add(anchorLinks[i].oppNode.nodeId)
            }
            if (
              anchorLinks[i].link.anchor1NodeId == currNode.nodeId &&
              anchorLinks[i].link.anchor2NodeId != currNode.nodeId
            ) {
              toNode.push(nodeIdsToNodesMap[anchorLinks[i].link.anchor2NodeId].title)
            } else if (
              anchorLinks[i].link.anchor2NodeId == currNode.nodeId &&
              anchorLinks[i].link.anchor1NodeId != currNode.nodeId
            ) {
              fromNode.push(nodeIdsToNodesMap[anchorLinks[i].link.anchor1NodeId].title)
            }
          }
        }
      }
    }

    let i = 1
    for (let j = 0; j < fromNode.length; j++) {
      initialNodes.push({
        id: String(i),
        data: { label: fromNode[j] },
        position: { x: i % 2 != 0 ? 0 : 200, y: 50 * i },
      })
      initialEdges.push({
        id: '0-' + String(i),
        source: String(i),
        target: '0',
        animated: false,
      })
      i = i + 1
    }

    initialNodes[0].position.y = 50 * i + 50
    i = i + 3

    for (let j = 0; j < toNode.length; j++) {
      initialNodes.push({
        id: String(i),
        data: { label: toNode[j] },
        position: { x: i % 2 != 0 ? 0 : 200, y: 50 * i },
      })
      initialEdges.push({
        id: '0-' + String(i),
        source: '0',
        target: String(i),
        animated: true,
      })
      i = i + 1
    }

    setNodes(initialNodes)
    setEdges(initialEdges)
  }

  const loadAnchorsFromNodeId = useCallback(async () => {
    const anchorsFromNode = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      setAnchors(anchorsFromNode.payload)
    }
  }, [currentNode])

  const handleStartLinkClick = () => {
    if (selectedExtent === undefined) {
      setAlertIsOpen(true)
      setAlertTitle('Cannot start link from this anchor')
      setAlertMessage(
        // eslint-disable-next-line
        'There are overlapping anchors, or this anchor contains other anchors. Before you create this anchor you must remove the other anchors.'
      )
    } else {
      const anchor = {
        anchorId: generateObjectId('anchor'),
        extent: selectedExtent,
        nodeId: currentNode.nodeId,
      }
      setStartAnchor(anchor)
      setIsLinking(true)
    }
  }

  const handleCompleteLinkClick = async () => {
    const anchorsByNodeResp = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    let anchor2: IAnchor | undefined = undefined
    if (
      anchorsByNodeResp.success &&
      anchorsByNodeResp.payload &&
      selectedExtent !== undefined
    ) {
      anchorsByNodeResp.payload?.forEach((nodeAnchor) => {
        if (isSameExtent(nodeAnchor.extent, selectedExtent)) {
          anchor2 = nodeAnchor
        }
        if (
          startAnchor &&
          isSameExtent(nodeAnchor.extent, startAnchor.extent) &&
          startAnchor.nodeId == currentNode.nodeId
        ) {
          setStartAnchor(nodeAnchor)
        }
      })
    }
    if (selectedExtent !== undefined) {
      anchor2 = {
        anchorId: generateObjectId('anchor'),
        extent: selectedExtent,
        nodeId: currentNode.nodeId,
      }
      setEndAnchor(anchor2)
      onCompleteLinkClick()
    }
  }

  useEffect(() => {
    setSelectedAnchors([])
    loadAnchorsFromNodeId()
  }, [loadAnchorsFromNodeId, currentNode, refreshLinkList, setSelectedAnchors])

  const hasBreadcrumb: boolean = path.length > 1
  const hasAnchors: boolean = anchors.length > 0
  let nodePropertiesWidth: number = hasAnchors ? 200 : 0
  const nodeViewWidth: string = `calc(100% - ${nodePropertiesWidth}px)`

  const nodeProperties = useRef<HTMLHeadingElement>(null)
  const divider = useRef<HTMLHeadingElement>(null)
  let xLast: number
  let dragging: boolean = false

  const isPersonNode = () => {
    for (let i = 0; i < rootNodes.length; i++) {
      if (currentNode.nodeId == rootNodes[i].node.nodeId) {
        return true
      }
    }
    return false
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = true
    xLast = e.screenX
    document.removeEventListener('pointermove', onPointerMove)
    document.addEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.addEventListener('pointerup', onPointerUp)
  }

  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (divider.current) divider.current.style.width = '10px'
    if (nodeProperties.current && dragging) {
      const nodePropertiesElement = nodeProperties.current
      let width = parseFloat(nodePropertiesElement.style.width)
      const deltaX = e.screenX - xLast // The change in the x location
      const newWidth = (width -= deltaX)
      if (!(newWidth < 200 || newWidth > 480)) {
        nodePropertiesElement.style.width = String(width) + 'px'
        nodePropertiesWidth = width
        xLast = e.screenX
      }
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    if (divider.current) divider.current.style.width = ''
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  }

  const handleShowLinkGraph = () => {
    setIsLinkGraphOpen(!isLinkGraphOpen)
  }

  const handleShowTimeline = () => {
    setIsTimelineOpen(!isTimelineOpen)
  }

  const fetchTimeLine = () => {
    setTimeLineData([])
    for (let i = 0; i < rootNodes.length; i++) {
      if (currentNode.nodeId == rootNodes[i].node.nodeId) {
        const interactions = rootNodes[i].children

        // const timeLineData = []

        for (let j = 0; j < interactions.length; j++) {
          let city = ''
          let country = ''
          let area = ''
          let time = ''
          const interactionName = interactions[j].node.title
          let interactionContent = ''

          if (interactions[j].node.dateCreated != undefined) {
            time = interactions[j].node.dateCreated?.toLocaleString() ?? '0'
          }

          const interactionElements = interactions[j].children

          for (let k = 0; k < interactionElements.length; k++) {
            if (interactionElements[k].node.type == 'text') {
              interactionContent = interactionElements[k].node.content
            }
          }

          for (let k = 0; k < interactionElements.length; k++) {
            if (interactionElements[k].node.type == 'geo') {
              const latitude = interactionElements[k].node.latitude
              const longitude = interactionElements[k].node.longitude

              Geocode.setApiKey('AIzaSyB8iT3_3yLhvU-5LPl6kHHi63H7yKMW-So')
              Geocode.setLanguage('en')
              Geocode.setRegion('es')
              Geocode.setLocationType('ROOFTOP')
              Geocode.enableDebug()

              // Get address from latitude & longitude.

              Geocode.fromLatLng(String(latitude), String(longitude)).then(
                (response: any) => {
                  for (
                    let i = 0;
                    i < response.results[0].address_components.length;
                    i++
                  ) {
                    for (
                      let j = 0;
                      j < response.results[0].address_components[i].types.length;
                      j++
                    ) {
                      switch (response.results[0].address_components[i].types[j]) {
                        case 'route':
                          area = response.results[0].address_components[i].long_name
                          break
                        case 'locality':
                          city = response.results[0].address_components[i].long_name
                          break
                        case 'country':
                          country = response.results[0].address_components[i].long_name
                          break
                      }
                    }
                  }
                  // console.log('Interaction name = ', interactionName)
                  // console.log('Interaction city = ', city)
                  // console.log('Interaction country = ', country)
                  // console.log('Interaction time = ', time)
                  // console.log('Interaction interactionContent = ', interactionContent)

                  setTimeLineData((prevPrevTimelineData) => [
                    ...prevPrevTimelineData,
                    {
                      area: area,
                      city: city,
                      country: country,
                      time: time,
                      interactionName: interactionName,
                      interactionContent: interactionContent,
                    },
                  ])
                  // console.log('Google loc = ', city, state, country)
                  // console.log(address)
                },
                (error: any) => {
                  console.error(error)
                }
              )
            }
          }
        }
      }
    }
  }

  const handleRecordAudio = () => {
    setIsRecordingAudio(!isRecordingAudio)
  }

  return (
    <div className="node">
      <div className="nodeView" style={{ width: nodeViewWidth }}>
        <NodeHeader
          onMoveButtonClick={onMoveButtonClick}
          onDeleteButtonClick={onDeleteButtonClick}
          onHandleStartLinkClick={handleStartLinkClick}
          onHandleCompleteLinkClick={handleCompleteLinkClick}
          onClickShowLinkGraph={handleShowLinkGraph}
          onClickRecordAudio={handleRecordAudio}
          onClickShowTimeline={handleShowTimeline}
          isPersonNode={isPersonNode()}
        />
        <div className="nodeView-scrollable">
          {hasBreadcrumb && (
            <div className="nodeView-breadcrumb">
              <NodeBreadcrumb path={path} nodeIdsToNodesMap={nodeIdsToNodesMap} />
            </div>
          )}
          <div className="nodeView-content">
            <NodeContent
              childNodes={childNodes}
              onCreateNodeButtonClick={onCreateNodeButtonClick}
            />
          </div>
        </div>
      </div>
      {hasAnchors && (
        <div className="divider" ref={divider} onPointerDown={onPointerDown} />
      )}
      {hasAnchors && (
        <div
          className={'nodeProperties'}
          ref={nodeProperties}
          style={{ width: nodePropertiesWidth }}
        >
          <NodeLinkMenu nodeIdsToNodesMap={nodeIdsToNodesMap} />
        </div>
      )}
      <ShowLinkGraphModal
        isOpen={isLinkGraphOpen}
        onClose={() => {
          setIsLinkGraphOpen(false)
        }}
        nodes={nodes}
        edges={edges}
      />
      {isPersonNode() && (
        <ShowTimelineModal
          isOpen={isTimelineOpen}
          onClose={() => {
            setIsTimelineOpen(false)
          }}
          timeLineData={timeLineData}
        />
      )}

      <RecordAudioModal
        isOpen={isRecordingAudio}
        nodeIdsToNodesMap={nodeIdsToNodesMap}
        onClose={() => {
          setIsRecordingAudio(false)
        }}
        onSubmit={onSubmit}
      />
    </div>
  )
}
