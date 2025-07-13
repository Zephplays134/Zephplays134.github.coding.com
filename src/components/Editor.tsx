import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MonacoEditor from '@monaco-editor/react'
import { 
  FileIcon, 
  XIcon, 
  MenuIcon, 
  SaveIcon, 
  SettingsIcon,
  PlayIcon,
  BotIcon,
  CommandIcon,
  EyeIcon,
  EyeOffIcon
} from 'lucide-react'
import { FileItem, EditorAction, Theme } from '../types'
import { getLanguageFromFilename } from '../utils/fileUtils'
import { useCodeCompletion } from '../hooks/useCodeCompletion'

interface EditorProps {
  files: FileItem[]
  activeFile: FileItem | undefined
  onFileClose: (fileId: string) => void
  onFileContentChange: (fileId: string, content: string) => void
  onFileSelect: (fileId: string) => void
  onFileSave: (fileId: string) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  isAIActive?: boolean
  onToggleAI?: () => void
  onOpenAIAssistant?: () => void
  onOpenCommandPalette?: () => void
  isPreviewOpen: boolean
  onTogglePreview: () => void
  onCompile: () => void
  editorAction: EditorAction
  onEditorActionComplete: () => void
  theme: Theme
  onOpenSettings: () => void
  onSelectionChange: (selection: string) => void
}

