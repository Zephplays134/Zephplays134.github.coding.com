import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileIcon, 
  FolderIcon, 
  FolderOpenIcon,
  PlusIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  FileTextIcon,
  FolderPlusIcon
} from 'lucide-react'
import { FileItem, FolderContextMenu } from '../types'
import FolderContextMenuComponent from './FolderContextMenu'

interface SidebarProps {
  files: FileItem[]
  onFileSelect: (fileId: string) => void
  onNewFile: (parentId?: string) => void
  onNewFolder: (parentId?: string) => void
  onDeleteItem: (itemId: string) => void
  onRenameItem: (itemId: string, newName: string) => void
  onToggleFolder: (folderId: string) => void
  onToggleCollapse: () => void
}

interface TreeNode extends FileItem {
  childrenItems: TreeNode[]
}

const Sidebar: React.FC<SidebarProps> = ({
  files,
  onFileSelect,
  onNewFile,
  onNewFolder,
  onDeleteItem,
  onRenameItem,
  onToggleFolder,
  onToggleCollapse
}) => {
  const [contextMenu, setContextMenu] = useState<FolderContextMenu | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const fileTree = useMemo(() => {
    const itemMap = new Map<string, TreeNode>()
    files.forEach(file => itemMap.set(file.id, { ...file, childrenItems: [] }))

    const roots: TreeNode[] = []
    files.forEach(file => {
      if (file.parentId && itemMap.has(file.parentId)) {
        itemMap.get(file.parentId)!.childrenItems.push(itemMap.get(file.id)!)
      } else {
        roots.push(itemMap.get(file.id)!)
      }
    })

    const sortItems = (items: TreeNode[]): TreeNode[] => {
      items.forEach(item => {
        if (item.childrenItems.length > 0) {
          item.childrenItems = sortItems(item.childrenItems)
        }
      })
      return items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })
    }
    
    return sortItems(roots)
  }, [files])

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return item.isExpanded ? 
        <FolderOpenIcon className="w-4 h-4 text-blue-400" /> : 
        <FolderIcon className="w-4 h-4 text-blue-400" />
    }
    
    const extension = item.name.split('.').pop()?.toLowerCase()
    const iconMap: { [key: string]: string } = {
      'js': 'text-yellow-400',
      'jsx': 'text-blue-400',
      'ts': 'text-blue-600',
      'tsx': 'text-blue-600',
      'py': 'text-green-400',
      'css': 'text-blue-300',
      'html': 'text-orange-400',
      'json': 'text-yellow-300',
      'md': 'text-gray-400',
    }
    
    return <FileTextIcon className={`w-4 h-4 ${iconMap[extension || ''] || 'text-void-400'}`} />
  }

  const renderFileTree = (items: TreeNode[], level: number = 0): React.ReactNode => {
    return items.map((item) => (
      <div key={item.id}>
        <motion.div
          className={`
            flex items-center space-x-1 p-1 rounded cursor-pointer transition-colors group
            ${item.isActive && item.type === 'file'
              ? 'bg-void-800 text-void-50' 
              : 'text-void-300 hover:bg-void-800/50 hover:text-void-50'
            }
          `}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              itemId: item.id,
              type: item.type
            })
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: level * 0.05 }}
        >
          {item.type === 'folder' && (
            <button
              onClick={() => onToggleFolder(item.id)}
              className="p-1 hover:bg-void-700 rounded transition-colors"
            >
              {item.isExpanded ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
            </button>
          )}

          <div
            className="flex items-center space-x-2 flex-1 min-w-0"
            onClick={() => {
              if (item.type === 'file') {
                onFileSelect(item.id)
              } else {
                onToggleFolder(item.id)
              }
            }}
          >
            {getFileIcon(item)}
            {editingId === item.id ? (
              <input
                ref={editInputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => {
                  if (editingName.trim()) {
                    onRenameItem(item.id, editingName.trim())
                  }
                  setEditingId(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingName.trim()) {
                      onRenameItem(item.id, editingName.trim())
                    }
                    setEditingId(null)
                  } else if (e.key === 'Escape') {
                    setEditingId(null)
                  }
                }}
                className="flex-1 px-1 py-0.5 bg-void-700 text-void-100 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-sm truncate flex-1">{item.name}</span>
            )}
          </div>

          {item.type === 'file' && item.isModified && (
            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              setContextMenu({
                x: e.currentTarget.getBoundingClientRect().right,
                y: e.currentTarget.getBoundingClientRect().top,
                itemId: item.id,
                type: item.type
              })
            }}
            className="p-1 hover:bg-void-700 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontalIcon className="w-3 h-3" />
          </button>
        </motion.div>

        <AnimatePresence>
          {item.type === 'folder' && item.isExpanded && item.childrenItems && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderFileTree(item.childrenItems, level + 1)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ))
  }

  const startRename = (itemId: string, currentName: string) => {
    setEditingId(itemId)
    setEditingName(currentName)
    setContextMenu(null)
  }

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu) return

    switch (action) {
      case 'new-file':
        onNewFile(contextMenu.itemId)
        break
      case 'new-folder':
        onNewFolder(contextMenu.itemId)
        break
      case 'rename':
        const item = files.find(f => f.id === contextMenu.itemId)
        if (item) {
          startRename(contextMenu.itemId, item.name)
        }
        break
      case 'delete':
        onDeleteItem(contextMenu.itemId)
        break
    }
    setContextMenu(null)
  }

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

  return (
    <motion.div 
      className="w-64 bg-void-900 border-r border-void-700 flex flex-col relative"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4 border-b border-void-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderIcon className="w-5 h-5 text-void-400" />
          <h2 className="text-sm font-medium text-void-200">EXPLORER</h2>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onNewFile()}
            className="p-1 hover:bg-void-800 rounded transition-colors"
            title="New File (Ctrl+N)"
          >
            <PlusIcon className="w-4 h-4 text-void-400" />
          </button>
          <button
            onClick={() => onNewFolder()}
            className="p-1 hover:bg-void-800 rounded transition-colors"
            title="New Folder (Ctrl+Shift+N)"
          >
            <FolderPlusIcon className="w-4 h-4 text-void-400" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-void-800 rounded transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeftIcon className="w-4 h-4 text-void-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-2 space-y-1">
          {renderFileTree(fileTree)}
        </div>
      </div>

      <AnimatePresence>
        {contextMenu && (
          <FolderContextMenuComponent
            x={contextMenu.x}
            y={contextMenu.y}
            itemType={contextMenu.type}
            onAction={handleContextMenuAction}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      <div className="p-4 border-t border-void-700 text-center">
        <p className="text-xs text-void-500">Void Editor</p>
      </div>
    </motion.div>
  )
}

export default Sidebar
