import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import ReactFlow from 'react-flow-renderer'

import './ShowLinkGraphModal.scss'

export interface ICreateNodeModalProps {
  isOpen: boolean
  nodes: any
  edges: any
  onClose: () => void
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const ShowLinkGraphModal = (props: ICreateNodeModalProps) => {
  // deconstruct props variables
  const { isOpen, nodes, edges, onClose } = props

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
  }

  const loadMenu = (key: number) => {
    return <ReactFlow key={key} nodes={nodes} edges={edges} fitView />
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Link Graph</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="modal-body">{loadMenu(nodes.length)}</div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
