import React from 'react'
import './FolderPreviewContent.scss'

interface IFolderPreviewProps {
  user: any
}

/** The content of an image node, including any anchors */
export const FolderPreviewContent = ({ user }: IFolderPreviewProps) => {
  /**
   * Return the preview container if we are rendering an image preview
   */
  return !user ? (
    <div className="imageContent-preview">
      <img src="https://drive.google.com/uc?export=view&id=1IDVbf7vDZ_gGP0WxMvPPm8EsqNvh7yow" />
    </div>
  ) : (
    <div className="imageContent-preview">
      <img src="https://img.freepik.com/free-vector/people-avatars-round-icons-with-faces-portraits_107791-11877.jpg?w=2000&t=st=1670699776~exp=1670700376~hmac=f337786c2c7b4cddba7f8ab789b51cf25b96a0bd22978d9bcd894d675a7b475d" />
    </div>
  )
}
