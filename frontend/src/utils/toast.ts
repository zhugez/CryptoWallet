// src/utils/toast.ts
import { FiCheck, FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { type ToastProps } from '@/components/ui/toast';

interface ToastConfig {
  title: string;
  description: string;
  className?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
}

export const toastConfig = {
  success: (message: string): ToastConfig => ({
    title: "Success",
    description: message,
    className: "group bg-black/80 backdrop-blur-xl border-[1px] border-transparent bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300",
    duration: 3000,
  }),

  error: (message: string): ToastConfig => ({
    title: "Error",
    description: message,
    className: "group bg-black/80 backdrop-blur-xl border-[1px] border-transparent bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-300",
    duration: 3000,
    variant: "destructive",
  }),

  warning: (message: string): ToastConfig => ({
    title: "Warning",
    description: message,
    className: "group bg-black/80 backdrop-blur-xl border-[1px] border-transparent bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-white shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300",
    duration: 3000,
  }),

  info: (message: string): ToastConfig => ({
    title: "Info",
    description: message,
    className: "group bg-black/80 backdrop-blur-xl border-[1px] border-transparent bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300",
    duration: 3000,
  })
} as const;