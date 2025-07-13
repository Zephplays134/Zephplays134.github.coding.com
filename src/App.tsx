import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import StatusBar from './components/StatusBar'
import { FileItem } from './types'

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'welcome.md',
      path: 'welcome.md',
      content: `# Welcome to Void
      
A modern, sleek code editor built with React and Monaco Editor.

## Features
- Syntax highlighting for multiple languages
- Dark theme optimized for long coding sessions
- File management system
- Real-time editing
- Responsive design

Start coding by creating a new file or editing this one!`,
      language: 'markdown',
      isOpen: true,
      isActive: true,
      isModified: false
    }
  ])

  const [activeFileId, setActiveFileId] = useState<string>('1')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const activeFile = files.find(file => file.id === activeFileId)

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId)
    setFiles(prev => prev.map(file => ({
      ...file,
      isActive: file.id === fileId,
      isOpen: true
    })))
  }

  const handleFileClose = (fileId: string) => {
    setFiles(prev => {
      const updatedFiles = prev.map(file => 
        file.id === fileId ? { ...file, isOpen: false, isActive: false } : file
      )
      
      // If closing the active file, find another open file to activate
      if (fileId === activeFileId) {
        const nextActiveFile = updatedFiles.find(file => file.isOpen && file.id !== fileId)
        if (nextActiveFile) {
          setActiveFileId(nextActiveFile.id)
          return updatedFiles.map(file => ({
            ...file,
            isActive: file.id === nextActiveFile.id
          }))
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

  const handleNewFile = () => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: 'untitled.js',
      path: 'untitled.js',
      content: '// Start coding here...\n',
      language: 'javascript',
      isOpen: true,
      isActive: true,
      isModified: false
    }
    
    setFiles(prev => [...prev.map(f => ({ ...f, isActive: false })), newFile])
    setActiveFileId(newFile.id)
  }

  return (
    <div className="editor-container bg-void-950 text-void-50 flex flex-col">
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
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex flex-col">
          <Editor
            files={files}
            activeFile={activeFile}
            onFileClose={handleFileClose}
            onFileContentChange={handleFileContentChange}
            onFileSelect={handleFileSelect}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </div>
      
      <StatusBar activeFile={activeFile} />
    </div>
  )
}

export default App
