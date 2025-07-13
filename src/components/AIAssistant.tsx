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
  Trash2Icon,
  SparklesIcon,
  BugIcon,
  FileTextIcon
} from 'lucide-react'
import { FileItem } from '../types'
import { useToasts } from '../hooks/useToasts'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  activeFile: FileItem | undefined
  onInsertCode: (code: string) => void
  onReplaceCode: (code: string) => void
  selectionText: string
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
  selectionText,
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
    if (messages.length === 0 || (selectionText && messages.length === 1)) {
      const initialMessage = selectionText
        ? `I see you've selected some code in \`${activeFile?.name}\`. How can I help you with it?`
        : "Hello! I'm your AI coding assistant. How can I help you today?"

      setMessages([
        {
          id: '1',
          type: 'ai',
          content: initialMessage,
          timestamp: new Date(),
          suggestions: selectionText 
            ? ["Explain this selection", "Refactor this code", "Find bugs"]
            : ["Explain the active file", "Create a React component", "Generate a login form"]
        }
      ]);
    }
  }, [selectionText, activeFile?.name, messages.length]);

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const mockAIResponse = useCallback((userInput: string, signal: AbortSignal): Omit<Message, 'id' | 'type' | 'timestamp'> => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('refactor')) {
        return {
            content: "Of course. I've refactored the selected code for better readability and performance. I've converted it to an async function and used a more modern `for...of` loop.",
            codeBlock: `async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    const data = await response.json();\n    console.log('Data fetched successfully');\n    return data;\n  } catch (error) {\n    console.error('Error fetching data:', error);\n    return null;\n  }\n}`
        }
    }

    if (lowerInput.includes('bug')) {
        return {
            content: "I've analyzed the selection and found a potential issue. The `count` variable is not properly handled in the case of a failed API call, which could lead to inconsistent state. Here's a corrected version:",
            codeBlock: `button.addEventListener('click', async () => {\n  try {\n    // Assuming an API call that might fail\n    const success = await api.updateCount();\n    if (success) {\n      count++;\n      button.textContent = \`Clicked \${count} times\`;\n    }\n  } catch (e) {\n    console.error("Failed to update count:", e);\n  }\n});`
        }
    }

    if (lowerInput.includes('explain')) {
      if (selectionText) {
        return { content: `This code snippet appears to be a JavaScript event listener attached to a button. When the button is clicked, it increments a 'count' variable and updates the button's text to display the new count. It also logs a message to the console when the script first loads.` };
      }
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
  }, [activeFile, selectionText]);

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

  const QuickActionButton: React.FC<{ icon: React.ElementType, label: string, action: string }> = ({ icon: Icon, label, action }) => (
    <button
      onClick={() => handleSendMessage(action)}
      className="flex-1 flex flex-col items-center justify-center p-2 space-y-1 bg-void-100 dark:bg-void-800 rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-500/20 text-void-700 dark:text-void-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </button>
  );

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
            {selectionText && (
              <div className="mb-3 p-2 bg-void-100 dark:bg-void-800 rounded-lg">
                <p className="text-xs text-void-600 dark:text-void-400 mb-2">Quick actions for selection:</p>
                <div className="flex items-center space-x-2">
                  <QuickActionButton icon={FileTextIcon} label="Explain" action="Explain this selection" />
                  <QuickActionButton icon={SparklesIcon} label="Refactor" action="Refactor this code" />
                  <QuickActionButton icon={BugIcon} label="Find Bugs" action="Find bugs in this code" />
                </div>
              </div>
            )}
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
