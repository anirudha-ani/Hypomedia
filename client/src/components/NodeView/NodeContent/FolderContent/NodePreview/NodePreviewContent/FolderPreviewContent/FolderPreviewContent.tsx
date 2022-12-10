import React from 'react'
import './FolderPreviewContent.scss'

/** The content of an image node, including any anchors */
export const FolderPreviewContent = () => {
  /**
   * Return the preview container if we are rendering an image preview
   */
  return (
    <div className="imageContent-preview">
      <img src="https://drive.google.com/uc?export=view&id=1IDVbf7vDZ_gGP0WxMvPPm8EsqNvh7yow" />
    </div>
  )
}
