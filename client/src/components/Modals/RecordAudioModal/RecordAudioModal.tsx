import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import RecordRTC, { RecordRTCPromisesHandler, invokeSaveAsDialog } from 'recordrtc'
import FileSaver from 'file-saver'

import './RecordAudioModal.scss'

export interface ICreateNodeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const useRecorderPermission = (recordingType: RecordRTC.Options['type']) => {
  const [recorder, setRecorder] = useState<any>()
  useEffect(() => {
    getPermissionInitializeRecorder()
  }, [])
  const getPermissionInitializeRecorder = async () => {
    const stream = await (navigator as any).mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    const recorder = new RecordRTCPromisesHandler(stream, {
      type: recordingType,
    })
    setRecorder(recorder)
  }
  return recorder
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const RecordAudioModal = (props: ICreateNodeModalProps) => {
  // deconstruct props variables
  const { isOpen, onClose } = props

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
  }

  const recorder = useRecorderPermission('audio')
  const startRecording = async () => {
    recorder.startRecording()
  }
  const stopRecording = async () => {
    console.log('stop recording')
    await recorder.stopRecording()
    const blob = await recorder.getBlob()
    // invokeSaveAsDialog(blob, 'random_name.webm')
    const file = new File([blob], 'random_name.webm', {
      type: 'audio/webm',
    })
    console.log(file)

    FileSaver.saveAs(file)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Record Audio</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <p>{status}</p> */}
            {/* <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
            <video src={mediaBlobUrl} controls autoPlay loop /> */}
            {/* <audio src={mediaBlobUrl} controls autoPlay loop /> */}
            <Button onClick={startRecording}>Start recording</Button>
            <Button onClick={stopRecording}>Stop recording</Button>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
