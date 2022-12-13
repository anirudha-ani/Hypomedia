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
// import Modal from 'react-modal'

import './ShowTimelineModal.scss'

export interface ICreateNodeModalProps {
  isOpen: boolean
  // nodes: any
  // edges: any
  onClose: () => void
  timeLineData: {
    area: string
    city: string
    country: string
    time: string
    interactionName: string
    interactionContent: string
  }[]
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const ShowTimelineModal = (props: ICreateNodeModalProps) => {
  // deconstruct props variables
  const { isOpen, onClose, timeLineData } = props

  // console.log('Timeline data = ', timeLineData)

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
  }

  const loadTimeline = () => {
    const timeLineItems: JSX.Element[] = []
    for (let i = 0; i < timeLineData.length; i++) {
      timeLineItems.push(
        <VerticalTimelineElement
          key={i.toString()}
          className="vertical-timeline-element--work"
          contentStyle={{ background: '#b3acfc', color: '#ffffff' }}
          contentArrowStyle={{ borderRight: '7px solid  #b3acfc' }}
          // YYYY-MM-DDTHH:MM:SS
          date={timeLineData[i].time.slice(0, 19)}
          iconStyle={{ background: '#b3acfc', color: '#ffffff' }}
          // icon={<WorkIcon />}
        >
          <h3 className="vertical-timeline-element-title">
            <b>{timeLineData[i].interactionName}</b>
          </h3>
          <h4 className="vertical-timeline-element-subtitle">
            {`${timeLineData[i].area}, ${timeLineData[i].city}`}
          </h4>
          <h4 className="vertical-timeline-element-subtitle">{`${timeLineData[i].country}`}</h4>
          <p>{timeLineData[i].interactionContent}</p>
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
            <div
              className="modal-body-timeline"
              style={{ width: '980px', overflowY: 'scroll' }}
            >
              {loadTimeline()}
            </div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
