'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit3, Tag, Home, DollarSign, Calculator, FileText, Users, Layers, CheckCircle } from 'lucide-react'

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
    quantity: item.quantity?.toString() || '1',
    unit_price: item.unit_price?.toString() || '',
    estimated_cost: item.estimated_cost?.toString() || '',
    actual_cost: item.actual_cost?.toString() || '',
    vendor: item.vendor || '',
    status: item.status || 'pending',
    type: item.type || 'material',
    notes: item.notes || '',
    long_notes: item.long_notes || ''
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
      const response = await fetch(`/api/projects/${projectId}/budget-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          room_id: formData.room_id ? parseInt(formData.room_id) : null,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          quantity: parseInt(formData.quantity) || 1,
          unit_price: parseFloat(formData.unit_price) || 0,
          estimated_cost: parseFloat(formData.estimated_cost) || 0,
          actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
          notes: formData.notes,
          long_notes: formData.long_notes
        })
      })
      
      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating item:', error)
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
          className="relative bg-white rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom right, #ffffff, #fafafa)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.03)'
          }}
        >
          {/* Decorative gradient orbs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
          
          {/* Header with gradient and glass effect */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-5 border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-cyan-600/10 to-emerald-600/10" />
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
                  <p className="text-xs text-slate-300 mt-0.5">Update details for: {item.name}</p>
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
            {/* Type Selection - Compact inline */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Item Type
              </label>
              <div className="flex gap-2">
                {['material', 'labour', 'service'].map((type) => (
                  <motion.label
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 relative cursor-pointer`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`
                      px-4 py-2.5 rounded-lg border-2 text-center font-medium text-sm capitalize transition-all
                      ${formData.type === type 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-200/50' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}
                    `}>
                      {type}
                    </div>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Main Grid - More compact with 3 columns */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <Edit3 className="w-3.5 h-3.5" />
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kitchen Cabinets, Flooring, Plumbing"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <Home className="w-3.5 h-3.5" />
                  Room
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm"
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

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  Category
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm"
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

              <div className="col-span-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  Description
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the item"
                />
              </div>
            </div>

            {/* Pricing Section with visual feedback */}
            <div className="bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-xl p-4 mb-6 border border-gray-100">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    Unit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    <Calculator className="w-3.5 h-3.5" />
                    Estimated
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      readOnly
                      className="w-full px-4 py-2.5 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-700 font-semibold"
                      value={formData.estimated_cost}
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: formData.estimated_cost ? 1 : 0 }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Actual Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                    value={formData.actual_cost}
                    onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                    placeholder="If purchased"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <Users className="w-3.5 h-3.5" />
                  Vendor
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm"
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['pending', 'ordered', 'delivered'].map((status) => (
                    <motion.button
                      key={status}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, status })}
                      className={`
                        px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-all
                        ${formData.status === status 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}
                      `}
                    >
                      {status}
                    </motion.button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['installed', 'completed'].map((status) => (
                    <motion.button
                      key={status}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, status })}
                      className={`
                        px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-all
                        ${formData.status === status 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}
                      `}
                    >
                      {status}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section - Compact */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Quick Notes
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Brief notes or reminders"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Detailed Comments
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm resize-none"
                  rows={1}
                  value={formData.long_notes}
                  onChange={(e) => setFormData({ ...formData, long_notes: e.target.value })}
                  placeholder="Specifications, requirements, vendor discussions..."
                />
              </div>
            </div>

            {/* Action Buttons with 3D effect */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
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
                whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -10px rgba(16, 185, 129, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg shadow-lg transition-all"
              >
                Update Item
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}