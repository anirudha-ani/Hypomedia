import { Select } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import * as bi from 'react-icons/bi'
import * as ri from 'react-icons/ri'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  alertMessageState,
  alertOpenState,
  alertTitleState,
  currentNodeState,
  isLinkingState,
  refreshLinkListState,
  refreshState,
  selectedNodeState,
} from '../../../global/Atoms'
import { FrontendNodeGateway } from '../../../nodes'
import { IFolderNode, INode, INodeProperty, makeINodeProperty } from '../../../types'
import { Button } from '../../Button'
import { ContextMenuItems } from '../../ContextMenu'
import { EditableText } from '../../EditableText'
import './NodeHeader.scss'

interface INodeHeaderProps {
  onHandleCompleteLinkClick: () => void
  onHandleStartLinkClick: () => void
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  onClickShowLinkGraph: () => void
  onClickRecordAudio: () => void
  onClickShowTimeline: () => void
  isPersonNode: boolean
}

export const NodeHeader = (props: INodeHeaderProps) => {
  const {
    onDeleteButtonClick,
    onMoveButtonClick,
    onHandleStartLinkClick,
    onHandleCompleteLinkClick,
    onClickShowLinkGraph,
    onClickRecordAudio,
    onClickShowTimeline,
    isPersonNode,
  } = props
  const currentNode = useRecoilValue(currentNodeState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const isLinking = useRecoilValue(isLinkingState)
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [refreshLinkList, setRefreshLinkList] = useRecoilState(refreshLinkListState)

  // State variable for current node title
  const [title, setTitle] = useState(currentNode.title)
  // State variable for whether the title is being edited
  const [editingTitle, setEditingTitle] = useState<boolean>(false)

  /* Method to update the current folder view */
  const handleUpdateFolderView = async (e: React.ChangeEvent) => {
    const nodeProperty: INodeProperty = makeINodeProperty(
      'viewType',
      (e.currentTarget as any).value as any
    )
    const updateViewResp = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ])
    if (updateViewResp.success) {
      setSelectedNode(updateViewResp.payload)
    } else {
      setAlertIsOpen(true)
      setAlertTitle('View not updated')
      setAlertMessage(updateViewResp.message)
    }
  }

  /* Method to update the node title */
  const handleUpdateTitle = async (title: string) => {
    // TODO: Task 8
    setTitle(title)
    const nodeProperty: INodeProperty = makeINodeProperty('title', title)
    const titleUpdateResp = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ])
    if (!titleUpdateResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Title update failed')
      setAlertMessage(titleUpdateResp.message)
    }
    setRefresh(!refresh)
    setRefreshLinkList(!refreshLinkList)
  }

  /* Method called on title right click */
  const handleTitleRightClick = () => {
    // TODO: Task 9 - context menu
    ContextMenuItems.splice(0, ContextMenuItems.length)
    const menuItem: JSX.Element = (
      <div
        key={'titleRename'}
        className="contextMenuItem"
        onClick={(e) => {
          ContextMenuItems.splice(0, ContextMenuItems.length)
          setEditingTitle(true)
        }}
      >
        <div className="itemTitle">Rename</div>
        <div className="itemShortcut">cmmd + shift + R</div>
      </div>
    )
    ContextMenuItems.push(menuItem)
  }

  /* useEffect which updates the title and editing state when the node is changed */
  useEffect(() => {
    setTitle(currentNode.title)
    setEditingTitle(false)
  }, [currentNode])

  /* Node key handlers*/
  const nodeKeyHandlers = (e: KeyboardEvent) => {
    // TODO: Task 9 - keyboard shortcuts
    switch (e.key) {
      case 'Enter':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
      case 'Escape':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
    }

    // ctrl + shift key events
    if (e.shiftKey && e.ctrlKey) {
      switch (e.key) {
        case 'R':
          e.preventDefault()
          setEditingTitle(true)
          break
      }
    }
  }

  // Trigger on node load or when editingTitle changes
  useEffect(() => {
    // TODO: Task 9 - keyboard shortcuts
    document.addEventListener('keydown', nodeKeyHandlers)
  }, [editingTitle])

  const folder: boolean = currentNode.type === 'folder'
  const notRoot: boolean = currentNode.nodeId !== 'root'
  return (
    <div className="nodeHeader">
      <div className="nodeHeader-title">
        <EditableText
          text={title}
          editing={editingTitle}
          setEditing={setEditingTitle}
          onEdit={handleUpdateTitle}
          onContextMenu={handleTitleRightClick}
        />
      </div>
      <div className="nodeHeader-buttonBar">
        {notRoot && (
          <>
            <Button
              icon={<ri.RiDeleteBin6Line />}
              text="Delete"
              style={{ color: 'white' }}
              onClick={() => onDeleteButtonClick(currentNode)}
            />
            <Button
              icon={<ri.RiDragDropLine />}
              text="Move"
              style={{ color: 'white' }}
              onClick={() => onMoveButtonClick(currentNode)}
            />
            <Button
              icon={<ri.RiExternalLinkLine />}
              text="Start Link"
              style={{ color: 'white' }}
              onClick={onHandleStartLinkClick}
            />
            {isLinking && (
              <Button
                text="Complete Link"
                icon={<bi.BiLinkAlt />}
                style={{ color: 'white' }}
                onClick={onHandleCompleteLinkClick}
              />
            )}
            <Button
              icon={<ri.RiGitBranchFill />}
              text="Graph View"
              style={{ color: 'white' }}
              onClick={onClickShowLinkGraph}
            />
            {isPersonNode && (
              <Button
                icon={<ri.RiMicLine />}
                text="Record"
                style={{ color: 'white' }}
                onClick={onClickRecordAudio}
              />
            )}

            {isPersonNode && (
              <Button
                icon={<ri.RiTimeLine />}
                text="Show Timeline"
                style={{ color: 'white' }}
                onClick={onClickShowTimeline}
              />
            )}
            {/* {folder && (
              <div className="select">
                <Select
                  bg="#242935"
                  defaultValue={(currentNode as IFolderNode).viewType}
                  style={{ color: 'white' }}
                  onChange={handleUpdateFolderView}
                  height={35}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </Select>
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  )
}
