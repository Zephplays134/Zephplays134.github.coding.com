export interface FileItem {
  id: string
  name: string
  path: string
  content: string
  language: string
  isOpen: boolean
  isActive: boolean
  isModified: boolean
  type: 'file' | 'folder'
  parentId?: string
  children?: string[]
  isExpanded?: boolean
  level?: number
}

export type Theme = 'light' | 'dark'

export interface FolderContextMenu {
  x: number
  y: number
  itemId: string
  type: 'file' | 'folder'
}

export type EditorAction = {
  type: 'insert' | 'replace'
  code: string
} | null

export interface CompilationResult {
  status: 'running' | 'success' | 'error' | 'info';
  output: string[];
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
