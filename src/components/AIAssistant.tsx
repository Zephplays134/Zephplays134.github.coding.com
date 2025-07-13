import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BotIcon, 
  MessageCircleIcon, 
  CodeIcon, 
  SparklesIcon,
  SendIcon,
  XIcon,
  MinimizeIcon,
  MaximizeIcon,
  CopyIcon,
  RefreshCwIcon,
  DownloadCloudIcon,
  ReplaceIcon
} from 'lucide-react'
import { FileItem } from '../types'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  activeFile: FileItem | undefined
  onInsertCode: (code: string) => void
  onReplaceCode: (code: string) => void
  className?: string
}

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  codeBlock?: string
  suggestions?: string[]
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  activeFile,
  onInsertCode,
  onReplaceCode,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI coding assistant. I can help you write code, explain concepts, debug issues, and provide suggestions. What would you like to work on?',
      timestamp: new Date(),
      suggestions: ["Create a React component", "Generate a login form", "Explain the active file"]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const mockAIResponse = (userInput: string): Omit<Message, 'id' | 'type' | 'timestamp'> => {
    const lowerInput = userInput.toLowerCase()
    
    if (lowerInput.includes('react') && lowerInput.includes('counter')) {
      return {
        content: 'Of course! Here is a functional React counter component using TypeScript and hooks.',
        codeBlock: `import React, { useState } from 'react';

const Counter: React.FC = () => {
  const [count, setCount] = useState(0);

  const handleIncrement = () => setCount(prev => prev + 1);
  const handleDecrement = () => setCount(prev => prev - 1);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p style={{ fontSize: '24px' }}>Count: {count}</p>
      <button onClick={handleIncrement} style={{ marginRight: '10px' }}>Increment</button>
      <button onClick={handleDecrement}>Decrement</button>
    </div>
  );
};

export default Counter;`
      }
    }

    if (lowerInput.includes('login form')) {
      return {
        content: 'Certainly. Here is a responsive HTML and CSS login form with a clean, modern design.',
        codeBlock: `<!-- HTML -->
<div class="login-container">
  <h2>Login</h2>
  <form>
    <div class="input-group">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" required>
    </div>
    <div class="input-group">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required>
    </div>
    <button type="submit">Log In</button>
  </form>
</div>

<!-- CSS -->
<style>
.login-container {
  width: 320px;
  margin: 60px auto;
  padding: 25px;
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
h2 { text-align: center; color: #cbd5e1; margin-bottom: 20px; }
.input-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; color: #94a3b8; font-size: 14px; }
input { width: 100%; padding: 10px; background-color: #1e293b; border: 1px solid #475569; border-radius: 4px; color: #f8fafc; transition: border-color 0.2s; }
input:focus { outline: none; border-color: #3b82f6; }
button { width: 100%; padding: 10px; background-color: #3b82f6; border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold; transition: background-color 0.2s; }
button:hover { background-color: #2563eb; }
</style>`
      }
    }

    if (lowerInput.includes('make this code') || lowerInput.includes('generate code')) {
      return {
        content: "Great! What would you like me to generate? Please be as specific as possible.",
        suggestions: [
          "A React counter component",
          "A login form with HTML and CSS",
          "A Python function to sort a list"
        ]
      }
    }

    return {
      content: `I understand you're asking about: "${userInput.substring(0, 50)}..."\n\nI can help you with:
• **Code Generation**: Create components, functions, etc.
• **Explanations**: Explain how your code works.
• **Debugging**: Find and fix issues.`,
      suggestions: ["Explain this code", "Suggest optimizations", "Help me debug this"]
    }
  }

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    setTimeout(() => {
      const aiResponseData = mockAIResponse(messageContent)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        timestamp: new Date(),
        ...aiResponseData
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000 + Math.random() * 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed right-4 bottom-4 w-96 bg-void-900 border border-void-700 rounded-lg shadow-2xl z-50 flex flex-col ${className}`}
      style={{ height: isMinimized ? 'auto' : '500px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-void-700 flex items-center justify-between bg-void-800 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-blue-600 rounded">
            <BotIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-medium text-void-100">AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-void-700 rounded transition-colors"
          >
            {isMinimized ? 
              <MaximizeIcon className="w-4 h-4 text-void-400" /> :
              <MinimizeIcon className="w-4 h-4 text-void-400" />
            }
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-void-700 rounded transition-colors"
          >
            <XIcon className="w-4 h-4 text-void-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-void-800 text-void-100'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.codeBlock && (
                    <div className="mt-2 bg-void-950 rounded text-xs font-mono">
                      <div className="flex items-center justify-end p-1 bg-void-800/50 rounded-t-sm space-x-1">
                        <button
                          onClick={() => onInsertCode(message.codeBlock!)}
                          className="p-1.5 hover:bg-void-700 rounded text-void-300" title="Insert at cursor"
                        >
                          <DownloadCloudIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onReplaceCode(message.codeBlock!)}
                          className="p-1.5 hover:bg-void-700 rounded text-void-300" title="Replace selection"
                        >
                          <ReplaceIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(message.codeBlock!)}
                          className="p-1.5 hover:bg-void-700 rounded text-void-300" title="Copy code"
                        >
                          <CopyIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <pre className="p-2 text-void-200 overflow-x-auto scrollbar-thin">{message.codeBlock}</pre>
                    </div>
                  )}
                  {message.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(suggestion)}
                          className="px-2 py-1 bg-void-700 text-xs text-void-200 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-void-800 text-void-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <RefreshCwIcon className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-void-700">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-void-800 border border-void-600 rounded text-sm text-void-100 placeholder-void-400 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-void-700 text-white rounded transition-colors"
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default AIAssistant
