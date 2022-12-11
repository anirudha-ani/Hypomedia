import React from 'react'
import { INode } from '../../types'
import { RecursiveNodeTree } from '../../types/RecursiveNodeTree'
import { TreeViewItem } from './TreeViewItem'
import './TreeView.scss'

export interface ITreeViewProps {
  changeUrlOnClick?: boolean
  roots: RecursiveNodeTree[]
  parentNode: INode | null
  setParentNode: (node: INode) => void
  create?: boolean
}

export const TreeView = (props: ITreeViewProps) => {
  const { roots, parentNode, setParentNode, changeUrlOnClick = true, create } = props
  return (
    <div className={`treeView-wrapper ${create}`}>
      {roots.map((tree: RecursiveNodeTree) => (
        <TreeViewItem
          node={tree.node}
          parentNode={parentNode}
          setParentNode={setParentNode}
          key={tree.node.nodeId}
          type={tree.node.type}
          title={tree.node.title}
          childNodes={tree.children}
          changeUrlOnClick={changeUrlOnClick}
        />
      ))}
    </div>
  )
}
