import React from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '../../../Button'
import * as ri from 'react-icons/ri'
import * as ai from 'react-icons/ai'
import { background } from '@chakra-ui/react'

interface IEditorProps {
  editor: Editor | null
  onSave: () => void
}

export const TextMenu = (props: IEditorProps) => {
  const customButtonStyle = { height: 30, width: 30 }
  const { editor, onSave } = props
  if (!editor) {
    return null
  }

  // TODO: Add all of the functionality for a rich text editor!
  return (
    <div className="editor-wrapper">
      <Button
        icon={<ai.AiOutlineBold />}
        onClick={() => editor.chain().focus().toggleBold().run()}
        style={customButtonStyle}
        // disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive('bold') ? 'textEditorButton active' : 'textEditorButton'
        }
      />
      <Button
        icon={<ai.AiOutlineItalic />}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        style={customButtonStyle}
        // disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive('italic') ? 'textEditorButton active' : 'textEditorButton'
        }
      />
      <Button
        icon={<ai.AiOutlineStrikethrough />}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        style={customButtonStyle}
        // disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive('strike') ? 'textEditorButton active' : 'textEditorButton'
        }
      />
      <Button
        icon={<ai.AiFillHighlight />}
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#ccc7fd' }).run()}
        style={customButtonStyle}
        // disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive('highlight') ? 'textEditorButton active' : 'textEditorButton'
        }
      />
      <Button
        icon={<ai.AiOutlineUnderline />}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        style={customButtonStyle}
        // disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive('underline') ? 'textEditorButton active' : 'textEditorButton'
        }
      />
      <Button
        icon={<ai.AiFillSave />}
        onClick={() => onSave()}
        text="Save"
        className="saveButton"
        // disabled={!editor.can().chain().focus().toggleBold().run()}
      />
    </div>
  )
}
