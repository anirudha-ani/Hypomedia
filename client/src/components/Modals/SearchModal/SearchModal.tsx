import {
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Link } from 'react-router-dom'
import ReactFlow from 'react-flow-renderer'
import * as ai from 'react-icons/ai'
import * as ri from 'react-icons/ri'
import { FrontendNodeGateway } from '../../../nodes'
import { INode, NodeType, nodeTypes } from '../../../types'

import { Button } from '../../Button'

import './SearchModal.scss'

export interface ICreateNodeModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const SearchModal = (props: ICreateNodeModalProps) => {
  // deconstruct props variables
  const { isOpen, onClose } = props

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<NodeType>('' as NodeType)
  const [sortByDate, setSortByDate] = useState(false)
  const [nodeList, setNodeList] = useState<INode[]>([])

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    setSearchTerm('')
    setNodeList([])
    setSortByDate(false)
    setSelectedType('' as NodeType)
    onClose()
  }

  const handleSelectedTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value.toLowerCase() as NodeType)
  }

  const handleSearch = async () => {
    const searchResponse = await FrontendNodeGateway.searchNode(searchTerm)
    if (searchResponse.success) {
      const nodes = searchResponse.payload
      if (nodes) {
        setNodeList(nodes)
      }
    }
  }

  const loadMenu = () => {
    const listItems: JSX.Element[] = []

    let clonedArray = nodeList.map((e) => ({ ...e }))

    if (sortByDate) {
      clonedArray = clonedArray.sort((a, b) => {
        if (!a.dateCreated || !b.dateCreated) {
          return 0
        }
        if (a.dateCreated > b.dateCreated) {
          return -1
        }

        if (a.dateCreated < b.dateCreated) {
          return 1
        }

        return 0
      })
    }

    for (let i = 0; i < clonedArray.length; i++) {
      if (!clonedArray[i].nodeId.startsWith(selectedType)) {
        continue
      }
      listItems.push(
        <Link to={`/${clonedArray[i].nodeId}/`} key={clonedArray[i].nodeId}>
          <div
            className="anchorItem"
            onClick={() => {
              handleClose()
            }}
          >
            {clonedArray[i].title}
          </div>{' '}
        </Link>
      )
    }
    return listItems
  }

  const customButtonStyle = { height: 40, marginLeft: 10, width: 40 }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="left-bar">
              <Input
                value={searchTerm}
                onChange={handleSearchTermChange}
                placeholder="Search Term"
              />
              <Button
                style={customButtonStyle}
                icon={<ai.AiOutlineSearch />}
                onClick={handleSearch}
              ></Button>
            </div>
            <div className="left-bar">
              <div className="modal-input">
                <Select
                  value={selectedType}
                  onChange={handleSelectedTypeChange}
                  placeholder="Select a type"
                >
                  {nodeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                style={customButtonStyle}
                icon={<ri.RiSortDesc />}
                onClick={() => {
                  setSortByDate(!sortByDate)
                }}
                isActive={sortByDate}
              ></Button>
            </div>
            <div className="linkMenu">{loadMenu()}</div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
