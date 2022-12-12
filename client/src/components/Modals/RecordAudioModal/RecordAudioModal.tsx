import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { Button } from '../../Button'
import * as ri from 'react-icons/ri'
import * as ai from 'react-icons/ai'
import { useGeolocated } from 'react-geolocated'
import Geocode from 'react-geocode'
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
  const [curNode, setCurNode] = useState<INode | null>()

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  })

  Geocode.setApiKey('AIzaSyB8iT3_3yLhvU-5LPl6kHHi63H7yKMW-So')

  // set response language. Defaults to english.
  Geocode.setLanguage('en')

  // set response region. Its optional.
  // A Geocoding request with region=es (Spain) will return the Spanish city.
  Geocode.setRegion('es')

  // set location_type filter . Its optional.
  // google geocoder returns more that one address for given lat/lng.
  // In some case we need one address as response for which google itself provides a location_type filter.
  // So we can easily parse the result for fetching address components
  // ROOFTOP, RANGE_INTERPOLATED, GEOMETRIC_CENTER, APPROXIMATE are the accepted values.
  // And according to the below google docs in description, ROOFTOP param returns the most accurate result.
  Geocode.setLocationType('ROOFTOP')

  // Enable or disable logs. Its optional.
  Geocode.enableDebug()

  let city: any = null
  let state: any = null
  let country: any = null
  let address: any = null

  // Get address from latitude & longitude.
  if (coords) {
    Geocode.fromLatLng(String(coords.latitude), String(coords.longitude)).then(
      (response: any) => {
        address = response.results[0].formatted_address

        for (let i = 0; i < response.results[0].address_components.length; i++) {
          for (
            let j = 0;
            j < response.results[0].address_components[i].types.length;
            j++
          ) {
            switch (response.results[0].address_components[i].types[j]) {
              case 'locality':
                city = response.results[0].address_components[i].long_name
                break
              case 'administrative_area_level_1':
                state = response.results[0].address_components[i].long_name
                break
              case 'country':
                country = response.results[0].address_components[i].long_name
                break
            }
          }
        }

        // console.log('Google loc = ', city, state, country)
        // console.log(address)
      },
      (error: any) => {
        console.error(error)
      }
    )
  }

  // Your web app's Firebase configuration
  const [currNode, setCurrentNode] = useRecoilState(currentNodeState)
  const [percent, setPercent] = useState(0)
  const [isrecording, setIsRecording] = useState(false)
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
    setPercent(0)
    resetTranscript()
    setIsRecording(false)
    onClose()
  }

  const customButtonStyle = {
    color: 'white',
    marginRight: 15,
    paddingRight: 20,
    paddingTop: 7,
    paddingBottom: 7,
  }
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
    SpeechRecognition.startListening({ continuous: true })
    setIsRecording(true)
    // SpeechRecognition.startListening()
  }

  const stopRecording = async () => {
    await recorder.stopRecording()
    SpeechRecognition.stopListening()

    while (coords?.latitude == 0 && coords?.longitude == 0) {
      setCurNode(null)
    }
    const interactionId = (Math.random() + 1).toString(36).substring(7)

    const interactionAttributes = {
      content: '',
      latitude: 0,
      longitude: 0,
      nodeIdsToNodesMap,
      parentNodeId: currNode ? currNode.nodeId : null,
      title: 'Interaction - ' + interactionId,
      type: 'folder' as NodeType,
    }
    const interactionNode = await createNodeFromModal(interactionAttributes)

    const geoAttributes = {
      content: '',
      latitude: coords ? coords?.latitude : 0,
      longitude: coords ? coords?.longitude : 0,
      nodeIdsToNodesMap,
      parentNodeId: interactionNode ? interactionNode.nodeId : null,
      title: 'Location - ' + interactionNode?.title,
      type: 'geo' as NodeType,
    }
    console.log(geoAttributes)
    const geoNode = await createNodeFromModal(geoAttributes)
    if (geoNode && interactionNode) {
      await FrontendNodeGateway.moveNode({
        newParentId: interactionNode.nodeId,
        nodeId: geoNode.nodeId,
      })
    }

    const blob = await recorder.getBlob()
    const recordingId = (Math.random() + 1).toString(36).substring(7)
    // invokeSaveAsDialog(blob, 'random_name.webm')
    const file = new File([blob], recordingId + '.webm', {
      type: 'audio/webm',
    })
    const storageRef = ref(storage, '/' + currNode.title + '/' + recordingId + '.webm')
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
          const recordAttributes = {
            content: url,
            latitude: 0,
            longitude: 0,
            nodeIdsToNodesMap,
            parentNodeId: null,
            title: 'Recording - ' + currNode.title,
            type: 'audio' as NodeType,
          }

          const transcribedAttr = {
            content: transcript,
            latitude: 0,
            longitude: 0,
            nodeIdsToNodesMap,
            parentNodeId: null,
            title: 'Transcription - ' + currNode.title,
            type: 'text' as NodeType,
          }
          const recordingNode = await createNodeFromModal(recordAttributes)
          if (interactionNode && recordingNode) {
            await FrontendNodeGateway.moveNode({
              newParentId: interactionNode.nodeId,
              nodeId: recordingNode.nodeId,
            })
          }
          const transcibedNode = await createNodeFromModal(transcribedAttr)
          if (transcibedNode && interactionNode) {
            await FrontendNodeGateway.moveNode({
              newParentId: interactionNode.nodeId,
              nodeId: transcibedNode.nodeId,
            })
          }
          recordingNode && setSelectedNode(recordingNode)

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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button
                icon={<ri.RiRecordCircleFill />}
                text="Record"
                onClick={startRecording}
                // style={customButtonStyle}
                className={`recordButton ${isrecording}`}
              />
              <Button
                icon={<ri.RiStopCircleFill />}
                text="Stop"
                onClick={stopRecording}
                style={customButtonStyle}
              />
            </div>
            {transcript.length > 0 ? (
              <div
                style={{
                  color: 'white',
                  backgroundColor: '#1C202A',
                  border: '2px solid black',
                  height: '100%',
                  width: '100%',
                  borderRadius: 5,
                  marginBottom: 50,
                  marginTop: 20,
                  padding: transcript.length == 0 ? 0 : 20,
                }}
              >
                <p>{transcript}</p>
              </div>
            ) : (
              <div></div>
            )}
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
