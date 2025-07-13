import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileItem } from '../types'
import { MonitorPlayIcon, RefreshCwIcon, ExternalLinkIcon } from 'lucide-react'

interface PreviewProps {
  files: FileItem[]
}

const Preview: React.FC<PreviewProps> = ({ files }) => {
  const [previewKey, setPreviewKey] = useState(Date.now())

  const previewContent = useMemo(() => {
    const htmlFile = files.find(f => f.name.toLowerCase() === 'index.html')
    if (!htmlFile) {
      return null
    }

    let html = htmlFile.content

    // Find and inject CSS files
    const cssLinks = html.match(/<link.*?href="(.*?.css)".*?>/g) || []
    cssLinks.forEach(link => {
      const hrefMatch = link.match(/href="(.*?)"/)
      if (hrefMatch) {
        const cssPath = hrefMatch[1]
        const cssFile = files.find(f => f.path.endsWith(cssPath))
        if (cssFile) {
          const styleTag = `<style>${cssFile.content}</style>`
          html = html.replace(link, styleTag)
        }
      }
    })

    // Find and inject JS files
    const scriptTags = html.match(/<script.*?src="(.*?.js)".*?>.*?<\/script>/g) || []
    scriptTags.forEach(tag => {
      const srcMatch = tag.match(/src="(.*?)"/)
      if (srcMatch) {
        const jsPath = srcMatch[1]
        const jsFile = files.find(f => f.path.endsWith(jsPath))
        if (jsFile) {
          const scriptTag = `<script type="module">${jsFile.content}</script>`
          html = html.replace(tag, scriptTag)
        }
      }
    })

    return html
  }, [files])

  const refreshPreview = () => {
    setPreviewKey(Date.now())
  }

  const openInNewTab = () => {
    if (previewContent) {
      const blob = new Blob([previewContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
  }

  return (
    <div className="flex flex-col h-full bg-void-950">
      {/* Header */}
      <div className="bg-void-900 border-b border-void-700 flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <MonitorPlayIcon className="w-4 h-4 text-void-400" />
          <h3 className="text-sm font-medium text-void-200">Live Preview</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshPreview}
            className="p-2 hover:bg-void-800 rounded transition-colors"
            title="Refresh Preview"
          >
            <RefreshCwIcon className="w-4 h-4 text-void-400" />
          </button>
          <button
            onClick={openInNewTab}
            className="p-2 hover:bg-void-800 rounded transition-colors"
            title="Open in New Tab"
          >
            <ExternalLinkIcon className="w-4 h-4 text-void-400" />
          </button>
        </div>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 bg-white">
        {previewContent ? (
          <iframe
            key={previewKey}
            srcDoc={previewContent}
            title="Live Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-center text-void-600 bg-void-950">
            <div>
              <p>No `index.html` file found.</p>
              <p className="text-sm">Create an `index.html` file to start the live preview.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Preview
