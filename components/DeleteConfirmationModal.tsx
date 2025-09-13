'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2, Shield } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  itemName?: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export default function DeleteConfirmationModal({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  isDeleting = false
}: DeleteConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isDeleting) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onCancel, isDeleting])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
        >
          <motion.div
            ref={modalRef}
            initial={{ 
              opacity: 0, 
              scale: 0.85,
              y: 20
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.85,
              y: 20
            }}
            transition={{ 
              type: "spring", 
              duration: 0.3,
              bounce: 0.2
            }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            {/* Animated warning stripe */}
            <motion.div 
              className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 100%'
              }}
            />

            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ 
                    duration: 0.5,
                    delay: 0.2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl"
                >
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{message}</p>
                  {itemName && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-700">Item to delete:</p>
                      <p className="text-sm text-gray-900 font-semibold mt-1">{itemName}</p>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
            </div>

            {/* Warning message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-6 pb-4"
            >
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">This action cannot be undone</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Once deleted, this item and all related data will be permanently removed.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="p-6 pt-4 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isDeleting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}