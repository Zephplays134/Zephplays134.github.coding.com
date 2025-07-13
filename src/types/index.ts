export interface FileItem {
  id: string
  name: string
  path: string
  content: string
  language: string
  isOpen: boolean
  isActive: boolean
  isModified: boolean
}

export interface EditorTheme {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
}
