import { createContext, useContext } from 'react';
import { ToastMessage } from '../types';

type ToastContextType = {
  addToast: (message: string, type?: ToastMessage['type']) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
};
