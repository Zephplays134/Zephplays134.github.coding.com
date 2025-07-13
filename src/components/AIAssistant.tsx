import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BotIcon, 
  SendIcon,
  XIcon,
  MinimizeIcon,
  MaximizeIcon,
  CopyIcon,
  RefreshCwIcon,
  DownloadCloudIcon,
  ReplaceIcon,
  SquareIcon,
  Trash2Icon
} from 'lucide-react'
import { FileItem } from '../types'
import { useToasts } from '../hooks/useToasts'

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

const useTypewriter = (text: string, speed: number = 20) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    setDisplayText('');
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return displayText;
};

const AITypingMessage: React.FC<{ message: Message }> = ({ message }) => {
  const typedContent = useTypewriter(message.content);
  
  return (
    <div className="text-sm whitespace-pre-wrap">{typedContent}</div>
  );
};

const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  activeFile,
  onInsertCode,
  onReplaceCode,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const generationController = useRef<AbortController | null>(null)
  const { addToast } = useToasts()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: 'Hello! I\'m your AI coding assistant. I can help you write code, explain concepts, debug issues, and provide suggestions. What would you like to work on?',
          timestamp: new Date(),
          suggestions: ["Explain the active file", "Create a React component", "Generate a login form"]
        }
      ]);
    }
  }, [messages.length]);

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const mockAIResponse = useCallback((userInput: string, signal: AbortSignal): Omit<Message, 'id' | 'type' | 'timestamp'> => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('explain') && (lowerInput.includes('file') || lowerInput.includes('code'))) {
      if (activeFile) {
        return {
          content: `Certainly! The active file is \`${activeFile.name}\`, which is a ${activeFile.language} file. Here's a brief overview:\n\nThis file appears to define a simple interactive element. It likely sets up some basic structure (HTML), styling (CSS), and user interaction logic (JavaScript). I can provide a more detailed breakdown if you'd like.`,
          suggestions: [`What does the \`${activeFile.name.split('.')[0]}\` function do?`, "How can I improve this code?", "Refactor this into a component"]
        }
      }
      return { content: "There's no active file open. Please open a file first, and I'll be happy to explain it." };
    }

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
    
    return {
      content: `I understand you're asking about: "${userInput.substring(0, 50)}..."\n\nI can help you with:
• **Code Generation**: Create components, functions, etc.
• **Explanations**: Explain how your code works.
• **Debugging**: Find and fix issues.`,
      suggestions: ["Explain this code", "Suggest optimizations", "Help me debug this"]
    }
  }, [activeFile]);

  const handleSendMessage = useCallback(async (messageContent: string) => {
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
    
    generationController.current = new AbortController()
    const signal = generationController.current.signal

    setTimeout(() => {
      if (signal.aborted) {
        setIsLoading(false);
        return;
      }
      const aiResponseData = mockAIResponse(messageContent, signal)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        timestamp: new Date(),
        ...aiResponseData
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
      generationController.current = null;
    }, 1000 + Math.random() * 500)
  }, [isLoading, mockAIResponse]);

  const stopGeneration = () => {
    if (generationController.current) {
      generationController.current.abort();
      generationController.current = null;
    }
    setIsLoading(false);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'ai',
      content: 'Generation stopped.',
      timestamp: new Date()
    }]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast('Code copied to clipboard!', 'success');
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed right-4 bottom-4 w-96 bg-white dark:bg-void-900 border border-void-200 dark:border-void-700 rounded-lg shadow-2xl z-50 flex flex-col ${className}`}
      style={{ height: isMinimized ? 'auto' : '500px' }}
    >
      <div className="p-3 border-b border-void-200 dark:border-void-700 flex items-center justify-between bg-void-50 dark:bg-void-800 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-blue-600 rounded">
            <BotIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-medium text-void-800 dark:text-void-100">AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={clearChat} className="p-1 hover:bg-void-200 dark:hover:bg-void-700 rounded transition-colors" title="Clear Chat">
            <Trash2Icon className="w-4 h-4 text-void-500 dark:text-void-400" />
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-void-200 dark:hover:bg-void-700 rounded transition-colors">
            {isMinimized ? <MaximizeIcon className="w-4 h-4 text-void-500 dark:text-void-400" /> : <MinimizeIcon className="w-4 h-4 text-void-500 dark:text-void-400" />}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-void-200 dark:hover:bg-void-700 rounded transition-colors">
            <XIcon className="w-4 h-4 text-void-500 dark:text-void-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {messages.map((message, index) => (
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
                      : 'bg-void-100 dark:bg-void-800 text-void-800 dark:text-void-100'
                  }`}
                >
                  {message.type === 'ai' && isLoading && index === messages.length - 1 ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCwIcon className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : message.type === 'ai' ? (
                     <AITypingMessage message={message} />
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  )}

                  {message.codeBlock && (
                    <div className="mt-2 bg-void-950 rounded text-xs font-mono">
                      <div className="flex items-center justify-end p-1 bg-black/20 rounded-t-sm space-x-1">
                        <button onClick={() => onInsertCode(message.codeBlock!)} className="p-1.5 hover:bg-void-700 rounded text-void-300" title="Insert at cursor"><DownloadCloudIcon className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onReplaceCode(message.codeBlock!)} className="p-1.5 hover:bg-void-700 rounded text-void-300" title="Replace selection"><ReplaceIcon className="w-3.5 h-3.5" /></button>
                        <button onClick={() => copyToClipboard(message.codeBlock!)} className="p-1.5 hover:bg-void-700 rounded text-void-300" title="Copy code"><CopyIcon className="w-3.5 h-3.5" /></button>
                      </div>
                      <pre className="p-2 text-void-200 overflow-x-auto scrollbar-thin">{message.codeBlock}</pre>
                    </div>
                  )}
                  {message.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, i) => (
                        <button key={i} onClick={() => handleSendMessage(suggestion)} className="px-2 py-1 bg-void-200 dark:bg-void-700 text-xs text-void-700 dark:text-void-200 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-void-200 dark:border-void-700">
            {isLoading && (
              <button
                onClick={stopGeneration}
                className="w-full flex items-center justify-center space-x-2 mb-2 px-3 py-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
              >
                <SquareIcon className="w-4 h-4" />
                <span>Stop Generating</span>
              </button>
            )}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-void-100 dark:bg-void-800 border border-void-300 dark:border-void-600 rounded text-sm text-void-800 dark:text-void-100 placeholder-void-400 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button type="submit" disabled={!inputValue.trim() || isLoading} className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-void-700 text-white rounded transition-colors">
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
