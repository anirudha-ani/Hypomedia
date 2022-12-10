import React from 'react'
import './AudioPreviewContent.scss'

/** The content of an image node, including any anchors */
export const AudioPreviewContent = () => {
  /**
   * Return the preview container if we are rendering an image preview
   */
  return (
    <div className="imageContent-preview">
      <img src="https://drive.google.com/uc?export=view&id=1aGfegr-kntwelR1fN0wZVo30aUAtdtqB" />
    </div>
  )
}
