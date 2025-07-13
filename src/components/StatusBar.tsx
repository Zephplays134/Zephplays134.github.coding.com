import React from 'react'
import { motion } from 'framer-motion'
import { FileIcon, GitBranchIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'
import { FileItem } from '../types'
import AIStatusIndicator from './AIStatusIndicator'

interface StatusBarProps {
  activeFile: FileItem | undefined
  isAIActive?: boolean
  isAIConnected?: boolean
  onToggleAI?: () => void
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  activeFile, 
  isAIActive = false, 
  isAIConnected = false,
  onToggleAI
}) => {
  const getLanguageDisplay = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'jsx': 'JavaScript React',
      'ts': 'TypeScript',
      'tsx': 'TypeScript React',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'json': 'JSON',
      'md': 'Markdown',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'sql': 'SQL',
      'sh': 'Shell',
      'bash': 'Bash',
    }
    return languageMap[extension || ''] || 'Plain Text'
  }

  const getLineAndColumn = () => {
    // In a real implementation, this would get the cursor position from Monaco
    return { line: 1, column: 1 }
  }

  const { line, column } = getLineAndColumn()

  return (
    <motion.div 
      className="bg-void-900 border-t border-void-700 px-4 py-1 flex items-center justify-between text-xs"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <GitBranchIcon className="w-3 h-3 text-void-400" />
          <span className="text-void-300">main</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <CheckCircleIcon className="w-3 h-3 text-green-400" />
          <span className="text-void-300">No issues</span>
        </div>
        
        {onToggleAI && (
          <AIStatusIndicator
            isActive={isAIActive}
            isConnected={isAIConnected}
            onToggle={onToggleAI}
          />
        )}
      </div>

      <div className="flex items-center space-x-4">
        {activeFile && (
          <>
            <div className="flex items-center space-x-1">
              <FileIcon className="w-3 h-3 text-void-400" />
              <span className="text-void-300">{activeFile.name}</span>
            </div>
            
            <div className="text-void-300">
              Ln {line}, Col {column}
            </div>
            
            <div className="text-void-300">
              {getLanguageDisplay(activeFile.name)}
            </div>
            
            <div className="text-void-300">
              UTF-8
            </div>
          </>
        )}
        
        <div className="text-void-500 text-xs">
          Ctrl+K for commands
        </div>
      </div>
    </motion.div>
  )
}

export default StatusBar
