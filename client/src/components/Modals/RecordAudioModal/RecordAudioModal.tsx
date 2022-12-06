import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import {
  INode,
  NodeIdsToNodesMap,
  NodeType,
  nodeTypes,
  RecursiveNodeTree,
} from '../../../types'
import { FrontendNodeGateway } from '../../../nodes'
import {
  currentNodeState,
  refreshState,
  refreshLinkListState,
  selectedNodeState,
} from '../../../global/Atoms'
import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import RecordRTC, { RecordRTCPromisesHandler, invokeSaveAsDialog } from 'recordrtc'
import { createNodeFromModal, uploadImage } from '../CreateNodeModal/createNodeUtils'
import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import FileSaver from 'file-saver'
import { firebaseConfig } from '../../../global/globalUtils'
// const speech = require('@google-cloud/speech')
// import speech from '@google-cloud/speech'
// import { SpeechClient } from '@google-cloud/speech'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import './RecordAudioModal.scss'

export interface IRecordNodeModalProps {
  isOpen: boolean
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onClose: () => void
  onSubmit: () => unknown
}

export const useRecorderPermission = (recordingType: RecordRTC.Options['type']) => {
  const [recorder, setRecorder] = useState<any>()
  useEffect(() => {
    getPermissionInitializeRecorder()
  }, [])
  const getPermissionInitializeRecorder = async () => {
    const stream = await (navigator as any).mediaDevices.getUserMedia({
      video: false,
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
export const RecordAudioModal = (props: IRecordNodeModalProps) => {
  const { nodeIdsToNodesMap, onSubmit } = props
  // Your web app's Firebase configuration
  const [currNode, setCurrentNode] = useRecoilState(currentNodeState)
  const [percent, setPercent] = useState(0)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const setSelectedNode = useSetRecoilState(selectedNodeState)

  // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  const storage = getStorage()

  // speech to text client
  // const client = new speech.SpeechClient()
  // const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  // deconstruct props variables
  const { isOpen, onClose } = props

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
  }

  // const transcribeContextClasses = async (storageURI: string) => {
  //   console.log('Transcribing - storage URI: ' + storageURI)
  //   const audio = {
  //     uri: storageURI,
  //   }

  //   const speechContext = {
  //     phrases: ['$TIME'],
  //   }

  //   const config = {
  //     encoding: 'LINEAR16',
  //     sampleRateHertz: 8000,
  //     languageCode: 'en-US',
  //     speechContexts: [speechContext],
  //   }

  //   const request = {
  //     config: config,
  //     audio: audio,
  //   }

  //   // Detects speech in the audio file.
  //   const [response] = await client.recognize(request)
  //   response.results.forEach((result: any, index: any) => {
  //     const transcript = result.alternatives[0].transcript
  //     console.log('-'.repeat(20))
  //     console.log(`First alternative of result ${index}`)
  //     console.log(`Transcript: ${transcript}`)
  //   })
  // }

  const recorder = useRecorderPermission('audio')

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition()

  if (!browserSupportsSpeechRecognition) {
    console.log(
      'Your browser doesn\'t support speech recognition. Please use Google Chrome.'
    )
  }

  const startRecording = async () => {
    recorder.startRecording()
    // SpeechRecognition.startListening({ continuous: true })
    SpeechRecognition.startListening()
  }

  const stopRecording = async () => {
    await recorder.stopRecording()
    SpeechRecognition.stopListening()

    const blob = await recorder.getBlob()
    const r = (Math.random() + 1).toString(36).substring(7)
    // invokeSaveAsDialog(blob, 'random_name.webm')
    const file = new File([blob], r + '.webm', {
      type: 'audio/webm',
    })
    const storageRef = ref(storage, '/' + currNode.title + '/' + r + '.webm')
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        // update progress
        setPercent(percent)
      },
      (err) => console.log(err),
      () => {
        // download url
        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          console.log('audio url: ', url)
          const attributes = {
            content: url,
            latitude: 0,
            longitude: 0,
            nodeIdsToNodesMap,
            parentNodeId: null,
            title: 'Recording -' + currNode.title,
            type: 'audio' as NodeType,
          }
          const node = await createNodeFromModal(attributes)
          if (currNode && node) {
            await FrontendNodeGateway.moveNode({
              newParentId: currNode.nodeId,
              nodeId: node.nodeId,
            })
          }
          node && setSelectedNode(node)

          // transcribe speech to text using google speech to text api
          // POST https://speech.googleapis.com/v1/speech:recognize
          // https://cloud.google.com/speech-to-text/docs/sync-recognize

          // transcribeContextClasses(url)

          onSubmit()
        })
      }
    )
    handleClose()
    // FileSaver.saveAs(file)
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
            <p>{transcript}</p>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
