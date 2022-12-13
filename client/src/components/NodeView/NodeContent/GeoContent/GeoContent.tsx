/* global google */
/* eslint-disable no-undef */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as fa from 'react-icons/fa'
import * as ri from 'react-icons/ri'
import { fetchLinks } from '..'
import { useHistory } from 'react-router-dom'
import { INodeContentProps } from '../NodeContent'
import { apiKey } from '../../../../global/globalUtils'
import './GeoContent.scss'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
import { GoogleMap, useLoadScript, Marker, useJsApiLoader } from '@react-google-maps/api'
import {
  selectedNodeState,
  selectedAnchorsState,
  alertMessageState,
  alertOpenState,
  alertTitleState,
  selectedExtentState,
  currentNodeState,
  refreshState,
  startAnchorState,
  refreshLinkListState,
  isLinkingState,
} from '../../../../global/Atoms'
import { Extent } from '../../../../types'
import './GeoContent.scss'
import { type } from 'os'

interface IGeoContentProps {}

/** The content of an audio/video node, including any anchors */
// eslint-disable-next-line react/display-name
export const GeoContent = React.memo(() => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  })

  const [map, setMap] = React.useState(null)
  const currentNode = useRecoilValue(currentNodeState)
  const [selectedExtent, setSelectedExtent] = useRecoilState(selectedExtentState)
  const latitude = currentNode.latitude
  const longitude = currentNode.longitude
  const center = { lat: latitude, lng: longitude }
  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center)
    map.fitBounds(bounds)

    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  useEffect(() => {
    const selectedExtent: Extent = {
      type: 'geo',
      lat: latitude,
      lng: longitude,
    }

    setSelectedExtent(selectedExtent)
  }, [isLinkingState])

  return isLoaded ? (
    <GoogleMap mapContainerClassName="map-container" zoom={15} center={center}>
      <Marker position={center}></Marker>
    </GoogleMap>
  ) : (
    <div></div>
  )
})
