import React from 'react'
import { motion } from 'framer-motion'
import { FileIcon, FolderIcon, PlusIcon, ChevronLeftIcon } from 'lucide-react'
import { FileItem } from '../types'

interface SidebarProps {
  files: FileItem[]
  onFileSelect: (fileId: string) => void
  onNewFile: () => void
  onToggleCollapse: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  files,
  onFileSelect,
  onNewFile,
  onToggleCollapse
}) => {
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    return <FileIcon className="w-4 h-4" />
  }

  return (
    <motion.div 
      className="w-64 bg-void-900 border-r border-void-700 flex flex-col"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-void-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderIcon className="w-5 h-5 text-void-400" />
          <h2 className="text-sm font-medium text-void-200">EXPLORER</h2>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onNewFile}
            className="p-1 hover:bg-void-800 rounded transition-colors"
            title="New File"
          >
            <PlusIcon className="w-4 h-4 text-void-400" />
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

      {/* File List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-2 space-y-1">
          {files.map((file) => (
            <motion.div
              key={file.id}
              className={`
                flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors
                ${file.isActive 
                  ? 'bg-void-800 text-void-50' 
                  : 'text-void-300 hover:bg-void-800/50 hover:text-void-50'
                }
              `}
              onClick={() => onFileSelect(file.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {getFileIcon(file.name)}
              <span className="text-sm truncate flex-1">{file.name}</span>
              {file.isModified && (
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-void-700 text-center">
        <p className="text-xs text-void-500">Void Editor</p>
      </div>
    </motion.div>
  )
}

export default Sidebar
