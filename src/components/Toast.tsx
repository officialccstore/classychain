'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type]

  const icon = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    info: <Check className="w-5 h-5" />,
  }[type]

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className={`${bgColor} text-white rounded-lg px-6 py-4 shadow-2xl flex items-center gap-3 min-w-max`}>
        {icon}
        <span className="font-medium text-sm md:text-base">{message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 hover:opacity-80 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info'
    duration?: number
  }>>([])

  useEffect(() => {
    const handleAddToast = (event: CustomEvent) => {
      const { message, type, duration } = event.detail
      const id = Date.now().toString()
      setToasts(prev => [...prev, { id, message, type, duration }])

      if (duration !== -1) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, duration || 3000)
      }
    }

    window.addEventListener('addToast', handleAddToast as EventListener)
    return () => window.removeEventListener('addToast', handleAddToast as EventListener)
  }, [])

  return (
    <>
      {toasts.map(toast => (
        <div key={toast.id} className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          } text-white rounded-lg px-6 py-4 shadow-2xl flex items-center gap-3 min-w-max`}>
            {toast.type === 'success' && <Check className="w-5 h-5" />}
            {toast.type === 'error' && <X className="w-5 h-5" />}
            {toast.type === 'info' && <Check className="w-5 h-5" />}
            <span className="font-medium text-sm md:text-base">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 hover:opacity-80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </>
  )
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000) {
  const event = new CustomEvent('addToast', {
    detail: { message, type, duration }
  })
  window.dispatchEvent(event)
}
