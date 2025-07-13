import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SearchIcon, 
  BotIcon, 
  CodeIcon, 
  SparklesIcon,
  FileIcon,
  RefreshCwIcon,
  ZapIcon,
  BookOpenIcon,
  BugIcon,
  XIcon,
  PlayIcon,
  SettingsIcon
} from 'lucide-react'
import { FileItem } from '../types'

interface AICommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  activeFile: FileItem | undefined
  onExecuteCommand: (command: string, args?: any) => void
}

interface Command {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: 'ai' | 'code' | 'file' | 'debug' | 'run' | 'system'
  shortcut?: string
  action: string
}

const AICommandPalette: React.FC<AICommandPaletteProps> = ({
  isOpen,
  onClose,
  activeFile,
  onExecuteCommand
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = [
    {
      id: 'run-compile',
      title: 'Compile & Run Code',
      description: 'AI-driven compilation and execution',
      icon: PlayIcon,
      category: 'run',
      shortcut: 'Ctrl+B',
      action: 'compile'
    },
    {
      id: 'ai-explain',
      title: 'AI: Explain Code',
      description: 'Get an explanation of the current code',
      icon: BotIcon,
      category: 'ai',
      shortcut: 'Ctrl+E',
      action: 'explain'
    },
    {
      id: 'ai-optimize',
      title: 'AI: Optimize Code',
      description: 'Get suggestions to optimize the code',
      icon: ZapIcon,
      category: 'ai',
      shortcut: 'Ctrl+O',
      action: 'optimize'
    },
    {
      id: 'ai-debug',
      title: 'AI: Debug Code',
      description: 'Help identify and fix issues',
      icon: BugIcon,
      category: 'ai',
      shortcut: 'Ctrl+D',
      action: 'debug'
    },
    {
      id: 'ai-generate',
      title: 'AI: Generate Code',
      description: 'Generate code based on description',
      icon: SparklesIcon,
      category: 'ai',
      shortcut: 'Ctrl+G',
      action: 'generate'
    },
    {
      id: 'file-save',
      title: 'Save File',
      description: 'Save the current file',
      icon: FileIcon,
      category: 'file',
      shortcut: 'Ctrl+S',
      action: 'save'
    },
    {
      id: 'system-settings',
      title: 'Open Settings',
      description: 'Adjust editor and UI settings',
      icon: SettingsIcon,
      category: 'system',
      action: 'settings-open'
    }
  ]

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchTerm])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  const executeCommand = (command: Command) => {
    onExecuteCommand(command.action, { command })
    onClose()
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai': return 'text-blue-400'
      case 'code': return 'text-green-400'
      case 'file': return 'text-yellow-400'
      case 'debug': return 'text-red-400'
      case 'run': return 'text-green-400'
      case 'system': return 'text-purple-400'
      default: return 'text-void-400'
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-void-900 border border-void-700 rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-void-700 bg-void-800">
          <div className="flex items-center space-x-3">
            <SearchIcon className="w-5 h-5 text-void-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-void-100 placeholder-void-400 focus:outline-none"
            />
            <button onClick={onClose} className="p-1 hover:bg-void-700 rounded transition-colors">
              <XIcon className="w-4 h-4 text-void-400" />
            </button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-void-400">No commands found</div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((command, index) => (
                <motion.div
                  key={command.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${index === selectedIndex ? 'bg-void-800 border border-void-600' : 'hover:bg-void-800/50'}`}
                  onClick={() => executeCommand(command)}
                >
                  <div className={`p-2 rounded ${getCategoryColor(command.category)} bg-void-800`}>
                    <command.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-void-100 truncate">{command.title}</h3>
                      {command.shortcut && <kbd className="px-2 py-1 bg-void-700 text-void-300 text-xs rounded">{command.shortcut}</kbd>}
                    </div>
                    <p className="text-sm text-void-400 truncate">{command.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border-t border-void-700 bg-void-850">
          <div className="flex items-center justify-between text-xs text-void-400">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Execute</span>
              <span>Esc Close</span>
            </div>
            <div className="flex items-center space-x-2">
              <BotIcon className="w-3 h-3" />
              <span>AI Commands</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AICommandPalette
