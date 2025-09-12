'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, MessageSquare, Save } from 'lucide-react'
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

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            <p className="text-sm text-gray-600 mt-1">Manage notes and comments for this budget item</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Detailed Notes Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Detailed Notes</h3>
            </div>
            <textarea
              value={longNotes}
              onChange={(e) => setLongNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-40 resize-none"
              placeholder="Enter comprehensive notes about this budget item, specifications, requirements, vendor discussions, etc."
            />
            <p className="text-xs text-gray-500 mt-2">
              Use this space for detailed documentation about this budget item.
            </p>
            <button
              onClick={handleSaveLongNotes}
              disabled={isSaving || longNotes === (item.long_notes || '')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Detailed Notes'}
            </button>
          </div>

          {/* Individual Date-Tagged Notes Section */}
          <div>
            <BudgetItemNotes budgetItemId={item.id} projectId={projectId} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}