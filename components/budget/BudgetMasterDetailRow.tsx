'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronRight, Plus, Edit2, Trash2, Package, 
  HardHat, Wrench, MoreHorizontal, ShoppingCart, DollarSign,
  Calendar, FileText, Hash
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
  purchase_date?: string
  invoice_number?: string
  notes?: string
}

interface BudgetMasterRowProps {
  item: {
    id: number
    name: string
    description?: string
    room_name?: string
    category_name?: string
    category_icon?: string
    category_color?: string
    estimated_cost: number
    actual_cost?: number
    total_material: number
    total_labour: number
    total_service: number
    total_other: number
    total_new_item: number
    detail_count: number
    details?: BudgetDetail[]
    status: string
  }
  onAddDetail: (masterId: number) => void
  onEditMaster: (item: any) => void
  onDeleteMaster: (masterId: number) => void
  onEditDetail: (detail: BudgetDetail) => void
  onDeleteDetail: (detailId: number) => void
}

const getDetailTypeIcon = (type: string) => {
  switch (type) {
    case 'material': return Package
    case 'labour': return HardHat
    case 'service': return Wrench
    case 'new_item': return ShoppingCart
    default: return MoreHorizontal
  }
}

const getDetailTypeColor = (type: string) => {
  switch (type) {
    case 'material': return 'text-blue-500 bg-blue-50'
    case 'labour': return 'text-green-500 bg-green-50'
    case 'service': return 'text-purple-500 bg-purple-50'
    case 'new_item': return 'text-orange-500 bg-orange-50'
    default: return 'text-gray-500 bg-gray-50'
  }
}

export default function BudgetMasterDetailRow({
  item,
  onAddDetail,
  onEditMaster,
  onDeleteMaster,
  onEditDetail,
  onDeleteDetail
}: BudgetMasterRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [details, setDetails] = useState<BudgetDetail[]>(item.details || [])

  const loadDetails = async () => {
    if (details.length > 0 || loadingDetails) return
    
    setLoadingDetails(true)
    try {
      const response = await fetch(`/api/budget-items/${item.id}/details`)
      if (response.ok) {
        const data = await response.json()
        setDetails(data)
      }
    } catch (error) {
      console.error('Failed to load details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const toggleExpand = () => {
    if (!isExpanded && details.length === 0) {
      loadDetails()
    }
    setIsExpanded(!isExpanded)
  }

  // Use the master record's estimated_cost and actual_cost directly
  const estimatedTotal = item.estimated_cost || 0
  const actualTotal = item.actual_cost || 0
  const variance = actualTotal - estimatedTotal
  const hasActualCost = actualTotal !== null && actualTotal !== undefined && actualTotal > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      {/* Master Row */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <button
                onClick={toggleExpand}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  {item.room_name && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                      {item.room_name}
                    </span>
                  )}
                  {item.category_name && (
                    <span 
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ 
                        backgroundColor: `${item.category_color}15`,
                        color: item.category_color 
                      }}
                    >
                      {item.category_name}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                    {item.detail_count} items
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Breakdown by type */}
              <div className="flex gap-3 text-base">
                {item.total_material > 0 && (
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">R{item.total_material.toLocaleString()}</span>
                  </div>
                )}
                {item.total_labour > 0 && (
                  <div className="flex items-center gap-1">
                    <HardHat className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">R{item.total_labour.toLocaleString()}</span>
                  </div>
                )}
                {item.total_service > 0 && (
                  <div className="flex items-center gap-1">
                    <Wrench className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">R{item.total_service.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Budget Summary */}
              <div className="flex items-center space-x-6">
                {/* Estimated */}
                <div className="text-center">
                  <div className="text-xs text-gray-500">Estimated</div>
                  <div className="text-base font-semibold text-gray-900">
                    R{estimatedTotal.toLocaleString()}
                  </div>
                </div>
                
                {/* Actual */}
                <div className="text-center">
                  <div className="text-xs text-gray-500">Actual</div>
                  <div className={`text-xl font-semibold ${hasActualCost ? 'text-gray-900' : 'text-gray-400'}`}>
                    {hasActualCost ? `R${actualTotal.toLocaleString()}` : '-'}
                  </div>
                </div>
                
                {/* Variance */}
                {hasActualCost && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Variance</div>
                    <div className={`text-xl font-semibold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {variance > 0 ? '+' : ''}R{Math.abs(variance).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onAddDetail(item.id)}
                  className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditMaster(item)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onDeleteMaster(item.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Rows */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : details.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No detail items yet</p>
                    <button
                      onClick={() => onAddDetail(item.id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      Add First Detail Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {details.map((detail) => {
                      const Icon = getDetailTypeIcon(detail.detail_type)
                      const colorClass = getDetailTypeColor(detail.detail_type)
                      
                      return (
                        <motion.div
                          key={detail.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{detail.name}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                                  {detail.detail_type}
                                </span>
                              </div>
                              {detail.description && (
                                <p className="text-sm text-gray-600">{detail.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  {detail.quantity} × ${detail.unit_price}
                                </span>
                                {detail.vendor && (
                                  <span>{detail.vendor}</span>
                                )}
                                {detail.invoice_number && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {detail.invoice_number}
                                  </span>
                                )}
                                {detail.purchase_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(detail.purchase_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                ${detail.total_amount.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => onEditDetail(detail)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                              <button
                                onClick={() => onDeleteDetail(detail.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}