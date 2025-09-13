'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Package, HardHat, Wrench, ShoppingCart, 
  MoreHorizontal, Save, Hash, DollarSign,
  FileText, Calculator, Building2, Edit3,
  Tag, Layers
} from 'lucide-react'

interface BudgetDetail {
  id: number
  detail_type: 'material' | 'labour' | 'service' | 'other' | 'new_item'
  name: string
  description?: string
  quantity: number
  unit_price: number
  total_amount: number
  vendor?: string
  notes?: string
}

interface EditDetailModalProps {
  isOpen: boolean
  detail: BudgetDetail | null
  masterName: string
  onClose: () => void
  onSuccess: () => void
}

const detailTypes = [
  { value: 'material', label: 'Material', icon: Package, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50', borderColor: 'border-blue-200' },
  { value: 'labour', label: 'Labour', icon: HardHat, color: 'from-green-500 to-emerald-500', bgColor: 'from-green-50 to-emerald-50', borderColor: 'border-green-200' },
  { value: 'service', label: 'Service', icon: Wrench, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50', borderColor: 'border-purple-200' },
  { value: 'new_item', label: 'New Item', icon: ShoppingCart, color: 'from-orange-500 to-yellow-500', bgColor: 'from-orange-50 to-yellow-50', borderColor: 'border-orange-200' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'from-gray-500 to-slate-500', bgColor: 'from-gray-50 to-slate-50', borderColor: 'border-gray-200' }
]

export default function EditDetailModal({ 
  isOpen, 
  detail,
  masterName,
  onClose, 
  onSuccess 
}: EditDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    detail_type: 'material',
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    vendor: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const selectedType = detailTypes.find(t => t.value === formData.detail_type)

  useEffect(() => {
    if (detail) {
      setFormData({
        detail_type: detail.detail_type || 'material',
        name: detail.name || '',
        description: detail.description || '',
        quantity: detail.quantity || 1,
        unit_price: detail.unit_price || 0,
        vendor: detail.vendor || '',
        notes: detail.notes || ''
      })
    }
  }, [detail])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!detail) return
    
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/budget-details/${detail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_amount: formData.quantity * formData.unit_price
        })
      })

      if (!response.ok) throw new Error('Failed to update detail')

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating detail:', error)
      alert('Failed to update detail')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAmount = formData.quantity * formData.unit_price

  if (!detail) return null

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white rounded-3xl w-[90vw] max-w-[1400px] max-h-[85vh] overflow-hidden shadow-2xl relative"
            style={{
              transformStyle: 'preserve-3d',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedType?.color}`} />
            </div>

            {/* Header with gradient and 3D effect */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`relative px-8 py-6 bg-gradient-to-r ${selectedType?.color} overflow-hidden`}
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
                  className="flex items-center gap-4"
                >
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Edit Budget Detail</h2>
                    <p className="text-white/80 mt-1">for {masterName}</p>
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

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(85vh-200px)]">
              <div className="space-y-6">
                {/* Detail Type Selection with animations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Layers className="w-4 h-4 inline mr-2" />
                    Detail Type
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {detailTypes.map((type, index) => {
                      const Icon = type.icon
                      const isSelected = formData.detail_type === type.value
                      return (
                        <motion.button
                          key={type.value}
                          type="button"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, detail_type: type.value })}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            isSelected 
                              ? `bg-gradient-to-br ${type.bgColor} ${type.borderColor} shadow-lg` 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-gray-800' : 'text-gray-500'}`} />
                          <div className={`text-sm font-medium ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                            {type.label}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                {/* Main form fields in grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-6"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4 inline mr-2" />
                      Item Name *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                      placeholder="e.g., Premium Floor Tiles, Electrical Wiring"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Description
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                      placeholder="Brief description of the item"
                    />
                  </div>
                </motion.div>

                {/* Quantity, Price and Vendor */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-4 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-2" />
                      Quantity *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Unit Price *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calculator className="w-4 h-4 inline mr-2" />
                      Total Amount
                    </label>
                    <div className={`px-4 py-3 bg-gradient-to-br ${selectedType?.bgColor} rounded-xl border-2 ${selectedType?.borderColor}`}>
                      <span className="text-lg font-bold text-gray-800">
                        R {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Preferred Vendor
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                      placeholder="e.g., Builders Warehouse"
                    />
                  </div>
                </motion.div>

                {/* Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Notes
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                    placeholder="Any additional notes about this budget item..."
                  />
                </motion.div>

                {/* Current vs New comparison */}
                {detail && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200"
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Budget Impact</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xs text-gray-500">Current Budget</div>
                        <div className="text-lg font-bold text-gray-700">R {detail.total_amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">New Budget</div>
                        <div className="text-lg font-bold text-blue-600">R {totalAmount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Difference</div>
                        <div className={`text-lg font-bold ${totalAmount > detail.total_amount ? 'text-red-600' : 'text-green-600'}`}>
                          {totalAmount > detail.total_amount ? '+' : ''}R {(totalAmount - detail.total_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-100"
              >
                <div className="text-sm text-gray-500">
                  Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd> or click outside to cancel
                </div>
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting}
                    className={`px-8 py-3 bg-gradient-to-r ${selectedType?.color} text-white rounded-xl font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                    style={{
                      boxShadow: isSubmitting ? 'none' : '0 10px 25px -5px rgba(147, 51, 234, 0.3)'
                    }}
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Updating...
                      </span>
                    ) : (
                      'Update Detail'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}