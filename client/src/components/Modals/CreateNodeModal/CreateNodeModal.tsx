import {
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import {
  INode,
  NodeIdsToNodesMap,
  NodeType,
  nodeTypes,
  RecursiveNodeTree,
} from '../../../types'
import { Button } from '../../Button'
import { apiKey } from '../../../global/globalUtils'
import { TreeView } from '../../TreeView'
import './CreateNodeModal.scss'
import { createNodeFromModal, uploadImage } from './createNodeUtils'
import { useSetRecoilState } from 'recoil'
import { selectedNodeState } from '../../../global/Atoms'
import { useGeolocated } from 'react-geolocated'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import { FrontendNodeGateway } from '../../../nodes'

export interface ICreateNodeModalProps {
  isOpen: boolean
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onClose: () => void
  onSubmit: () => unknown
  roots: RecursiveNodeTree[]
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CreateNodeModal = (props: ICreateNodeModalProps) => {
  // deconstruct props variables
  const { isOpen, onClose, roots, nodeIdsToNodesMap, onSubmit } = props

  // const isLoaded = useLoadScript({
  //   googleMapsApiKey: apiKey,
  // })

  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [selectedType, setSelectedType] = useState<NodeType>('' as NodeType)
  const [curNode, setCurNode] = useState<INode | null>()
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [error, setError] = useState<string>('')

  // event handlers for the modal inputs and dropdown selects
  const handleSelectedTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value.toLowerCase() as NodeType)
    setContent('')
  }

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleTextContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  const handleImageContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value)
  }

  // called when the "Create" button is clicked
  const handleSubmit = async () => {
    if (!nodeTypes.includes(selectedType)) {
      setError('Error: No type selected')
      return
    }
    if (selectedType != 'folder' && selectedParentNode == null) {
      setError('Error: No parent node selected')
      return
    }
    if (title.length === 0) {
      setError('Error: No title')
      return
    }

    const attributes = {
      content,
      latitude,
      longitude,
      nodeIdsToNodesMap,
      parentNodeId: selectedParentNode ? selectedParentNode.nodeId : null,
      title,
      type: selectedType as NodeType,
    }
    const node = await createNodeFromModal(attributes)
    node && setSelectedNode(node)
    onSubmit()
    handleClose()
  }

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
    setTitle('')
    setSelectedParentNode(null)
    setSelectedType('' as NodeType)
    setContent('')
    setError('')
    setLat(0)
    setLng(0)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    const link = files && files[0] && (await uploadImage(files[0]))
    link && setContent(link)
  }

  // content prompts for the different node types
  let contentInputPlaceholder: string
  switch (selectedType) {
    case 'text':
      contentInputPlaceholder = 'Text content...'
      break
    case 'image':
      contentInputPlaceholder = 'Image URL...'
      break
    case 'audio':
      contentInputPlaceholder = 'Audio URL...'
      break
    default:
      contentInputPlaceholder = 'Content...'
  }

  const isImage: boolean = selectedType === 'image'
  const isText: boolean = selectedType === 'text'
  const isAudio: boolean = selectedType === 'audio'

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new node</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input value={title} onChange={handleTitleChange} placeholder="Title..." />
            <div className="modal-input">
              <Select
                value={selectedType}
                onChange={handleSelectedTypeChange}
                placeholder="Select a type"
              >
                {nodeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type == 'folder'
                      ? 'User'
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            {selectedType && isText && (
              <div className="modal-input">
                <Textarea
                  value={content}
                  onChange={handleTextContentChange}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {selectedType && isImage && (
              <div className="modal-input">
                <Input
                  value={content}
                  onChange={handleImageContentChange}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {selectedType && isImage && (
              <div className="modal-input">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {selectedType && isAudio && (
              <div className="modal-input">
                <Input
                  value={content}
                  onChange={handleImageContentChange}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {selectedType && isAudio && (
              <div className="modal-input">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            <div style={{ marginTop: 25, padding: 10 }}>
              <span className="modal-title">
                <div className="modal-title-header">
                  Choose a parent node (if not User):
                </div>
              </span>
              <div className="modal-treeView">
                <TreeView
                  create={true}
                  roots={roots}
                  parentNode={selectedParentNode}
                  setParentNode={setSelectedParentNode}
                  changeUrlOnClick={false}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <Button
                style={{
                  color: 'white',
                  padding: 7,
                }}
                text="Create"
                onClick={handleSubmit}
              />
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  )
}
