import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MonacoEditor from '@monaco-editor/react'
import { 
  FileIcon, 
  XIcon, 
  MenuIcon, 
  SaveIcon, 
  SettingsIcon,
  PlayIcon
} from 'lucide-react'
import { FileItem } from '../types'

interface EditorProps {
  files: FileItem[]
  activeFile: FileItem | undefined
  onFileClose: (fileId: string) => void
  onFileContentChange: (fileId: string, content: string) => void
  onFileSelect: (fileId: string) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

const Editor: React.FC<EditorProps> = ({
  files,
  activeFile,
  onFileClose,
  onFileContentChange,
  onFileSelect,
  sidebarCollapsed,
  onToggleSidebar
}) => {
  const editorRef = useRef<any>(null)
  const openFiles = files.filter(file => file.isOpen)

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      onFileContentChange(activeFile.id, value)
    }
  }

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
    
    // Configure Monaco Editor theme
    editor.defineTheme('void-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '3b82f6' },
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'function', foreground: '8b5cf6' },
      ],
      colors: {
        'editor.background': '#020617',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.selectionBackground': '#334155',
        'editor.inactiveSelectionBackground': '#1e293b',
        'editorCursor.foreground': '#3b82f6',
        'editorWhitespace.foreground': '#475569',
        'editorIndentGuide.background': '#334155',
        'editorIndentGuide.activeBackground': '#475569',
      }
    })
    
    editor.setTheme('void-dark')
  }

  const getLanguageFromFilename = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
    }
    return languageMap[extension || ''] || 'plaintext'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-void-900 border-b border-void-700 flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          {sidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              className="p-1 hover:bg-void-800 rounded transition-colors"
              title="Show Sidebar"
            >
              <MenuIcon className="w-4 h-4 text-void-400" />
            </button>
          )}
          <h1 className="text-lg font-bold text-void-100">
            <span className="text-blue-400">void</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-void-800 rounded transition-colors">
            <SaveIcon className="w-4 h-4 text-void-400" />
          </button>
          <button className="p-2 hover:bg-void-800 rounded transition-colors">
            <PlayIcon className="w-4 h-4 text-void-400" />
          </button>
          <button className="p-2 hover:bg-void-800 rounded transition-colors">
            <SettingsIcon className="w-4 h-4 text-void-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-void-900 border-b border-void-700 flex overflow-x-auto scrollbar-thin">
        <AnimatePresence>
          {openFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={`
                flex items-center space-x-2 px-4 py-2 border-r border-void-700 cursor-pointer
                min-w-0 flex-shrink-0 transition-colors
                ${file.isActive 
                  ? 'bg-void-800 text-void-50' 
                  : 'text-void-300 hover:bg-void-800/50 hover:text-void-50'
                }
              `}
              onClick={() => onFileSelect(file.id)}
            >
              <FileIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate max-w-32">{file.name}</span>
              {file.isModified && (
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFileClose(file.id)
                }}
                className="p-1 hover:bg-void-700 rounded transition-colors flex-shrink-0"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {activeFile ? (
          <MonacoEditor
            height="100%"
            defaultLanguage={getLanguageFromFilename(activeFile.name)}
            language={getLanguageFromFilename(activeFile.name)}
            value={activeFile.content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              lineHeight: 1.5,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
              smoothScrolling: true,
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'gutter',
              selectionHighlight: false,
              occurrencesHighlight: false,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileIcon className="w-16 h-16 text-void-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-void-300 mb-2">No file open</h3>
              <p className="text-void-500">Select a file from the sidebar to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Editor
