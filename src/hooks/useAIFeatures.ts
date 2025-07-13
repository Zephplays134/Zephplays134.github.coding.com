import { useState, useCallback, useRef, useEffect } from 'react'
import { FileItem, CompilationResult } from '../types'

interface AIFeatureState {
  isAIAssistantOpen: boolean
  isCommandPaletteOpen: boolean
  isAIActive: boolean
  isAIConnected: boolean
  compilationResult: CompilationResult | null
}

export const useAIFeatures = () => {
  const [state, setState] = useState<AIFeatureState>({
    isAIAssistantOpen: false,
    isCommandPaletteOpen: false,
    isAIActive: false,
    isAIConnected: true, // Mock connection status
    compilationResult: null
  })

  const compileTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Add a cleanup effect to clear the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (compileTimerRef.current) {
        clearTimeout(compileTimerRef.current)
      }
    }
  }, [])

  const toggleAIAssistant = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAIAssistantOpen: !prev.isAIAssistantOpen,
      isAIActive: !prev.isAIAssistantOpen || prev.isAIActive
    }))
  }, [])

  const closeAIAssistant = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAIAssistantOpen: false
    }))
  }, [])

  const toggleCommandPalette = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCommandPaletteOpen: !prev.isCommandPaletteOpen
    }))
  }, [])

  const closeCommandPalette = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCommandPaletteOpen: false
    }))
  }, [])

  const toggleAIActive = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAIActive: !prev.isAIActive
    }))
  }, [])

  const compileCode = useCallback((file: FileItem) => {
    const initialOutputLine = `[${new Date().toLocaleTimeString()}] Starting compilation for ${file.name}...`
    
    setState(prev => ({
      ...prev,
      compilationResult: {
        status: 'running',
        output: [initialOutputLine],
        timestamp: new Date().toISOString()
      }
    }))

    // Clear any pending compilation timer to prevent race conditions
    if (compileTimerRef.current) {
      clearTimeout(compileTimerRef.current)
    }

    compileTimerRef.current = setTimeout(() => {
      let result: Omit<CompilationResult, 'timestamp'>;
      const lang = file.language;
      const content = file.content;

      if (lang === 'javascript' || lang === 'typescript') {
        try {
          // A very basic syntax check simulation
          if ((content.match(/{/g) || []).length !== (content.match(/}/g) || []).length) {
            throw new Error('SyntaxError: Unmatched curly braces.');
          }
          if ((content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length) {
            throw new Error('SyntaxError: Unmatched parentheses.');
          }
          
          const consoleLogs = [...content.matchAll(/console\.log\((.*?)\)/g)].map(match => {
            // This is a naive eval, not safe for real use but fine for this simulation
            try {
              return `> ${eval(match[1])}`;
            } catch {
              return `> ${match[1].replace(/['"`]/g, '')}`;
            }
          });

          result = {
            status: 'success',
            output: [
              `Executing with Node.js...`,
              ...consoleLogs,
              `\nExecution finished successfully.`
            ]
          }
        } catch (e: any) {
          result = {
            status: 'error',
            output: [
              `Compilation failed with 1 error.`,
              `Error: ${e.message}`
            ]
          }
        }
      } else if (lang === 'html' || lang === 'css') {
        result = {
          status: 'info',
          output: [
            `This is a web file.`,
            `Use the Live Preview panel (Eye icon) to see the output.`
          ]
        }
      } else if (lang === 'python') {
        if (content.includes('import')) {
          result = {
            status: 'success',
            output: [
              `Running with Python 3.11...`,
              `Hello, World!`,
              `\nProcess finished with exit code 0.`
            ]
          }
        } else {
           result = {
            status: 'error',
            output: [
              `Compilation failed.`,
              `Error: IndentationError: expected an indented block at line 2.`
            ]
          }
        }
      } else {
        result = {
          status: 'success',
          output: [
            `Build process started for ${file.name}...`,
            `Dependencies checked.`,
            `Code compiled.`,
            `Build finished successfully.`
          ]
        }
      }
      
      setState(prev => ({
        ...prev,
        compilationResult: {
          ...result,
          output: [
            initialOutputLine,
            ...result.output,
            `[${new Date().toLocaleTimeString()}] Process finished.`
          ],
          timestamp: new Date().toISOString()
        }
      }))
      
      compileTimerRef.current = null;
    }, 1500);
  }, [])

  const executeAICommand = useCallback((command: string, args?: any) => {
    // Mock AI command execution
    console.log('Executing AI command:', command, args)
    
    // In a real implementation, this would call actual AI services
    switch (command) {
      case 'explain':
        return 'This code does...'
      case 'optimize':
        return 'Consider these optimizations...'
      case 'debug':
        return 'Potential issues found...'
      case 'refactor':
        return 'Refactoring suggestions...'
      case 'generate':
        return 'Generated code...'
      case 'document':
        return 'Added documentation...'
      case 'compile':
        if (args?.file) {
          compileCode(args.file)
        }
        return 'Compilation started...'
      default:
        return 'Command executed'
    }
  }, [compileCode])

  return {
    ...state,
    toggleAIAssistant,
    closeAIAssistant,
    toggleCommandPalette,
    closeCommandPalette,
    toggleAIActive,
    executeAICommand,
    compileCode,
    setCompilationResult: (result: CompilationResult | null) => setState(prev => ({ ...prev, compilationResult: result }))
  }
}
