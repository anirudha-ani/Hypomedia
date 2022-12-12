import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import React from 'react'
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component'
import 'react-vertical-timeline-component/style.min.css'
import { Link } from 'react-router-dom'
// import Modal from 'react-modal'

import './ShowTimelineModal.scss'

export interface ICreateNodeModalProps {
  isOpen: boolean
  // nodes: any
  // edges: any
  onClose: () => void
  timeLineData: {
    city: string
    country: string
    time: string
    interactionName: string
    interactionContent: string
    interactionId: string
  }[]
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const ShowTimelineModal = (props: ICreateNodeModalProps) => {
  // deconstruct props variables
  const { isOpen, onClose, timeLineData } = props

  console.log('Timeline data = ', timeLineData)

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
  }

  const loadTimeline = () => {
    const timeLineItems: JSX.Element[] = []

    const uniqueInteractionsID = new Set()

    for (let i = 0; i < timeLineData.length; i++) {
      if (uniqueInteractionsID.has(timeLineData[i].interactionId)) {
        continue
      }

      uniqueInteractionsID.add(timeLineData[i].interactionId)

      timeLineItems.push(
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          contentStyle={{ background: '#b3acfc', color: '#ffffff' }}
          contentArrowStyle={{ borderRight: '7px solid  #b3acfc' }}
          // YYYY-MM-DDTHH:MM:SS
          date={timeLineData[i].time.slice(0, 19)}
          iconStyle={{ background: '#b3acfc', color: '#ffffff' }}
          // icon={<WorkIcon />}
        >
          <Link
            to={`/${timeLineData[i].interactionId}/`}
            key={timeLineData[i].interactionId}
          >
            <div
              onClick={() => {
                handleClose()
              }}
            >
              <h3 className="vertical-timeline-element-title">
                {timeLineData[i].interactionName}
              </h3>
              <h4 className="vertical-timeline-element-subtitle">
                {`${timeLineData[i].city}, ${timeLineData[i].country}`}
              </h4>
              <p>{timeLineData[i].interactionContent}</p>
            </div>{' '}
          </Link>
        </VerticalTimelineElement>
      )
    }

    // sort timeLineItems by date
    timeLineItems.sort((a, b) => {
      const dateA = new Date(a.props.date)
      const dateB = new Date(b.props.date)

      return dateA.getTime() - dateB.getTime()
    })

    return <VerticalTimeline>{timeLineItems}</VerticalTimeline>
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div>
        <ModalOverlay />
        <ModalContent maxW="66rem" alignItems="center">
          <ModalHeader>Timeline</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="modal-body-timeline" style={{ width: '980px' }}>
              {loadTimeline()}
            </div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
