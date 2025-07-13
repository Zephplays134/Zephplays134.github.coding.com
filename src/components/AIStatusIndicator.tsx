import React from 'react'
import { motion } from 'framer-motion'
import { BotIcon, WifiIcon, WifiOffIcon } from 'lucide-react'

interface AIStatusIndicatorProps {
  isActive: boolean
  isConnected: boolean
  onToggle: () => void
}

const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({
  isActive,
  isConnected,
  onToggle
}) => {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        flex items-center space-x-2 px-3 py-1 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-void-800 text-void-300 hover:bg-void-700'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        <BotIcon className="w-4 h-4" />
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      
      <span className="text-xs font-medium">AI</span>
      
      {isConnected ? (
        <WifiIcon className="w-3 h-3 text-green-400" />
      ) : (
        <WifiOffIcon className="w-3 h-3 text-red-400" />
      )}
    </motion.button>
  )
}

export default AIStatusIndicator
