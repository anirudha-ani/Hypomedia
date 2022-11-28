import React from 'react'
import { Editor } from '@tiptap/react'
import { background } from '@chakra-ui/react'

interface IEditorProps {
  editor: Editor | null
  onSave: () => void
}

export const TextMenu = (props: IEditorProps) => {
  const { editor, onSave } = props
  if (!editor) {
    return null
  }

  // TODO: Add all of the functionality for a rich text editor!
  return (
    <div id="textMenu">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          editor.isActive('bold') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive('italic') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        Italic
      </button>
      {/* Documentation related to this implementation- https://tiptap.dev/api/marks/strike */}
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={
          editor.isActive('strike') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        StrikeThrough
      </button>
      {/*   // It was taken from the documentation found here - https://tiptap.dev/api/marks/code */}
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={
          editor.isActive('code') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        Codes
      </button>
      {/* This is taken from the documentation found here - https://tiptap.dev/api/nodes/blockquote */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive('blockquote') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        Blockquote
      </button>

      <button onClick={() => onSave()} className={'saveButton'}>
        Save
      </button>
    </div>
  )
}
