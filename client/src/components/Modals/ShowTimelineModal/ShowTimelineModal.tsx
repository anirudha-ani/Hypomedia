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
          <h3 className="vertical-timeline-element-title">
            {timeLineData[i].interactionName}
          </h3>
          <h4 className="vertical-timeline-element-subtitle">
            {`${timeLineData[i].city}, ${timeLineData[i].country}`}
          </h4>
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
    return (
      <VerticalTimeline>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
          date="2011 - present"
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          // icon={<WorkIcon />}
        >
          <h3 className="vertical-timeline-element-title">Creative Director</h3>
          <h4 className="vertical-timeline-element-subtitle">Miami, FL</h4>
          <p>
            Creative Direction, User Experience, Visual Design, Project Management, Team
            Leading
          </p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2010 - 2011"
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          // icon={<WorkIcon />}
        >
          <h3 className="vertical-timeline-element-title">Art Director</h3>
          <h4 className="vertical-timeline-element-subtitle">San Francisco, CA</h4>
          <p>Creative Direction, User Experience, Visual Design, SEO, Online Marketing</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2008 - 2010"
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          // icon={<WorkIcon />}
        >
          <h3 className="vertical-timeline-element-title">Web Designer</h3>
          <h4 className="vertical-timeline-element-subtitle">Los Angeles, CA</h4>
          <p>User Experience, Visual Design</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2006 - 2008"
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          // icon={<WorkIcon />}
        >
          <h3 className="vertical-timeline-element-title">Web Designer</h3>
          <h4 className="vertical-timeline-element-subtitle">San Francisco, CA</h4>
          <p>User Experience, Visual Design</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          date="April 2013"
          iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
          // icon={<SchoolIcon />}
        >
          <h3 className="vertical-timeline-element-title">
            Content Marketing for Web, Mobile and Social Media
          </h3>
          <h4 className="vertical-timeline-element-subtitle">Online Course</h4>
          <p>Strategy, Social Media</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          date="November 2012"
          iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
          // icon={<SchoolIcon />}
        >
          <h3 className="vertical-timeline-element-title">
            Agile Development Scrum Master
          </h3>
          <h4 className="vertical-timeline-element-subtitle">Certification</h4>
          <p>Creative Direction, User Experience, Visual Design</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          date="2002 - 2006"
          iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
          // icon={<SchoolIcon />}
        >
          <h3 className="vertical-timeline-element-title">
            Bachelor of Science in Interactive Digital Media Visual Imaging
          </h3>
          <h4 className="vertical-timeline-element-subtitle">Bachelor Degree</h4>
          <p>Creative Direction, Visual Design</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          iconStyle={{ background: 'rgb(16, 204, 82)', color: '#fff' }}
          // icon={<StarIcon />}
        />
      </VerticalTimeline>
    )
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
