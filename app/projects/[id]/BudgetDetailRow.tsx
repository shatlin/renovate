'use client'

import { motion } from 'framer-motion'
import {
  Package, Layers, ShoppingCart, MoreVertical, Sparkles,
  Edit2, Trash2, DollarSign, Hash, CheckCircle, Clock,
  AlertCircle, Truck, Archive, User
} from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

interface BudgetDetailRowProps {
  detail: any
  masterId: number
  projectId: number
  categories: any[]
  vendors: any[]
  onUpdate: () => void
  onEdit: (detail: any) => void
  onDelete: (detailId: number) => void
}

export default function BudgetDetailRow({
  detail,
  masterId,
  projectId,
  categories,
  vendors,
  onUpdate,
  onEdit,
  onDelete
}: BudgetDetailRowProps) {
  const { formatCurrency } = useCurrency()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'material': return <Package className="w-4 h-4" />
      case 'labour': return <Layers className="w-4 h-4" />
      case 'service': return <ShoppingCart className="w-4 h-4" />
      case 'other': return <MoreVertical className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'material': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'labour': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'service': return 'bg-green-100 text-green-700 border-green-200'
      case 'other': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3.5 h-3.5" />
      case 'delivered': return <Truck className="w-3.5 h-3.5" />
      case 'ordered': return <ShoppingCart className="w-3.5 h-3.5" />
      case 'installed': return <Archive className="w-3.5 h-3.5" />
      default: return <Clock className="w-3.5 h-3.5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'delivered': return 'text-blue-600 bg-blue-50'
      case 'ordered': return 'text-purple-600 bg-purple-50'
      case 'installed': return 'text-teal-600 bg-teal-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  // For detail records, use total_amount as the estimated cost
  const estimatedAmount = detail.total_amount || detail.estimated_cost || 0
  const actualAmount = detail.actual_cost || 0
  const variance = actualAmount - estimatedAmount
  const hasActualCost = detail.actual_cost !== null && detail.actual_cost !== undefined

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ x: 4 }}
      className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Type & Name */}
          <div className="flex items-center gap-3 flex-1">
            {/* Type Badge */}
            <div className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-lg border
              ${getTypeColor(detail.type)}
            `}>
              {getTypeIcon(detail.type)}
              <span className="text-xs font-medium capitalize">
                {detail.type}
              </span>
            </div>

            {/* Name & Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h5 className="font-medium text-gray-900">
                  {detail.name}
                </h5>
                {detail.category_name && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {detail.category_name}
                  </span>
                )}
              </div>
              {detail.description && (
                <p className="text-xs text-gray-500 mt-0.5">{detail.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {detail.quantity > 1 && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Hash className="w-3 h-3" />
                    {detail.quantity} units
                  </span>
                )}
                {detail.vendor && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    {detail.vendor}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Middle Section - Pricing */}
          <div className="flex items-center gap-6 px-4">
            {/* Unit Price */}
            {detail.unit_price > 0 && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Unit</p>
                <p className="text-sm font-medium text-gray-700">
                  {formatCurrency(detail.unit_price)}
                </p>
              </div>
            )}

            {/* Estimated */}
            <div className="text-center">
              <p className="text-xs text-gray-500">Estimated</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(estimatedAmount)}
              </p>
            </div>

            {/* Actual */}
            <div className="text-center">
              <p className="text-xs text-gray-500">Actual</p>
              <p className={`text-sm font-semibold ${hasActualCost ? 'text-gray-900' : 'text-gray-400'}`}>
                {hasActualCost ? formatCurrency(actualAmount) : '-'}
              </p>
            </div>

            {/* Variance */}
            {hasActualCost && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Variance</p>
                <p className={`text-sm font-semibold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                </p>
              </div>
            )}
          </div>

          {/* Right Section - Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Status */}
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-lg
              ${getStatusColor(detail.status)}
            `}>
              {getStatusIcon(detail.status)}
              <span className="text-xs font-medium capitalize">
                {detail.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(detail)}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(detail.id)}
                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Notes preview if available */}
        {(detail.notes || detail.long_notes) && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 italic">
              {detail.notes || detail.long_notes}
            </p>
          </div>
        )}
      </div>

      {/* Progress indicator for actual vs estimated */}
      {estimatedAmount > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 rounded-b-lg overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${Math.min(100, (actualAmount / estimatedAmount) * 100)}%` 
            }}
            className={`h-full ${
              actualAmount > estimatedAmount 
                ? 'bg-red-500' 
                : 'bg-green-500'
            }`}
          />
        </div>
      )}
    </motion.div>
  )
}