import { useState, useCallback } from 'react'
import { FileItem } from '../types'
import { getDefaultContent, getLanguageFromFilename } from '../utils/fileUtils'

export const useFileManager = (initialFiles: FileItem[]) => {
  const [files, setFiles] = useState<FileItem[]>(initialFiles)

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  const getItemPath = (itemId: string, currentFiles: FileItem[]): string => {
    const item = currentFiles.find(f => f.id === itemId)
    if (!item) return ''
    return item.path
  }

  const getItemLevel = (itemId: string, currentFiles: FileItem[]): number => {
    const item = currentFiles.find(f => f.id === itemId)
    if (!item) return 0
    return item.level || 0
  }

  const createFile = useCallback((name: string, parentId?: string) => {
    const newFileId = generateId()
    
    setFiles(prev => {
      const newFile: FileItem = {
        id: newFileId,
        name: name,
        path: parentId ? `${getItemPath(parentId, prev)}/${name}` : name,
        content: getDefaultContent(name),
        language: getLanguageFromFilename(name),
        type: 'file',
        isOpen: true,
        isActive: true,
        isModified: false,
        parentId,
        level: parentId ? getItemLevel(parentId, prev) + 1 : 0
      }
      
      const updatedFiles = [
        ...prev.map(f => ({ ...f, isActive: false })),
        newFile
      ]

      if (parentId) {
        return updatedFiles.map(f => 
          f.id === parentId 
            ? { ...f, children: [...(f.children || []), newFile.id] } 
            : f
        )
      }

      return updatedFiles
    })

    return newFileId
  }, [])

  const createFolder = useCallback((name: string, parentId?: string) => {
    const newFolderId = generateId()
    
    setFiles(prev => {
      const newFolder: FileItem = {
        id: newFolderId,
        name: name,
        path: parentId ? `${getItemPath(parentId, prev)}/${name}` : name,
        content: '',
        language: '',
        type: 'folder',
        isOpen: false,
        isActive: false,
        isModified: false,
        parentId,
        children: [],
        isExpanded: true,
        level: parentId ? getItemLevel(parentId, prev) + 1 : 0
      }
      
      const updatedFiles = [...prev, newFolder]

      if (parentId) {
        return updatedFiles.map(f =>
          f.id === parentId
            ? { ...f, children: [...(f.children || []), newFolder.id] }
            : f
        )
      }
      return updatedFiles
    })
    return newFolderId
  }, [])

  const deleteItem = useCallback((itemId: string) => {
    setFiles(prev => {
      const itemsToDelete = new Set<string>()
      const findChildrenRecursive = (id: string) => {
        itemsToDelete.add(id)
        const item = prev.find(f => f.id === id)
        if (item?.type === 'folder' && item.children) {
          item.children.forEach(childId => findChildrenRecursive(childId))
        }
      }
      findChildrenRecursive(itemId)

      let updatedFiles = prev.filter(f => !itemsToDelete.has(f.id))
      
      const itemToDelete = prev.find(f => f.id === itemId)
      if (itemToDelete?.parentId) {
        updatedFiles = updatedFiles.map(f => 
          f.id === itemToDelete.parentId 
            ? { ...f, children: f.children?.filter(childId => childId !== itemId) }
            : f
        )
      }

      return updatedFiles
    })
  }, [])

  const renameItem = useCallback((itemId: string, newName: string) => {
    setFiles(prev => {
      const itemToRename = prev.find(item => item.id === itemId)
      if (!itemToRename) return prev

      const newPath = itemToRename.parentId 
        ? `${getItemPath(itemToRename.parentId, prev)}/${newName}` 
        : newName
      
      return prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            name: newName,
            path: newPath,
            language: item.type === 'file' ? getLanguageFromFilename(newName) : ''
          }
        }
        return item
      })
    })
  }, [])

  const toggleFolder = useCallback((folderId: string) => {
    setFiles(prev => prev.map(item => 
      item.id === folderId 
        ? { ...item, isExpanded: !item.isExpanded }
        : item
    ))
  }, [])

  return {
    files,
    setFiles,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    toggleFolder
  }
}
