import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { Link } from '@tiptap/extension-link'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '../../../Button'

import { FrontendAnchorGateway } from '../../../../anchors'
import {
  currentNodeState,
  refreshAnchorState,
  refreshLinkListState,
  refreshState,
  selectedAnchorsState,
  selectedExtentState,
  startAnchorState,
  alertMessageState,
  alertOpenState,
  alertTitleState,
} from '../../../../global/Atoms'
import { FrontendLinkGateway } from '../../../../links'
import { FrontendNodeGateway } from '../../../../nodes'
import {
  Extent,
  failureServiceResponse,
  IAnchor,
  ILink,
  INodeProperty,
  IServiceResponse,
  ITextExtent,
  makeINodeProperty,
  makeITextExtent,
  successfulServiceResponse,
} from '../../../../types'
import './TextContent.scss'
import { TextMenu } from './TextMenu'
import Code from '@tiptap/extension-code'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { flexbox } from '@chakra-ui/react'
import { link } from 'fs'
interface ITextContentProps {}

/** The content of an text node, including all its anchors */
export const TextContent = (props: ITextContentProps) => {
  const [currentNode, setCurrentNode] = useRecoilState(currentNodeState)
  const startAnchor = useRecoilValue(startAnchorState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [anchorRefresh, setAnchorRefresh] = useRecoilState(refreshAnchorState)
  const [linkMenuRefresh, setLinkMenuRefresh] = useRecoilState(refreshLinkListState)
  const [selectedAnchors, setSelectedAnchors] = useRecoilState(selectedAnchorsState)
  const [selectedExtent, setSelectedExtent] = useRecoilState(selectedExtentState)
  const [onSave, setOnSave] = useState(false)
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [content, setContent] = useState(currentNode.content)
  const history = useHistory()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, autolink: false, linkOnPaste: false }),
    ],
    content: content,
  })

  // TODO: Add all of the functionality for a rich text editor!

  // This takes the editor's current state of HTML and saves it to the database.
  // Before saving it strips all the anchor tags
  const handleUpdateContent = async () => {
    if (editor) {
      console.log('Iterating start')

      // It saves the existing anchors and their extent state of the editor
      const anchorIds: string[] = []
      const updatedExtent: Array<ITextExtent> = []
      editor.state.doc.descendants(function(node, pos, parent, index) {
        for (let i = 0; i < node.marks.length; i++) {
          if (
            node.marks[i] &&
            node.marks[i].type &&
            node.marks[i].type.name &&
            node.marks[i].type.name == 'link' &&
            node.marks[i].attrs &&
            node.marks[i].attrs.target
          ) {
            if (String(node.marks[i].attrs.target).includes('anchor')) {
              const extent: ITextExtent = makeITextExtent(
                String(node.text),
                pos - 1,
                pos + String(node.text).length - 1
              )

              anchorIds.push(String(node.marks[i].attrs.target))
              updatedExtent.push(extent)
            }
          }
        }
      })

      // Update the modified anchors in database
      for (let i = 0; i < anchorIds.length; i++) {
        const updateAnchorResp = await FrontendAnchorGateway.updateExtent(
          anchorIds[i],
          updatedExtent[i]
        )
      }

      // Now it is fetching the anchors in database
      const anchorMarks: ITextExtent[] = []
      const anchorResponse = await FrontendAnchorGateway.getAnchorsByNodeId(
        currentNode.nodeId
      )

      // This code section compare the current editor state with the DB state. If some annchors are removed in the editor
      // it removes those links
      if (anchorResponse && anchorResponse.success && anchorResponse.payload) {
        for (let i = 0; i < anchorResponse.payload?.length; i++) {
          const anchor = anchorResponse.payload[i]
          if (!anchorIds.includes(anchor.anchorId)) {
            const getLinkResponse = await FrontendLinkGateway.getLinksByAnchorId(
              anchor.anchorId
            )
            if (getLinkResponse.success && getLinkResponse.payload) {
              const deleteLinkResponse = await FrontendLinkGateway.deleteLink(
                getLinkResponse.payload[0].linkId
              )
              const deleteAnchor1Response = await FrontendAnchorGateway.deleteAnchor(
                getLinkResponse.payload[0].anchor1Id
              )
              const deleteAnchor2Response = await FrontendAnchorGateway.deleteAnchor(
                getLinkResponse.payload[0].anchor2Id
              )
            } else {
              const deleteAnchorResponse = await FrontendAnchorGateway.deleteAnchor(
                anchor.anchorId
              )
            }
          }
        }
      }

      // This line removes all the anchor tag from the editor. Those anchors are only placed though the addAnchorMarks function
      let htmlWithoutAnchors = editor.getHTML()
      htmlWithoutAnchors = htmlWithoutAnchors
        .replace(/<a\b[^>]*>/i, '')
        .replace(/<\/a>/i, '')

      setContent(htmlWithoutAnchors)

      // Update and save the node in the database with all the original HTML tags but not the anchors
      const nodeProperty: INodeProperty = makeINodeProperty('content', htmlWithoutAnchors)
      const contentUpdateResp = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
        nodeProperty,
      ])
      if (!contentUpdateResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Title update failed')
        setAlertMessage(contentUpdateResp.message)
      }
      setRefresh(!refresh)
      setLinkMenuRefresh(!linkMenuRefresh)
    }
  }

  // This function adds anchor marks for anchors in the database to the text editor
  // TODO: Replace 'http://localhost:3000/' with your frontend URL when you're ready to deploy
  const addAnchorMarks = async (): Promise<IServiceResponse<any>> => {
    if (!editor) {
      return failureServiceResponse('no editor')
    }
    const anchorMarks: ITextExtent[] = []
    const anchorResponse = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    if (!anchorResponse || !anchorResponse.success) {
      return failureServiceResponse('failed to get anchors')
    }
    if (!anchorResponse.payload) {
      return successfulServiceResponse('no anchors to add')
    }
    for (let i = 0; i < anchorResponse.payload?.length; i++) {
      const anchor = anchorResponse.payload[i]
      const linkResponse = await FrontendLinkGateway.getLinksByAnchorId(anchor.anchorId)
      if (!linkResponse.success || !linkResponse.payload) {
        return failureServiceResponse('failed to get link')
      }
      const link = linkResponse.payload[0]
      let node = link.anchor1NodeId
      if (node == currentNode.nodeId) {
        node = link.anchor2NodeId
      }
      if (anchor.extent && anchor.extent.type == 'text') {
        editor.commands.setTextSelection({
          from: anchor.extent.startCharacter + 1,
          to: anchor.extent.endCharacter + 1,
        })
        editor.commands.setLink({
          href: 'http://hogareditablenoteproject.web.app/' + node + '/',
          target: anchor.anchorId,
        })
      }
    }
    return successfulServiceResponse('added anchors')
  }

  // Set the content and add anchor marks when this component loads
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content)
      addAnchorMarks()
    }
  }, [content, editor, refresh])

  // Set the selected extent to null when this component loads
  // Maintining local contnet version instead of directly using recoil state
  useEffect(() => {
    setSelectedExtent(null)
    setContent(currentNode.content)
  }, [currentNode])

  // Handle setting the selected extent
  const onPointerUp = (e: React.PointerEvent) => {
    if (!editor) {
      return
    }
    const from = editor.state.selection.from
    const to = editor.state.selection.to
    const text = editor.state.doc.textBetween(from, to)
    if (from !== to) {
      const selectedExtent: Extent = {
        type: 'text',
        startCharacter: from - 1,
        endCharacter: to - 1,
        text: text,
      }
      setSelectedExtent(selectedExtent)
    } else {
      setSelectedExtent(null)
    }
  }

  if (!editor) {
    return <div>{currentNode.content}</div>
  }

  return (
    <div>
      <TextMenu editor={editor} onSave={handleUpdateContent} />
      <div style={{ height: '20px' }}></div>
      <EditorContent
        style={{ padding: '10px' }}
        editor={editor}
        onPointerUp={onPointerUp}
      />
    </div>
  )
}
