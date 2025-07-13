import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorBoundary from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import StatusBar from './components/StatusBar'
import AIAssistant from './components/AIAssistant'
import AICommandPalette from './components/AICommandPalette'
import Preview from './components/Preview'
import ResizablePanel from './components/ResizablePanel'
import CompilationOutput from './components/CompilationOutput'
import SettingsPanel from './components/SettingsPanel'
import { FileItem, EditorAction, Theme } from './types'
import { useAIFeatures } from './hooks/useAIFeatures'
import { useFileManager } from './hooks/useFileManager'
import { useToasts } from './hooks/useToasts'

const initialFiles: FileItem[] = [
  {
    id: '1',
    name: 'src',
    path: 'src',
    content: '',
    language: '',
    type: 'folder',
    isOpen: false,
    isActive: false,
    isModified: false,
    children: ['2', '6', '7', '3'],
    isExpanded: true,
    level: 0
  },
  {
    id: '2',
    name: 'index.html',
    path: 'src/index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Welcome to Void Live Preview!</h1>
  <p>Edit this HTML file or the linked CSS and JS files to see changes in real-time.</p>
  <button id="myButton">Click Me</button>
  <script type="module" src="script.js"></script>
</body>
</html>`,
    language: 'html',
    type: 'file',
    isOpen: true,
    isActive: true,
    isModified: false,
    parentId: '1',
    level: 1
  },
  {
    id: '6',
    name: 'style.css',
    path: 'src/style.css',
    content: `body {
  font-family: sans-serif;
  text-align: center;
  padding: 2rem;
  transition: background-color 0.3s, color 0.3s;
}

h1 {
  color: #63b3ed;
}

button {
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #3182ce;
}`,
    language: 'css',
    type: 'file',
    isOpen: true,
    isActive: false,
    isModified: false,
    parentId: '1',
    level: 1
  },
  {
    id: '7',
    name: 'script.js',
    path: 'src/script.js',
    content: `const button = document.getElementById('myButton');
let count = 0;

button.addEventListener('click', () => {
  count++;
  button.textContent = \`Clicked \${count} times\`;
});

console.log("Script loaded successfully!");`,
    language: 'javascript',
    type: 'file',
    isOpen: true,
    isActive: false,
    isModified: false,
    parentId: '1',
    level: 1
  },
  {
    id: '3',
    name: 'components',
    path: 'src/components',
    content: '',
    language: '',
    type: 'folder',
    isOpen: false,
    isActive: false,
    isModified: false,
    parentId: '1',
    children: ['5'],
    isExpanded: false,
    level: 1
  },
  {
    id: '4',
    name: 'utils',
    path: 'src/utils',
    content: '',
    language: '',
    type: 'folder',
    isOpen: false,
    isActive: false,
    isModified: false,
    parentId: '1',
    children: [],
    isExpanded: false,
    level: 1
  },
  {
    id: '5',
    name: 'App.tsx',
    path: 'src/components/App.tsx',
    content: `import React from 'react';

interface Props {
  title: string;
}

const App: React.FC<Props> = ({ title }) => {
  console.log('Rendering App component');
  return (
    <div className="app">
      <h1>{title}</h1>
      <p>Welcome to your new React component!</p>
    </div>
  );
};

export default App;`,
    language: 'typescript',
    type: 'file',
    isOpen: false,
    isActive: false,
    isModified: false,
    parentId: '3',
    level: 2
  }
]

const App: React.FC = () => {
  const {
    files,
    setFiles,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    toggleFolder
  } = useFileManager(initialFiles)

  const [activeFileId, setActiveFileId] = useState<string>('2')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(true)
  const [isCompilationPanelOpen, setIsCompilationPanelOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const [editorAction, setEditorAction] = useState<EditorAction>(null)
  const [selectionText, setSelectionText] = useState<string>('')
  const { addToast } = useToasts()
  
  const {
    isAIAssistantOpen,
    isCommandPaletteOpen,
    isAIActive,
    isAIConnected,
    compilationResult,
    setCompilationResult,
    toggleAIAssistant,
    closeAIAssistant,
    toggleCommandPalette,
    closeCommandPalette,
    toggleAIActive,
    executeAICommand,
    compileCode
  } = useAIFeatures()

  const activeFile = files.find(file => file.id === activeFileId)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const handleFileSave = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isModified: false }
        : file
    ))
    const savedFile = files.find(f => f.id === fileId);
    if (savedFile) {
      addToast(`Saved ${savedFile.name}`, 'success');
    }
  }, [files, addToast, setFiles])

  const handleCompile = useCallback(() => {
    if (activeFile) {
      setIsCompilationPanelOpen(true)
      compileCode(activeFile)
    }
  }, [activeFile, compileCode])

  const handleNewFile = useCallback((parentId?: string) => {
    const fileName = prompt('Enter file name:')
    if (fileName) {
      const newFileId = createFile(fileName, parentId)
      setActiveFileId(newFileId)
    }
  }, [createFile])

  const handleNewFolder = useCallback((parentId?: string) => {
    const folderName = prompt('Enter folder name:')
    if (folderName) {
      createFolder(folderName, parentId)
    }
  }, [createFolder])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault()
          if (activeFile) {
            handleFileSave(activeFile.id)
          }
          return
        }

        if (isEditing) return

        switch (e.key) {
          case 'k': e.preventDefault(); toggleCommandPalette(); break
          case 'b': e.preventDefault(); handleCompile(); break
          case 'e': e.preventDefault(); executeAICommand('explain'); break
          case 'o': e.preventDefault(); executeAICommand('optimize'); break
          case 'd': e.preventDefault(); executeAICommand('debug'); break
          case 'g': e.preventDefault(); executeAICommand('generate'); break
          case 'n': e.preventDefault(); e.shiftKey ? handleNewFolder() : handleNewFile(); break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    activeFile, 
    toggleCommandPalette, 
    executeAICommand, 
    handleFileSave, 
    handleCompile, 
    handleNewFile, 
    handleNewFolder
  ])

  const handleFileSelect = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file && file.type === 'file') {
      setActiveFileId(fileId)
      setFiles(prev => prev.map(f => ({
        ...f,
        isActive: f.id === fileId,
        isOpen: f.id === fileId ? true : f.isOpen
      })))
    }
  }

  const handleFileClose = (fileId: string) => {
    setFiles(prev => {
      const updatedFiles = prev.map(file => 
        file.id === fileId ? { ...file, isOpen: false, isActive: false } : file
      )
      
      if (fileId === activeFileId) {
        const openFiles = updatedFiles.filter(f => f.isOpen && f.type === 'file')
        const currentActiveIndex = openFiles.findIndex(f => f.id === fileId)
        
        let nextActiveFile = openFiles[currentActiveIndex -1] || openFiles[0]

        if (nextActiveFile) {
          setActiveFileId(nextActiveFile.id)
          return updatedFiles.map(file => ({
            ...file,
            isActive: file.id === nextActiveFile.id
          }))
        } else {
          setActiveFileId('')
        }
      }
      
      return updatedFiles
    })
  }

  const handleFileContentChange = (fileId: string, content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, content, isModified: true }
        : file
    ))
  }

  const handleDeleteItem = (itemId: string) => {
    const item = files.find(f => f.id === itemId)
    if (item && confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItem(itemId)
      if (activeFileId === itemId) {
        setActiveFileId('')
      }
    }
  }

  const handleInsertCode = useCallback((code: string) => {
    setEditorAction({ type: 'insert', code })
  }, [])
  
  const handleReplaceCode = useCallback((code: string) => {
    setEditorAction({ type: 'replace', code })
  }, [])

  const handleAICommandExecution = (command: string, args?: any) => {
    if (command === 'settings-open') {
      setIsSettingsOpen(true);
      return;
    }

    const result = executeAICommand(command, { ...args, file: activeFile })
    
    if (command.startsWith('ai-') || ['explain', 'optimize', 'debug', 'refactor', 'generate', 'document'].includes(command)) {
      if (!isAIAssistantOpen) {
        toggleAIAssistant()
      }
    }
    
    return result
  }

  return (
    <ErrorBoundary>
      <div className="editor-container bg-white dark:bg-void-950 text-void-900 dark:text-void-50 flex flex-col h-screen">
        <div className="flex flex-1 overflow-hidden">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Sidebar
                  files={files}
                  onFileSelect={handleFileSelect}
                  onNewFile={handleNewFile}
                  onNewFolder={handleNewFolder}
                  onDeleteItem={handleDeleteItem}
                  onRenameItem={renameItem}
                  onToggleFolder={toggleFolder}
                  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <ResizablePanel>
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <div className="flex flex-col flex-1 min-h-0">
                <Editor
                  files={files}
                  activeFile={activeFile}
                  onFileClose={handleFileClose}
                  onFileContentChange={handleFileContentChange}
                  onFileSelect={handleFileSelect}
                  onFileSave={handleFileSave}
                  sidebarCollapsed={sidebarCollapsed}
                  onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                  isAIActive={isAIActive}
                  onToggleAI={toggleAIActive}
                  onOpenAIAssistant={toggleAIAssistant}
                  onOpenCommandPalette={toggleCommandPalette}
                  isPreviewOpen={isPreviewOpen}
                  onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
                  onCompile={handleCompile}
                  editorAction={editorAction}
                  onEditorActionComplete={() => setEditorAction(null)}
                  theme={theme}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onSelectionChange={setSelectionText}
                />
                <AnimatePresence>
                  {isCompilationPanelOpen && (
                    <CompilationOutput
                      result={compilationResult}
                      onClose={() => setIsCompilationPanelOpen(false)}
                      onClear={() => setCompilationResult(null)}
                      onRerun={handleCompile}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
            {isPreviewOpen && (
              <div className="flex-1 flex flex-col min-w-0 h-full">
                <Preview files={files} />
              </div>
            )}
          </ResizablePanel>
        </div>
        
        <StatusBar 
          activeFile={activeFile}
          isAIActive={isAIActive}
          isAIConnected={isAIConnected}
          onToggleAI={toggleAIActive}
        />
        
        <AnimatePresence>
          {isAIAssistantOpen && (
            <AIAssistant
              isOpen={isAIAssistantOpen}
              onClose={closeAIAssistant}
              activeFile={activeFile}
              onInsertCode={handleInsertCode}
              onReplaceCode={handleReplaceCode}
              selectionText={selectionText}
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isCommandPaletteOpen && (
            <AICommandPalette
              isOpen={isCommandPaletteOpen}
              onClose={closeCommandPalette}
              activeFile={activeFile}
              onExecuteCommand={handleAICommandExecution}
            />
          )}
        </AnimatePresence>

        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
