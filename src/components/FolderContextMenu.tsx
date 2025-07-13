import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileTextIcon, 
  FolderPlusIcon, 
  EditIcon, 
  TrashIcon,
  CopyIcon,
  ScissorsIcon
} from 'lucide-react'

interface FolderContextMenuProps {
  x: number
  y: number
  itemType: 'file' | 'folder'
  onAction: (action: string) => void
  onClose: () => void
}

const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  x,
  y,
  itemType,
  onAction,
  onClose
}) => {
  const menuItems = [
    {
      id: 'new-file',
      label: 'New File',
      icon: FileTextIcon,
      shortcut: 'Ctrl+N',
      show: itemType === 'folder'
    },
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: FolderPlusIcon,
      shortcut: 'Ctrl+Shift+N',
      show: itemType === 'folder'
    },
    {
      id: 'separator1',
      label: '',
      icon: null,
      show: itemType === 'folder'
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: EditIcon,
      shortcut: 'F2',
      show: true
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: CopyIcon,
      shortcut: 'Ctrl+C',
      show: true
    },
    {
      id: 'cut',
      label: 'Cut',
      icon: ScissorsIcon,
      shortcut: 'Ctrl+X',
      show: true
    },
    {
      id: 'separator2',
      label: '',
      icon: null,
      show: true
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: TrashIcon,
      shortcut: 'Del',
      show: true,
      dangerous: true
    }
  ]

  const visibleItems = menuItems.filter(item => item.show)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bg-void-800 border border-void-600 rounded-lg shadow-2xl py-1 z-50 min-w-48"
      style={{ 
        left: Math.min(x, window.innerWidth - 200),
        top: Math.min(y, window.innerHeight - 200)
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {visibleItems.map((item) => {
        if (item.id.startsWith('separator')) {
          return (
            <div key={item.id} className="h-px bg-void-600 mx-2 my-1" />
          )
        }

        return (
          <button
            key={item.id}
            onClick={() => onAction(item.id)}
            className={`
              w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
              ${item.dangerous 
                ? 'text-red-400 hover:bg-red-600/20' 
                : 'text-void-200 hover:bg-void-700'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </div>
            {item.shortcut && (
              <kbd className="px-1 py-0.5 bg-void-700 text-void-400 text-xs rounded">
                {item.shortcut}
              </kbd>
            )}
          </button>
        )
      })}
    </motion.div>
  )
}

export default FolderContextMenu
