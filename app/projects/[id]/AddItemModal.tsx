'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface AddItemModalProps {
  projectId: number
  rooms: any[]
  categories: any[]
  vendors: any[]
  onClose: () => void
  onSuccess: () => void
}

export default function AddItemModal({ 
  projectId, 
  rooms, 
  categories, 
  vendors, 
  onClose, 
  onSuccess 
}: AddItemModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    room_id: '',
    category_id: '',
    quantity: '1',
    unit_price: '',
    estimated_cost: '',
    actual_cost: '',
    vendor: '',
    status: 'pending',
    type: 'material',
    notes: '',
    long_notes: ''
  })

  useEffect(() => {
    const qty = parseFloat(formData.quantity) || 0
    const price = parseFloat(formData.unit_price) || 0
    const estimated = qty * price
    setFormData(prev => ({ ...prev, estimated_cost: estimated.toString() }))
  }, [formData.quantity, formData.unit_price])

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
      const response = await fetch(`/api/projects/${projectId}/budget-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...formData,
          room_id: formData.room_id ? parseInt(formData.room_id) : null,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          quantity: parseInt(formData.quantity) || 1,
          unit_price: parseFloat(formData.unit_price) || 0,
          estimated_cost: parseFloat(formData.estimated_cost) || 0,
          actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
          notes: formData.notes,
          long_notes: formData.long_notes,
          status: formData.status,
          type: formData.type
        })
      })
      
      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        console.error('Error creating item:', error)
        alert(error.error || 'Failed to create budget item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to create budget item')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-full max-w-5xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Budget Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="material"
                  checked={formData.type === 'material'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm">Material</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="labour"
                  checked={formData.type === 'labour'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm">Labour</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="service"
                  checked={formData.type === 'service'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm">Service</span>
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Paint, Tiles, Labor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Cost
              </label>
              <input
                type="number"
                step="0.01"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                value={formData.estimated_cost}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Cost
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.actual_cost}
                onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                placeholder="Leave empty if not yet purchased"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor: any) => (
                  <option key={vendor.id} value={vendor.name}>
                    {vendor.name} - {vendor.specialization}
                  </option>
                ))}
              </select>
            </div>
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
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="delivered">Delivered</option>
              <option value="installed">Installed</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quick Notes
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Brief notes or reminders"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Notes / Comments
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
              value={formData.long_notes}
              onChange={(e) => setFormData({ ...formData, long_notes: e.target.value })}
              placeholder="Enter detailed comments about this budget item, specifications, requirements, vendor discussions, etc."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use this field to capture comprehensive information about this budget item.
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium text-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg transition-colors"
            >
              Add Item
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}