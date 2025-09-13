'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, MessageSquare, Save, StickyNote, Calendar, User, Hash } from 'lucide-react'
import BudgetItemNotes from './BudgetItemNotes'

interface BudgetItemNotesModalProps {
  projectId: number
  item: any
  onClose: () => void
  onSave: (item: any) => void
}

export default function BudgetItemNotesModal({ 
  projectId, 
  item, 
  onClose, 
  onSave 
}: BudgetItemNotesModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [longNotes, setLongNotes] = useState(item.long_notes || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
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
  }, [onClose])

  const handleSaveLongNotes = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/budget-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ long_notes: longNotes })
      })

      if (response.ok) {
        const updatedItem = await response.json()
        onSave(updatedItem)
      }
    } catch (error) {
      console.error('Error saving long notes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 z-50"
      >
        <motion.div
          ref={modalRef}
          initial={{ 
            opacity: 0, 
            scale: 0.85,
            rotateX: -15,
            y: 50
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            rotateX: 0,
            y: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.85,
            rotateX: 15,
            y: -50
          }}
          transition={{ 
            type: "spring", 
            duration: 0.6,
            bounce: 0.3
          }}
          className="bg-white rounded-3xl w-[95vw] max-w-[1800px] h-[90vh] overflow-hidden shadow-2xl flex flex-col relative"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" fill="#9C92AC" fillOpacity="0.1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Header with gradient and 3D effect */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative px-8 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden"
            style={{
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Animated shimmer effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
              animate={{ 
                x: ['-100%', '200%'] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatDelay: 3 
              }}
            />
            
            <div className="relative flex items-center justify-between">
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <StickyNote className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{item.name}</h2>
                    <p className="text-white/80 mt-1 flex items-center gap-4">
                      {item.room_name && (
                        <span className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          {item.room_name}
                        </span>
                      )}
                      {item.category_name && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {item.category_name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300"
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </motion.div>

          {/* Content with two-column layout */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left column - Detailed Notes */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-1/2 p-8 border-r border-gray-200 flex flex-col h-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl"
                >
                  <FileText className="w-5 h-5 text-purple-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800">Detailed Documentation</h3>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.002 }}
                className="relative flex-1 flex flex-col"
              >
                <textarea
                  value={longNotes}
                  onChange={(e) => setLongNotes(e.target.value)}
                  className="flex-1 w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 resize-none text-gray-700 transition-all duration-300 font-sans leading-relaxed"
                  placeholder="Enter comprehensive notes about this budget item, specifications, requirements, vendor discussions, pricing considerations, installation notes, and any other relevant details..."
                  style={{
                    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                    minHeight: 'calc(100% - 180px)'
                  }}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/90 px-2 py-1 rounded">
                  {longNotes.length} characters
                </div>
              </motion.div>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 italic">
                  💡 Use this space for detailed documentation
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveLongNotes}
                  disabled={isSaving || longNotes === (item.long_notes || '')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg transition-all duration-300"
                  style={{
                    boxShadow: isSaving ? 'none' : '0 10px 25px -5px rgba(147, 51, 234, 0.3)'
                  }}
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Saving...
                    </span>
                  ) : (
                    'Save Documentation'
                  )}
                </motion.button>
              </div>

              {/* Quick stats at bottom */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 gap-4 mt-4"
              >
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="text-xl font-bold text-blue-600">
                    R{item.estimated_cost?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-blue-600/70">Estimated Budget</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="text-xl font-bold text-green-600">
                    R{item.actual_cost?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-green-600/70">Actual Spent</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right column - Individual Notes */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-1/2 p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-white"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800">Timeline Notes</h3>
              </div>
              
              <BudgetItemNotes budgetItemId={item.id} projectId={projectId} />
            </motion.div>
          </div>

          {/* Footer with gradient */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="px-8 py-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200 flex justify-between items-center"
          >
            <div className="text-sm text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd> or click outside to close
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg"
            >
              Close Notes
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}