const Editor: React.FC<EditorProps> = ({
  files,
  activeFile,
  onFileClose,
  onFileContentChange,
  onFileSelect,
  onFileSave,
  sidebarCollapsed,
  onToggleSidebar,
  isAIActive = false,
  onToggleAI,
  onOpenAIAssistant,
  onOpenCommandPalette,
  isPreviewOpen,
  onTogglePreview,
  onCompile,
  editorAction,
  onEditorActionComplete,
  theme,
  onOpenSettings,
  onSelectionChange
}) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const openFiles = files.filter(file => file.isOpen)
  const { getCompletion } = useCodeCompletion()

  useEffect(() => {
    if (editorAction && editorRef.current && monacoRef.current) {
      const editor = editorRef.current
      const monaco = monacoRef.current
      
      if (editorAction.type === 'insert') {
        const position = editor.getPosition()
        editor.executeEdits('ai-assistant', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: editorAction.code
        }])
      } else if (editorAction.type === 'replace') {
        const selection = editor.getSelection()
        if (selection) {
          editor.executeEdits('ai-assistant', [{
            range: selection,
            text: editorAction.code
          }])
        }
      }
      
      onEditorActionComplete()
      editor.focus()
    }
  }, [editorAction, onEditorActionComplete])

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'void-dark' : 'void-light')
    }
  }, [theme])

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      onFileContentChange(activeFile.id, value)
    }
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getModel()?.getValueInRange(editor.getSelection())
      onSelectionChange(selection || '')
    })
    
    monaco.editor.defineTheme('void-dark', {
      base: 'vs-dark', inherit: true,
      rules: [],
      colors: { 'editor.background': '#020617' }
    })

    monaco.editor.defineTheme('void-light', {
      base: 'vs', inherit: true,
      rules: [],
      colors: { 'editor.background': '#ffffff' }
    })
    
    monaco.editor.setTheme(theme === 'dark' ? 'void-dark' : 'void-light')

    // Register Inline Completion Provider for AI suggestions
    monaco.languages.registerInlineCompletionsProvider({ pattern: '**' }, {
      provideInlineCompletions: async (model: any, position: any) => {
        if (!isAIActive) return;
        const suggestion = getCompletion(model, position);
        if (!suggestion) return;
        
        return {
          items: [{
            insertText: suggestion,
            // Make the suggestion appear as ghost text
            range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column + suggestion.length),
          }]
        };
      },
      freeInlineCompletions: () => {}
    });

    // Command to accept the completion
    editor.addCommand(monaco.KeyCode.Tab, () => {
      editor.trigger('keyboard', 'acceptAndFixTabStops', {});
    }, '!suggestWidgetVisible');
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-void-950">
      <div className="bg-void-100 dark:bg-void-900 border-b border-void-200 dark:border-void-700 flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          {sidebarCollapsed && (
            <button onClick={onToggleSidebar} className="p-1 hover:bg-void-200 dark:hover:bg-void-800 rounded transition-colors" title="Show Sidebar">
              <MenuIcon className="w-4 h-4 text-void-600 dark:text-void-400" />
            </button>
          )}
          <h1 className="text-lg font-bold text-void-800 dark:text-void-100">
            <span className="text-blue-500">void</span>
            {isAIActive && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">AI</span>}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button onClick={onCompile} className="p-2 hover:bg-void-200 dark:hover:bg-void-800 rounded transition-colors" title="Compile & Run (Ctrl+B)">
            <PlayIcon className="w-4 h-4 text-green-500" />
          </button>
          <button onClick={onTogglePreview} className="p-2 hover:bg-void-200 dark:hover:bg-void-800 rounded transition-colors" title={isPreviewOpen ? "Hide Preview" : "Show Preview"}>
            {isPreviewOpen ? <EyeOffIcon className="w-4 h-4 text-void-600 dark:text-void-400" /> : <EyeIcon className="w-4 h-4 text-void-600 dark:text-void-400" />}
          </button>
          <button onClick={onOpenCommandPalette} className="p-2 hover:bg-void-200 dark:hover:bg-void-800 rounded transition-colors" title="Command Palette (Ctrl+K)">
            <CommandIcon className="w-4 h-4 text-void-600 dark:text-void-400" />
          </button>
          <button onClick={onOpenAIAssistant} className={`p-2 hover:bg-void-200 dark:hover:bg-void-800 rounded transition-colors ${isAIActive ? 'bg-blue-600 text-white' : ''}`} title="AI Assistant">
            <BotIcon className="w-4 h-4" />
          </button>
          <button onClick={() => activeFile && onFileSave(activeFile.id)} className="p-2 hover:bg-void-200 dark:hover:bg-void-800 rounded transition-colors" title="Save File (Ctrl+S)">
            <SaveIcon className="w-4 h-4 text-void-600 dark:text-void-400" />
          </button>
          <button onClick={onOpenSettings} className="p-2 hover:bg-void-200 dark:hover:bg-void-800 rounded transition-colors" title="Settings">
            <SettingsIcon className="w-4 h-4 text-void-600 dark:text-void-400" />
          </button>
        </div>
      </div>

      <div className="bg-void-100 dark:bg-void-900 border-b border-void-200 dark:border-void-700 flex overflow-x-auto scrollbar-thin">
        <AnimatePresence>
          {openFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={`flex items-center space-x-2 px-4 py-2 border-r border-void-200 dark:border-void-700 cursor-pointer min-w-0 flex-shrink-0 transition-colors ${file.isActive ? 'bg-white dark:bg-void-800 text-void-800 dark:text-void-50' : 'text-void-500 dark:text-void-300 hover:bg-void-200/50 dark:hover:bg-void-800/50 hover:text-void-800 dark:hover:text-void-50'}`}
              onClick={() => onFileSelect(file.id)}
            >
              <FileIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate max-w-32">{file.name}</span>
              {file.isModified && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />}
              <button onClick={(e) => { e.stopPropagation(); onFileClose(file.id); }} className="p-1 hover:bg-void-300 dark:hover:bg-void-700 rounded transition-colors flex-shrink-0">
                <XIcon className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex-1 relative">
        {activeFile ? (
          <MonacoEditor
            height="100%"
            path={activeFile.path}
            defaultLanguage={getLanguageFromFilename(activeFile.name)}
            language={getLanguageFromFilename(activeFile.name)}
            value={activeFile.content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              inlineSuggest: { enabled: true } // Enable inline suggestions
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileIcon className="w-16 h-16 text-void-300 dark:text-void-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-void-700 dark:text-void-300 mb-2">No file open</h3>
              <p className="text-void-500 dark:text-void-500">Select a file from the sidebar to start editing</p>
              <p className="text-void-400 dark:text-void-600 text-sm mt-2">Press Ctrl+K for commands</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Editor
