'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronRight, Plus, Edit2, Trash2, Package,
  Layers, DollarSign, AlertCircle, CheckCircle, Clock,
  ShoppingCart, Truck, Home, MoreVertical, Sparkles,
  TrendingUp, TrendingDown, Hash, Calculator
} from 'lucide-react'
import BudgetDetailRow from './BudgetDetailRow'
import AddDetailModal from './AddDetailModal'
import { useCurrency } from '@/contexts/CurrencyContext'

interface BudgetMasterRowProps {
  master: any
  rooms: any[]
  categories: any[]
  vendors: any[]
  onUpdate: () => void
  onEdit: (master: any) => void
  onDelete: (masterId: number) => void
  onNotesClick: (master: any) => void
}

export default function BudgetMasterRow({
  master,
  rooms,
  categories,
  vendors,
  onUpdate,
  onEdit,
  onDelete,
  onNotesClick
}: BudgetMasterRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddDetail, setShowAddDetail] = useState(false)
  const [editingDetail, setEditingDetail] = useState<any>(null)
  const [details, setDetails] = useState(master.details || [])
  const { formatCurrency } = useCurrency()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'approved': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3.5 h-3.5" />
      case 'in_progress': return <Clock className="w-3.5 h-3.5" />
      case 'approved': return <Sparkles className="w-3.5 h-3.5" />
      case 'pending': return <AlertCircle className="w-3.5 h-3.5" />
      default: return <Package className="w-3.5 h-3.5" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'material': return <Package className="w-4 h-4 text-blue-500" />
      case 'labour': return <Layers className="w-4 h-4 text-purple-500" />
      case 'service': return <ShoppingCart className="w-4 h-4 text-green-500" />
      case 'other': return <MoreVertical className="w-4 h-4 text-gray-500" />
      default: return <Sparkles className="w-4 h-4 text-yellow-500" />
    }
  }

  const variance = master.total_actual - master.total_estimated
  const variancePercent = master.total_estimated > 0 
    ? ((variance / master.total_estimated) * 100).toFixed(1)
    : '0'

  const typeBreakdown = details.reduce((acc: any, detail: any) => {
    if (!acc[detail.type]) {
      acc[detail.type] = { count: 0, estimated: 0, actual: 0 }
    }
    acc[detail.type].count++
    acc[detail.type].estimated += detail.estimated_cost || 0
    acc[detail.type].actual += detail.actual_cost || 0
    return acc
  }, {})

  const handleDeleteDetail = async (detailId: number) => {
    if (!confirm('Are you sure you want to delete this detail item?')) return
    
    try {
      const response = await fetch(`/api/projects/${master.project_id}/budget-masters/${master.id}/details/${detailId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setDetails(details.filter((d: any) => d.id !== detailId))
        onUpdate()
      }
    } catch (error) {
      console.error('Error deleting detail:', error)
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        {/* Master Row */}
        <div className={`
          relative bg-white rounded-xl border transition-all duration-300
          ${isExpanded 
            ? 'border-blue-200 shadow-lg shadow-blue-100/50 ring-2 ring-blue-100' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }
        `}>
          {/* Gradient accent line */}
          <div className={`
            absolute inset-x-0 top-0 h-1 rounded-t-xl transition-all duration-300
            ${isExpanded 
              ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' 
              : 'bg-gradient-to-r from-gray-200 to-gray-300'
            }
          `} />
          
          <div className="p-4 pt-5">
            <div className="flex items-center gap-4">
              {/* Expand/Collapse Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                  p-2 rounded-lg transition-all duration-300
                  ${isExpanded 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </motion.button>

              {/* Master Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {master.name}
                      </h3>
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-medium border
                        ${getStatusColor(master.status)}
                      `}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(master.status)}
                          {master.status.replace('_', ' ')}
                        </span>
                      </span>
                      {master.room_name && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                          <Home className="w-3 h-3" />
                          {master.room_name}
                        </span>
                      )}
                    </div>
                    {master.description && (
                      <p className="text-sm text-gray-600 mt-1">{master.description}</p>
                    )}
                    
                    {/* Type breakdown badges */}
                    <div className="flex items-center gap-2 mt-2">
                      {Object.entries(typeBreakdown).map(([type, data]: any) => (
                        <motion.div
                          key={type}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          {getTypeIcon(type)}
                          <span className="text-xs font-medium text-gray-700">
                            {data.count} {type}
                          </span>
                        </motion.div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddDetail(true)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium shadow-sm hover:shadow-md transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add Detail
                      </motion.button>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="flex items-start gap-6">
                    {/* Estimated */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Estimated</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(master.total_estimated || 0)}
                      </p>
                    </div>

                    {/* Actual */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Actual</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(master.total_actual || 0)}
                      </p>
                    </div>

                    {/* Variance */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Variance</p>
                      <div className={`flex items-center gap-1 ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {variance > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <p className="text-lg font-semibold">
                          {formatCurrency(Math.abs(variance))}
                        </p>
                        <span className="text-xs">
                          ({variancePercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(master)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNotesClick(master)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      >
                        <Hash className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(master.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 overflow-hidden"
            >
              <div className="pl-14 pr-4 pb-4">
                {/* Details Header */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Detail Items ({details.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Total: {formatCurrency(master.total_estimated || 0)}
                    </span>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-2">
                  {details.length > 0 ? (
                    details.map((detail: any) => (
                      <BudgetDetailRow
                        key={detail.id}
                        detail={detail}
                        masterId={master.id}
                        projectId={master.project_id}
                        categories={categories}
                        vendors={vendors}
                        onUpdate={onUpdate}
                        onEdit={setEditingDetail}
                        onDelete={handleDeleteDetail}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
                    >
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No detail items yet</p>
                      <button
                        onClick={() => setShowAddDetail(true)}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add First Detail
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add/Edit Detail Modal */}
      {(showAddDetail || editingDetail) && (
        <AddDetailModal
          masterId={master.id}
          projectId={master.project_id}
          detail={editingDetail}
          categories={categories}
          vendors={vendors}
          onClose={() => {
            setShowAddDetail(false)
            setEditingDetail(null)
          }}
          onSuccess={(newDetail) => {
            if (editingDetail) {
              setDetails(details.map((d: any) => 
                d.id === newDetail.id ? newDetail : d
              ))
            } else {
              setDetails([...details, newDetail])
            }
            setShowAddDetail(false)
            setEditingDetail(null)
            onUpdate()
          }}
        />
      )}
    </>
  )
}