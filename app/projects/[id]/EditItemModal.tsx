'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit3, Tag, Home, FileText, StickyNote, MessageSquare } from 'lucide-react'

interface EditItemModalProps {
  projectId: number
  item: any
  rooms: any[]
  categories: any[]
  vendors: any[]
  onClose: () => void
  onSuccess: () => void
}

export default function EditItemModal({ 
  projectId, 
  item, 
  rooms, 
  categories, 
  vendors, 
  onClose, 
  onSuccess 
}: EditItemModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: item.name || '',
    description: item.description || '',
    room_id: item.room_id?.toString() || '',
    category_id: item.category_id?.toString() || '',
    notes: item.notes || '',
    long_notes: item.long_notes || ''
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/projects/${projectId}/budget-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          room_id: formData.room_id ? parseInt(formData.room_id) : null,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          notes: formData.notes,
          long_notes: formData.long_notes
        })
      })
      
      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        console.error('Error updating item:', error)
        alert(error.error || 'Failed to update budget item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update budget item')
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom right, #ffffff, #fafafa)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.03)'
          }}
        >
          {/* Decorative gradient orbs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
          
          {/* Header with gradient and glass effect */}
          <div className="relative bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-900 px-8 py-5 border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-purple-600/10" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"
                >
                  <Edit3 className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Budget Item</h2>
                  <p className="text-xs text-purple-200 mt-0.5">Update master budget item details</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group"
              >
                <X className="w-5 h-5 text-white/70 group-hover:text-white" />
              </motion.button>
            </div>
          </div>
        
          <form onSubmit={handleSubmit} className="p-8">
            {/* Main Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kitchen Renovation, Bathroom Upgrade"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <Home className="w-3.5 h-3.5" />
                  Room *
                </label>
                <select
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm"
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                >
                  <option value="">Select Room</option>
                  {rooms.map((room: any) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  Category
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  Description
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the work"
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                <StickyNote className="w-3.5 h-3.5" />
                Quick Notes
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Short notes or reminders"
              />
            </div>

            <div className="mb-8">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Detailed Comments
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm resize-none"
                rows={4}
                value={formData.long_notes}
                onChange={(e) => setFormData({ ...formData, long_notes: e.target.value })}
                placeholder="Detailed notes, specifications, or requirements..."
              />
            </div>

            {/* Budget Summary - Read Only */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estimated Total</p>
                  <p className="text-2xl font-bold text-purple-700">
                    R {(item.estimated_cost || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from detail items</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Actual Total</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    R {(item.actual_cost || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Sum of all completed items</p>
                </div>
              </div>
            </div>

            {/* Actions with gradient hover */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 10px 20px -10px rgba(147, 51, 234, 0.5)'
                }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Update Budget Item
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}