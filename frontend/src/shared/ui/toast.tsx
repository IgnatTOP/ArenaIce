import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/shared/lib/toast'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export const Toast = () => {
  const { toasts, removeToast } = useToastStore()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'error': return <XCircle className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`${getColor(toast.type)} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
          >
            {getIcon(toast.type)}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
