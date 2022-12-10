import React from 'react'
import './GeoPreviewContent.scss'

/** The content of an image node, including any anchors */
export const GeoPreviewContent = () => {
  /**
   * Return the preview container if we are rendering an image preview
   */
  return (
    <div className="imageContent-preview">
      <img src="https://www.geospatialworld.net/wp-content/uploads/2020/02/ipgq.png" />
    </div>
  )
}
