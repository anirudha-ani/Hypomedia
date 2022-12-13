import React, { useState } from 'react'
import * as ri from 'react-icons/ri'
import { FrontendAnchorGateway } from '../../../../anchors'
import { FrontendLinkGateway } from '../../../../links'
import { Extent, IAnchor, ILink, INode } from '../../../../types'
import { ContextMenuItems } from '../../../ContextMenu'
import { getImagePreview } from '../nodeLinkMenuUtils'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  refreshState,
  selectedAnchorsState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  currentNodeState,
} from '../../../../global/Atoms'
import './AnchorItem.scss'
import Geocode from 'react-geocode'

export interface IAnchorItemProps {
  linkItems: any
  anchorsMap: {
    [anchorId: string]: {
      anchor: IAnchor
      links: { link: ILink; oppNode: INode; oppAnchor: IAnchor }[]
    }
  }
  anchorId: string
  extent: Extent | null
  isAnchorSelected: boolean
}

export const AnchorItem = (props: IAnchorItemProps) => {
  const { extent, isAnchorSelected, linkItems, anchorsMap, anchorId } = props
  const currentNode = useRecoilValue(currentNodeState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [selectedAnchors, setSelectedAnchors] = useRecoilState(selectedAnchorsState)
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [city, setCity] = useState('')

  const handleAnchorDelete = async (anchorId: string) => {
    const anchorLinks = anchorsMap[anchorId].links
    const linkIds: string[] = []
    anchorLinks.forEach((anchorLink) => {
      linkIds.push(anchorLink.link.linkId)
    })
    const deleteLinksResp = await FrontendLinkGateway.deleteLinks(linkIds)
    if (!deleteLinksResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Delete links failed')
      setAlertMessage(deleteLinksResp.message)
    }

    const deleteAnchorResp = await FrontendAnchorGateway.deleteAnchor(anchorId)
    if (!deleteAnchorResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Delete anchors failed')
      setAlertMessage(deleteAnchorResp.message)
    }
    setRefresh(!refresh)
  }

  /* Method called on link right click */
  const handleAnchorRightClick = () => {
    // Open custom context menu
    ContextMenuItems.splice(1, ContextMenuItems.length)
    const menuItem: JSX.Element = (
      <div
        key={'anchorDelete'}
        className="contextMenuItem"
        onClick={(e) => {
          ContextMenuItems.splice(0, ContextMenuItems.length)
          handleAnchorDelete(anchorId)
        }}
      >
        <div className="itemText" style={{ color: 'white' }}>
          <ri.RiDeleteBin6Line />
          Delete anchor
        </div>
      </div>
    )
    ContextMenuItems.push(menuItem)
  }

  const getCity = (lat: number, lng: number) => {
    Geocode.setApiKey('AIzaSyB8iT3_3yLhvU-5LPl6kHHi63H7yKMW-So')
    Geocode.setLanguage('en')
    Geocode.setRegion('es')
    Geocode.setLocationType('ROOFTOP')
    Geocode.enableDebug()

    // Get address from latitude & longitude.

    Geocode.fromLatLng(String(lat), String(lng)).then(
      (response: any) => {
        for (let i = 0; i < response.results[0].address_components.length; i++) {
          for (
            let j = 0;
            j < response.results[0].address_components[i].types.length;
            j++
          ) {
            switch (response.results[0].address_components[i].types[j]) {
              case 'locality':
                const cityVar = response.results[0].address_components[i].long_name
                setCity(cityVar)
                break
            }
          }
        }
      },
      (error: any) => {
        console.error(error)
      }
    )
  }

  return (
    <div
      className={`anchorItemMenu ${isAnchorSelected ? 'selected' : ''}`}
      key={anchorId}
      onContextMenu={handleAnchorRightClick}
      onClick={() => {
        if (selectedAnchors[0]?.anchorId === anchorId) {
          setSelectedAnchors([])
        } else {
          setSelectedAnchors([anchorsMap[anchorId].anchor])
        }
      }}
    >
      <div className="anchorPreview">
        {extent !== null
          ? (console.log(extent.type),
            extent.type == 'text' && (
              <div className="anchorPreview-text">{'"' + extent.text + '"'}</div>
            ))
          : (console.log('NULL EXTENT'),
            (<div className="anchorPreview-text">{currentNode.title}</div>))}
        {extent?.type == 'image' && (
          <div className="anchorPreview-image">
            {getImagePreview(currentNode.content, extent, 40, 40)}
          </div>
        )}
        {extent?.type == 'audio' && (
          <div className="anchorPreview-text">
            {extent.timeStamp ? extent.timeStamp : 'Audio'}
          </div>
        )}
        {extent?.type == 'geo' &&
          (console.log(extent.type, extent.lat),
          (
            <div className="anchorPreview-text">
              {extent.lat && extent.lng ? (
                <div>
                  {getCity(extent.lat, extent.lng)}
                  {city}
                </div>
              ) : (
                'Geo'
              )}
            </div>
          ))}
      </div>
      {linkItems}
    </div>
  )
}
