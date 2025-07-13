import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TerminalIcon, XIcon, Trash2Icon, RefreshCwIcon, CheckCircle, AlertTriangle, InfoIcon, Loader } from 'lucide-react'
import { CompilationResult } from '../types'

interface CompilationOutputProps {
  result: CompilationResult | null
  onClose: () => void
  onClear: () => void
  onRerun: () => void
}

const CompilationOutput: React.FC<CompilationOutputProps> = ({
  result,
  onClose,
  onClear,
  onRerun
}) => {
  const outputEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [result?.output])

  const getStatusIcon = (status: CompilationResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'info':
        return <InfoIcon className="w-4 h-4 text-yellow-400" />
    }
  }

  const formatOutput = (line: string) => {
    if (line.toLowerCase().includes('error')) {
      return <span className="text-red-400">{line}</span>
    }
    if (line.toLowerCase().includes('warning')) {
      return <span className="text-yellow-400">{line}</span>
    }
    if (line.toLowerCase().includes('success')) {
      return <span className="text-green-400">{line}</span>
    }
    return <span className="text-void-300">{line}</span>
  }

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 240 }}
      exit={{ height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-void-900 border-t border-void-700 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-2 border-b border-void-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-void-400" />
          <h3 className="text-sm font-medium text-void-200">Terminal</h3>
          <div className="flex items-center space-x-1 text-xs text-void-500">
            {result && getStatusIcon(result.status)}
            <span>{result?.status || 'idle'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onRerun}
            className="p-1.5 hover:bg-void-800 rounded transition-colors"
            title="Rerun"
          >
            <RefreshCwIcon className="w-3.5 h-3.5 text-void-400" />
          </button>
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-void-800 rounded transition-colors"
            title="Clear Terminal"
          >
            <Trash2Icon className="w-3.5 h-3.5 text-void-400" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-void-800 rounded transition-colors"
            title="Close Panel"
          >
            <XIcon className="w-3.5 h-3.5 text-void-400" />
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs scrollbar-thin">
        {result?.output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {formatOutput(line)}
          </div>
        ))}
        <div ref={outputEndRef} />
      </div>
    </motion.div>
  )
}

export default CompilationOutput
