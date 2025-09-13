'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Package, Layers, ShoppingCart, MoreVertical, Sparkles,
  DollarSign, Calculator, Tag, Users, FileText, Hash,
  TrendingUp, Save, AlertCircle
} from 'lucide-react'

interface AddDetailModalProps {
  masterId: number
  projectId: number
  detail?: any
  categories: any[]
  vendors: any[]
  onClose: () => void
  onSuccess: (detail: any) => void
}

export default function AddDetailModal({
  masterId,
  projectId,
  detail,
  categories,
  vendors,
  onClose,
  onSuccess
}: AddDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    type: detail?.type || 'material',
    name: detail?.name || '',
    description: detail?.description || '',
    category_id: detail?.category_id?.toString() || '',
    quantity: detail?.quantity?.toString() || '1',
    unit_price: detail?.unit_price?.toString() || '',
    estimated_cost: detail?.estimated_cost?.toString() || '',
    actual_cost: detail?.actual_cost?.toString() || '',
    vendor: detail?.vendor || '',
    status: detail?.status || 'pending',
    notes: detail?.notes || '',
    long_notes: detail?.long_notes || ''
  })

  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const qty = parseFloat(formData.quantity) || 0
    const price = parseFloat(formData.unit_price) || 0
    const estimated = qty * price
    setFormData(prev => ({ ...prev, estimated_cost: estimated.toString() }))
  }, [formData.quantity, formData.unit_price])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
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

  const validateForm = () => {
    const newErrors: any = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (parseFloat(formData.quantity) <= 0) newErrors.quantity = 'Quantity must be greater than 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      const url = detail
        ? `/api/projects/${projectId}/budget-items/${masterId}/details/${detail.id}`
        : `/api/projects/${projectId}/budget-items/${masterId}/details`
      
      const response = await fetch(url, {
        method: detail ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          quantity: parseInt(formData.quantity) || 1,
          unit_price: parseFloat(formData.unit_price) || 0,
          estimated_cost: parseFloat(formData.estimated_cost) || 0,
          actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        onSuccess(detail ? data.detail : data.detail)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save detail')
      }
    } catch (error) {
      console.error('Error saving detail:', error)
      alert('Failed to save detail')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'material': return <Package className="w-4 h-4" />
      case 'labour': return <Layers className="w-4 h-4" />
      case 'service': return <ShoppingCart className="w-4 h-4" />
      case 'other': return <MoreVertical className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const types = [
    { value: 'material', label: 'Material', icon: <Package className="w-4 h-4" />, color: 'blue' },
    { value: 'labour', label: 'Labour', icon: <Layers className="w-4 h-4" />, color: 'purple' },
    { value: 'service', label: 'Service', icon: <ShoppingCart className="w-4 h-4" />, color: 'green' },
    { value: 'new_item', label: 'New Item', icon: <Sparkles className="w-4 h-4" />, color: 'yellow' },
    { value: 'other', label: 'Other', icon: <MoreVertical className="w-4 h-4" />, color: 'gray' }
  ]

  const statuses = ['pending', 'ordered', 'delivered', 'installed', 'completed']

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom right, #ffffff, #fafafa)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Decorative gradient orb */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 px-6 py-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"
                >
                  {getTypeIcon(formData.type)}
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {detail ? 'Edit Detail Item' : 'Add Detail Item'}
                  </h2>
                  <p className="text-xs text-indigo-200">Add specifics to your budget item</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-all group"
              >
                <X className="w-5 h-5 text-white/70 group-hover:text-white" />
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Type Selection */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Detail Type
              </label>
              <div className="grid grid-cols-5 gap-2">
                {types.map((type) => (
                  <motion.label
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`
                      flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                      ${formData.type === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700 shadow-lg`
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                    `}>
                      {type.icon}
                      <span className="text-xs font-medium">{type.label}</span>
                    </div>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Main Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <Package className="w-3.5 h-3.5" />
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Floor Tiles"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  Category
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                Description
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the item"
              />
            </div>

            {/* Pricing Grid */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    <Hash className="w-3.5 h-3.5" />
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-all ${
                      errors.quantity ? 'border-red-500' : 'border-gray-200'
                    }`}
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-all"
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
                      className="w-full px-4 py-2.5 border border-indigo-200 rounded-lg bg-indigo-50 text-indigo-700 font-semibold"
                      value={formData.estimated_cost}
                    />
                    {parseFloat(formData.estimated_cost) > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Actual Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-all"
                    value={formData.actual_cost}
                    onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                    placeholder="If purchased"
                  />
                </div>
              </div>
            </div>

            {/* Vendor and Status */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  <Users className="w-3.5 h-3.5" />
                  Vendor
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
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
                <div className="flex gap-2">
                  {statuses.map((status) => (
                    <motion.button
                      key={status}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, status })}
                      className={`
                        flex-1 px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-all
                        ${formData.status === status
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      {status}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Notes
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes or specifications..."
              />
            </div>

            {/* Actions */}
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
                whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : (detail ? 'Update Detail' : 'Add Detail')}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}