import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, SunIcon, MoonIcon } from 'lucide-react';
import { Theme } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-void-900 border border-void-700 rounded-lg shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-void-200 dark:border-void-700">
              <h2 className="text-lg font-semibold text-void-900 dark:text-void-100">Settings</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-void-100 dark:hover:bg-void-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5 text-void-500 dark:text-void-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-void-700 dark:text-void-300">Theme</label>
                <div className="flex items-center p-1 rounded-full bg-void-100 dark:bg-void-800">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-full ${theme === 'light' ? 'bg-blue-500 text-white' : 'text-void-500'}`}
                  >
                    <SunIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-500 text-white' : 'text-void-500'}`}
                  >
                    <MoonIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
