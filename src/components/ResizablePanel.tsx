import React, { useState, useCallback, useRef, ReactNode, useEffect } from 'react'

interface ResizablePanelProps {
  children: ReactNode[]
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({ children }) => {
  const [panelWidth, setPanelWidth] = useState(50) // Initial width in percentage
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    e.preventDefault()
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = 'auto'
    document.body.style.userSelect = 'auto'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const newWidth = e.clientX - containerRect.left
    const newWidthPercent = (newWidth / containerRect.width) * 100
    
    // Set constraints for panel width in percentage
    const minWidthPercent = 15 // e.g., 15%
    const maxWidthPercent = 85 // e.g., 85%
    
    if (newWidthPercent > minWidthPercent && newWidthPercent < maxWidthPercent) {
      setPanelWidth(newWidthPercent)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])
  
  const [leftPanel, rightPanel] = React.Children.toArray(children)

  return (
    <div
      ref={containerRef}
      className="flex flex-1 overflow-hidden"
    >
      <div
        style={{ width: `${panelWidth}%` }}
        className="h-full min-w-[200px]"
      >
        {leftPanel}
      </div>

      <div
        onMouseDown={handleMouseDown}
        className="w-2 h-full cursor-col-resize bg-void-800 hover:bg-blue-600 active:bg-blue-500 transition-colors duration-200 flex-shrink-0"
        title="Drag to resize"
      />

      <div 
        style={{ width: `${100 - panelWidth}%` }}
        className="h-full min-w-[200px]"
      >
        {rightPanel}
      </div>
    </div>
  )
}

export default ResizablePanel
