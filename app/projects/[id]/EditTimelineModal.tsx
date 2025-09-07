'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface EditTimelineModalProps {
  projectId: number
  entry: any
  onClose: () => void
  onSuccess: () => void
}

export default function EditTimelineModal({ projectId, entry, onClose, onSuccess }: EditTimelineModalProps) {
  const [formData, setFormData] = useState({
    start_date: entry.start_date || entry.date || '',
    end_date: entry.end_date || '',
    title: entry.title,
    description: entry.description || '',
    status: entry.status || 'planned'
  })

  // Calculate day numbers based on project start date (Oct 1, 2025)
  const projectStartDate = new Date('2025-10-01')
  
  const calculateDayNumber = (dateStr: string) => {
    if (!dateStr) return 1
    const date = new Date(dateStr)
    const diffTime = date.getTime() - projectStartDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Day 1 is Oct 1
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const startDay = calculateDayNumber(formData.start_date)
    const endDay = formData.end_date ? calculateDayNumber(formData.end_date) : startDay
    
    try {
      const response = await fetch(`/api/projects/${projectId}/timeline/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          start_day: startDay,
          end_day: endDay
        })
      })
      
      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating timeline entry:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Renovation Plan Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                min="2025-10-01"
                max="2025-11-30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
              {formData.start_date && (
                <p className="text-xs text-gray-500 mt-1">
                  Day {calculateDayNumber(formData.start_date)} of renovation
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                min={formData.start_date || "2025-10-01"}
                max="2025-11-30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
              {formData.end_date && (
                <p className="text-xs text-gray-500 mt-1">
                  Day {calculateDayNumber(formData.end_date)} of renovation
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Entry
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}