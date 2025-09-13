'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Check, Home, Layers, FileText } from 'lucide-react'

interface BudgetInlineAddProps {
  projectId: number
  rooms: any[]
  categories: any[]
  onSuccess: () => void
}

export default function BudgetInlineAdd({
  projectId,
  rooms,
  categories,
  onSuccess
}: BudgetInlineAddProps) {
  const [isAddMode, setIsAddMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    room_id: '',
    category_id: ''
  })

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a name for the budget item')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/budget-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          room_id: formData.room_id || null,
          category_id: formData.category_id || null
        })
      })

      if (!response.ok) throw new Error('Failed to create budget item')

      // Reset form
      setFormData({
        name: '',
        description: '',
        room_id: '',
        category_id: ''
      })
      setIsAddMode(false)
      onSuccess()
    } catch (error) {
      console.error('Error creating budget item:', error)
      alert('Failed to create budget item')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      room_id: '',
      category_id: ''
    })
    setIsAddMode(false)
  }

  if (!isAddMode) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsAddMode(true)}
        className="w-full bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 border border-gray-200 rounded-xl p-4 hover:from-blue-200 hover:to-purple-200 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium"
      >
        <Plus className="w-5 h-5 text-gray-600" />
        Add New Budget Item
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6 mb-4"
    >
      <div className="space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Budget Item</h3>

        {/* Form Grid */}
        <div className="grid grid-cols-4 gap-4">
          {/* Name Field */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Kitchen Renovation"
              autoFocus
            />
          </div>

          {/* Room Selector */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Home className="w-4 h-4 inline mr-1" />
              Room
            </label>
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Layers className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Description Field */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description (optional)"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !formData.name.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Budget Item
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}